const origin = process.argv[2] || "http://127.0.0.1:8787";
const failures = [];

async function check(name, path, validate, options = {}) {
  try {
    const response = await fetch(`${origin}${path}`, { redirect: "manual", ...options });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();
    const problem = validate(response, body);
    if (problem) failures.push(`${name}: ${problem}`);
    console.log(`${problem ? "FAIL" : "PASS"} ${name} -> HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL ${name} -> ${error.message}`);
  }
}

await check("homepage", "/", (response, body) => response.status !== 200 || !String(body).includes("<h1") ? "homepage did not render" : "");
await check("theme API", "/api/theme", (response, body) => response.status !== 200 || !body?.config || !body?.css_variables ? "theme contract missing" : "");
await check("navigation API", "/api/navigation", (response, body) => response.status !== 200 || !Array.isArray(body?.items) ? "navigation items missing" : "");
await check("anonymous identity", "/api/auth/me", (response, body) => response.status !== 200 || body?.user !== null ? "anonymous identity contract changed" : "");
await check("managed/static public page", "/pages/about.html", (response, body) => response.status !== 200 || !String(body).includes("<h1") ? "public page did not resolve" : "", { redirect: "follow" });
await check("member-only preview", "/pages/agentic-ai.html", (response, body) => response.status !== 200 || !String(body).includes("excerpt-lock") ? "anonymous preview gate missing" : "", { redirect: "follow" });
await check("admin authentication gate", "/admin", (response) => response.status !== 302 || !String(response.headers.get("location") || "").includes("/login?next=/admin") ? "admin did not redirect to sign-in" : "");
await check("local R2 missing object", "/downloads/local-validation-missing-object", (response) => ![401, 404].includes(response.status) ? "unexpected download response" : "");

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log(`Local Worker contract: PASS (${origin})`);
}
