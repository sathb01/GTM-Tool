import { createServer } from "node:http";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const toolDir = path.join(rootDir, "tool");
const dataDir = path.join(__dirname, "data");
const recordsPath = path.join(dataDir, "records.json");
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const openAiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const toolPassword = process.env.TOOL_PASSWORD || "";
const authSecret = process.env.AUTH_SECRET || toolPassword || "local-dev-secret";
const sessionMaxAgeSeconds = 60 * 60 * 12;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function setSecurityHeaders(response) {
  response.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'"
  ].join("; "));
  response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function parseCookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        return [
          decodeURIComponent(cookie.slice(0, separator)),
          decodeURIComponent(cookie.slice(separator + 1))
        ];
      })
  );
}

function sign(value) {
  return createHmac("sha256", authSecret).update(value).digest("hex");
}

function safeEqual(first, second) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    createdAt: Date.now(),
    nonce: randomUUID()
  })).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function isValidSessionToken(token) {
  const [payload, signature] = String(token || "").split(".");

  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Date.now() - Number(session.createdAt || 0) < sessionMaxAgeSeconds * 1000;
  } catch (error) {
    return false;
  }
}

function isAuthenticated(request) {
  if (!toolPassword) {
    return true;
  }

  return isValidSessionToken(parseCookies(request).gtm_session);
}

function redirectToLogin(response) {
  response.writeHead(302, { Location: "/login" });
  response.end();
}

