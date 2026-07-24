import { qaProfiles } from "./company-profiles.mjs";

const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = String(process.env.GTM_QA_COOKIE || "").trim();
const headers = cookie ? { Cookie: cookie } : {};
const keepIds = new Set(qaProfiles.map((profile) => profile.id));
const listResponse = await fetch(`${baseUrl}/api/records`, { headers });

if (!listResponse.ok) {
  throw new Error(`Could not list records: ${listResponse.status} ${await listResponse.text()}`);
}

const existing = (await listResponse.json()).records || [];
const oldQaRecords = existing.filter((record) => {
  const isQa = /^qa/i.test(String(record.id || "")) || /^qa\b/i.test(String(record.name || ""));
  return isQa && !keepIds.has(record.id);
});
const deleted = [];

for (const record of oldQaRecords) {
  const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(record.id)}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    throw new Error(`Could not delete ${record.id}: ${response.status} ${await response.text()}`);
  }
  deleted.push(record.id);
}

const finalResponse = await fetch(`${baseUrl}/api/records`, { headers });
if (!finalResponse.ok) throw new Error(`Could not verify records: ${finalResponse.status}`);
const finalRecords = (await finalResponse.json()).records || [];
const remainingOldQa = finalRecords.filter((record) => {
  const isQa = /^qa/i.test(String(record.id || "")) || /^qa\b/i.test(String(record.name || ""));
  return isQa && !keepIds.has(record.id);
});

const result = {
  baseUrl,
  recordsBefore: existing.length,
  deletedCount: deleted.length,
  deleted,
  recordsAfter: finalRecords.length,
  remainingOldQa: remainingOldQa.map((record) => record.id)
};

console.log(JSON.stringify(result, null, 2));
if (remainingOldQa.length) process.exitCode = 1;
