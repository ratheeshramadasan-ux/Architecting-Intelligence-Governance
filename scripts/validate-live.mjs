import { readdir } from "node:fs/promises";

const origin = process.argv[2] || "https://architecting-ai.rrlabs.ca";
const pageNames = (await readdir(new URL("../greenfield-portal/pages/", import.meta.url)))
  .filter((name) => name.endsWith(".html") && !name.includes("_test") && !name.endsWith(".bak"))
  .sort();
const paths = ["/", ...pageNames.map((name) => `/pages/${name}`)];
const brokenText = /(?:Â|Ã|â€|â„|â†|ðŸ|�)/u;
const failures = [];

for (const path of paths) {
  const response = await fetch(`${origin}${path}`, { redirect: "follow" });
  const body = await response.text();
  const problems = [];
  if (response.status !== 200) problems.push(`HTTP ${response.status}`);
  if (brokenText.test(body)) problems.push("mis-encoded text");
  if (!/name=["']viewport["']/i.test(body)) problems.push("missing viewport");
  if (!/charset\s*=\s*["']?utf-8/i.test(body)) problems.push("missing UTF-8 declaration");
  if (problems.length) failures.push({ path, problems });
  console.log(`${problems.length ? "FAIL" : "PASS"} ${path} -> ${new URL(response.url).pathname}`);
}

console.log(`\nChecked ${paths.length} live pages; ${failures.length} failed.`);
if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.path}: ${failure.problems.join(", ")}`);
  }
  process.exitCode = 1;
}
