import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = await readFile(path.join(root, "assets/logo.svg"), "utf8");
const navigation = await readFile(path.join(root, "global-property-nav.js"), "utf8");
const transitionStyles = await readFile(path.join(root, "navigation-scroll-fix.css"), "utf8");
const orbitStyles = await readFile(path.join(root, "orbit-navigation.css"), "utf8");

assert.match(logo, /^<svg[^>]+viewBox="0 0 450 113"/);
assert.match(logo, /J R Grace Realty/);
assert.match(logo, /#374a6a/);
assert.match(logo, /<text x="166" y="94"[^>]+font-size="20"[^>]+font-weight="700"[^>]+textLength="150"[^>]+>REALTY<\/text>/);
assert.doesNotMatch(logo, /<rect[^>]+(?:width="450"|width="100%")/);

assert.match(navigation, /\/assets\/logo\.svg/);
assert.doesNotMatch(navigation, /assets\/logo\.png/);
assert.match(navigation, /const resolveLocalRootPaths = root =>/);
assert.equal((navigation.match(/resolveLocalRootPaths\(/g) || []).length, 2);
assert.match(navigation, /const orbitStylesheet = ensureStylesheet\("orbit-navigation\.css"\)/);
assert.match(navigation, /class="jr-orbit-menu" style="display:none!important"/);
assert.match(navigation, /orbitStylesheet\?\.addEventListener\("load", releaseOrbitMenu/);
assert.match(navigation, /classList\.add\("jr-route-departing"\)/);
assert.doesNotMatch(transitionStyles, /@view-transition\s*\{\s*navigation\s*:\s*auto/);
assert.match(orbitStyles, /html\.jr-route-departing \.jr-orbit-menu/);

const siteFiles = (await readdir(root)).filter(name => /\.(?:html|css|js)$/.test(name));
for (const name of siteFiles) {
  const source = await readFile(path.join(root, name), "utf8");
  assert.doesNotMatch(source, /assets\/logo\.png/, `${name} still references the broken PNG wordmark`);
}

console.log("Navigation logo checks passed.");
