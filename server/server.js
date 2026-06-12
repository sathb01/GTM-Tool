import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
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

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
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

  sendJson(response, 501, {
    error: "AI Research backend is not connected yet.",
    nextStep: "Add OPENAI_API_KEY and implement the OpenAI research call in server/server.js."
  });
  return true;
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
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(content);
  } catch (error) {
    sendJson(response, 404, { error: "Not found" });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  try {
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