function sendLoginPage(response, message = "") {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTM OS Login</title>
  <style>
    body { background: #f4f7fb; color: #162033; font-family: "Source Sans 3", Inter, "Segoe UI", Arial, sans-serif; margin: 0; }
    main { margin: 12vh auto; max-width: 420px; background: #fff; border: 1px solid #d6dee8; border-radius: 8px; padding: 24px; box-shadow: 0 8px 24px rgba(22,32,51,.08); }
    h1 { color: #213343; margin: 0 0 8px; }
    label { display: block; font-weight: 700; margin-bottom: 8px; }
    input { width: 100%; border: 1px solid #d6dee8; border-radius: 6px; box-sizing: border-box; font-size: 16px; padding: 11px; }
    input:focus-visible { border-color: #ff7a59; outline: 2px solid rgba(255,122,89,.32); outline-offset: 1px; }
    button { background: #ff7a59; border: 0; border-radius: 6px; color: #fff; cursor: pointer; font-size: 15px; font-weight: 700; margin-top: 14px; padding: 11px 16px; transition: background-color .16s ease; width: 100%; }
    button:hover { background: #536174; }
    button:focus-visible { outline: 3px solid rgba(255,122,89,.38); outline-offset: 2px; }
    p { color: #536174; line-height: 1.5; }
    .error { color: #b91c1c; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>GTM OS</h1>
    <p>Enter the access password to continue.</p>
    ${message ? `<p class="error">${message}</p>` : ""}
    <form method="post" action="/login">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus>
      <button type="submit">Open Tool</button>
    </form>
  </main>
</body>
</html>`);
}

async function handleAuth(request, response, url) {
  if (!toolPassword || url.pathname !== "/login") {
    return false;
  }

  if (request.method === "GET") {
    sendLoginPage(response);
    return true;
  }

  if (request.method === "POST") {
    const body = new URLSearchParams(await readRawBody(request));
    const password = String(body.get("password") || "");

    if (password !== toolPassword) {
      sendLoginPage(response, "Incorrect password.");
      return true;
    }

    const secure = String(request.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
    response.writeHead(302, {
      "Set-Cookie": `gtm_session=${encodeURIComponent(createSessionToken())}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionMaxAgeSeconds}${secure}`,
      Location: "/"
    });
    response.end();
    return true;
  }

  sendJson(response, 405, { error: "Method not allowed" });
  return true;
}

async function readRawBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readJsonBody(request) {
  const raw = await readRawBody(request);
  return raw ? JSON.parse(raw) : {};
}

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  if (!existsSync(recordsPath)) {
    await writeFile(recordsPath, "[]\n", "utf8");
  }
}

async function readRecords() {
  await ensureDataFile();
  const raw = await readFile(recordsPath, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeRecords(records) {
  await ensureDataFile();
  await writeFile(recordsPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function publicRecord(record) {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    data: record.data || {}
  };
}

async function handleRecords(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/records") {
    const records = await readRecords();
    sendJson(response, 200, { records: records.map(publicRecord) });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/records") {
    const body = await readJsonBody(request);
    const records = await readRecords();
    const now = new Date().toISOString();
    const record = {
      id: body.id || randomUUID(),
      name: body.name || body.data?.companyName || body.data?.website || "Untitled brand",
      data: body.data || {},
      createdAt: body.createdAt || now,
      updatedAt: now
    };

    records.push(record);
    await writeRecords(records);
    sendJson(response, 201, { record: publicRecord(record) });
    return true;
  }

  const match = url.pathname.match(/^\/api\/records\/([^/]+)$/);

  if (match && request.method === "GET") {
    const id = decodeURIComponent(match[1]);
    const records = await readRecords();
    const record = records.find((item) => item.id === id);

    if (!record) {
      sendJson(response, 404, { error: "Record not found" });
      return true;
    }

    sendJson(response, 200, { record: publicRecord(record) });
    return true;
  }

  if (match && request.method === "PUT") {
    const id = decodeURIComponent(match[1]);
    const body = await readJsonBody(request);
    const records = await readRecords();
    const now = new Date().toISOString();
    const existingIndex = records.findIndex((record) => record.id === id);
    const nextRecord = {
      id,
      name: body.name || body.data?.companyName || body.data?.website || "Untitled brand",
      data: body.data || {},
      createdAt: body.createdAt || records[existingIndex]?.createdAt || now,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      records[existingIndex] = nextRecord;
    } else {
      records.push(nextRecord);
    }

    await writeRecords(records);
    sendJson(response, 200, { record: publicRecord(nextRecord) });
    return true;
  }

  return false;
}

async function handleResearch(request, response, url) {
  if (request.method !== "POST" || url.pathname !== "/api/research") {
    return false;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 501, {
      error: "AI Research is not configured yet.",
      nextStep: "Add OPENAI_API_KEY in the server environment, then redeploy."
    });
    return true;
  }

  const body = await readJsonBody(request);
  const companyName = String(body.companyName || "").trim();
  const website = String(body.website || "").trim();

  if (!companyName && !website) {
    sendJson(response, 400, { error: "Add a company name or website first." });
    return true;
  }

  const schemaText = await readFile(path.join(toolDir, "intake-schema.js"), "utf8");
  const prompt = buildResearchPrompt({
    companyName,
    website,
    currentFields: body.currentFields || {},
    schemaText
  });
  const result = await callOpenAiResearch(prompt);

  sendJson(response, 200, result);
  return true;
}

function buildResearchPrompt({ companyName, website, currentFields, schemaText }) {
  return [
    "You are researching a company for a GTM readiness intake form.",
    "Use public web information where available. Do not invent facts. If a field is uncertain, leave it blank or note uncertainty in researchNotes.",
    "Return only valid JSON with this shape:",
    "{\"fields\": {\"fieldName\": \"value\"}, \"researchNotes\": \"short notes with source URLs\"}",
    "",
    "The fields object must be a flat object keyed by HTML field names from the intake.",
    "For tables, use keys like tableId__row-slug__columnId.",
    "For repeatable lists, use keys like fieldId__item-1, fieldId__item-2.",
    "",
    "Prioritize prefilling:",
    "- Company profile fields",
    "- Website URLs, social media, and public presence",
    "- GTM systems if visible",
    "- likely ICP, buyer roles, offer, proof assets, channels, triggers, and public risks",
    "",
    "Useful table key examples:",
    "- publicPresence__primary-website__url",
    "- publicPresence__product-solution-pages__url",
    "- publicPresence__pricing-page__url",
    "- publicPresence__demo-contact-booking-page__url",
    "- publicPresence__blog-resources-learning-center__url",
    "- publicPresence__linkedin-company-page__url",
    "- publicPresence__founder-executive-profiles__url",
    "- publicPresence__review-profiles-or-ratings-sites__url",
    "- gtmSystems__crm__tools",
    "- gtmSystems__website-analytics-conversion-tracking__tools",
    "",
    `Company name: ${companyName || "unknown"}`,
    `Website: ${website || "unknown"}`,
    "",
    "Current non-empty form fields:",
    JSON.stringify(currentFields, null, 2),
    "",
    "Intake schema source:",
    schemaText.slice(0, 40000)
  ].join("\n");
}

async function callOpenAiResearch(prompt) {
  const payload = {
    model: openAiModel,
    input: [
      {
        role: "system",
        content: "You are a careful GTM research assistant. Return compact JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    tools: [{ type: "web_search_preview" }]
  };

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const raw = await apiResponse.text();

  if (!apiResponse.ok) {
    throw new Error(`OpenAI research failed: ${raw}`);
  }

  const responseJson = JSON.parse(raw);
  const text = extractResponseText(responseJson);
  const parsed = parseJsonFromText(text);

  return {
    fields: parsed.fields || {},
    researchNotes: parsed.researchNotes || text || "AI research completed."
  };
}

function extractResponseText(responseJson) {
  if (responseJson.output_text) {
    return responseJson.output_text;
  }

  return (responseJson.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);

    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error("AI research returned a response that was not valid JSON.");
  }
}

async function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(toolDir, requestedPath));

  if (!filePath.startsWith(toolDir)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  try {
    const content = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0"
    });
    response.end(content);
  } catch (error) {
    sendJson(response, 404, { error: "Not found" });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  setSecurityHeaders(response);

  try {
    if (await handleAuth(request, response, url)) {
      return;
    }

    if (!isAuthenticated(request)) {
      if (url.pathname.startsWith("/api/")) {
        sendJson(response, 401, { error: "Authentication required." });
      } else {
        redirectToLogin(response);
      }
      return;
    }

    if (await handleRecords(request, response, url)) {
      return;
    }

    if (await handleResearch(request, response, url)) {
      return;
    }

    await serveStatic(response, decodeURIComponent(url.pathname));
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`GTM Tool server running on ${host}:${port}`);
});
