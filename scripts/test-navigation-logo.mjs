import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = await readFile(path.join(root, "assets/logo.svg"), "utf8");
const navigation = await readFile(path.join(root, "global-property-nav.js"), "utf8");

assert.match(logo, /^<svg[^>]+viewBox="0 0 450 113"/);
assert.match(logo, /J R Grace Realty/);
assert.match(logo, /#374a6a/);
assert.doesNotMatch(logo, /<rect[^>]+(?:width="450"|width="100%")/);

assert.match(navigation, /\/assets\/logo\.svg/);
assert.doesNotMatch(navigation, /assets\/logo\.png/);
assert.match(navigation, /const resolveLocalRootPaths = root =>/);
assert.equal((navigation.match(/resolveLocalRootPaths\(/g) || []).length, 2);

const siteFiles = (await readdir(root)).filter(name => /\.(?:html|css|js)$/.test(name));
for (const name of siteFiles) {
  const source = await readFile(path.join(root, name), "utf8");
  assert.doesNotMatch(source, /assets\/logo\.png/, `${name} still references the broken PNG wordmark`);
}

console.log("Navigation logo checks passed.");
