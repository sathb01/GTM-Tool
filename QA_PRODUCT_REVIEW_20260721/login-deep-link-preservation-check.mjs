import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const port = await new Promise((resolve, reject) => {
  const socket = net.createServer();
  socket.on("error", reject);
  socket.listen(0, "127.0.0.1", () => {
    const address = socket.address();
    socket.close(() => resolve(address.port));
  });
});
const password = "qa-login-password";
const recordId = "d0bfa377-cc99-4158-bbac-12dbb474abbb";
const destination = `/results.html?asset=icp&recordId=${recordId}&release=login-preservation-check`;
const server = spawn(process.execPath, ["server/server.js"], {
  cwd: root,
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), TOOL_PASSWORD: password, AUTH_SECRET: "qa-auth-secret" },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true
});
const results = [];

try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Test server did not start.")), 10000);
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("server running")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.once("exit", (code) => reject(new Error(`Test server exited with code ${code}.`)));
  });

  const unauthenticated = await fetch(`http://127.0.0.1:${port}${destination}`, { redirect: "manual" });
  const loginLocation = unauthenticated.headers.get("location") || "";
  results.push({ check: "protected deep link redirects to login", expected: 302, actual: unauthenticated.status });
  results.push({
    check: "login redirect preserves complete destination",
    expected: destination,
    actual: new URL(loginLocation, `http://127.0.0.1:${port}`).searchParams.get("returnTo")
  });

  const loginPage = await fetch(`http://127.0.0.1:${port}${loginLocation}`);
  const loginHtml = await loginPage.text();
  results.push({
    check: "login form carries the record-specific destination",
    expected: true,
    actual: loginHtml.includes(`name="returnTo" type="hidden" value="${destination.replaceAll("&", "&amp;")}"`)
  });

  const authenticated = await fetch(`http://127.0.0.1:${port}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password, returnTo: destination }),
    redirect: "manual"
  });
  results.push({ check: "successful login returns to exact company view", expected: destination, actual: authenticated.headers.get("location") });

  const unsafe = await fetch(`http://127.0.0.1:${port}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password, returnTo: "https://example.com/steal-session" }),
    redirect: "manual"
  });
  results.push({ check: "external login redirect is rejected", expected: "/", actual: unsafe.headers.get("location") });
} finally {
  server.kill();
}

const failures = results.filter((result) => result.actual !== result.expected);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failures.length, failed: failures.length, results }, null, 2));
if (failures.length) process.exitCode = 1;
