import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const socialImageUrl = "https://jrgrace.com/assets/jr-grace-social-preview.jpg?v=20261105-1";
const socialImage = await readFile(path.join(root, "assets/jr-grace-social-preview.jpg"));

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("Could not read social preview image dimensions.");
}

assert.deepEqual(jpegDimensions(socialImage), { width: 1200, height: 630 });
assert.ok(socialImage.length > 50_000, "Social preview image should be a production-quality JPEG");

const htmlFiles = (await readdir(root)).filter(name => name.endsWith(".html"));
assert.equal(htmlFiles.length, 25);
for (const name of htmlFiles) {
  const source = await readFile(path.join(root, name), "utf8");
  assert.match(source, /<meta\s+name="description"\s+[^>]*content="[^"]+"/i, `${name} is missing a description`);
  assert.match(source, /<meta\s+property="og:title"\s+[^>]*content="[^"]+"/i, `${name} is missing an Open Graph title`);
  assert.match(source, /<meta\s+property="og:description"\s+[^>]*content="[^"]+"/i, `${name} is missing an Open Graph description`);
  assert.match(source, /<meta\s+property="og:image"\s+[^>]*content="[^"]+"/i, `${name} is missing an Open Graph image`);
  assert.match(source, /<meta\s+name="twitter:card"\s+content="summary_large_image"/i, `${name} is missing a large Twitter card`);
  assert.match(source, /<meta\s+name="twitter:image"\s+[^>]*content="[^"]+"/i, `${name} is missing a Twitter image`);
  if (name !== "rental-detail.html") {
    assert.match(source, new RegExp(socialImageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} is not using the shared social image`);
  }
}

const rentalDetail = await readFile(path.join(root, "rental-detail.html"), "utf8");
const rentalClient = await readFile(path.join(root, "rental-detail.js"), "utf8");
const rentalServer = await readFile(path.join(root, "functions/_shared/rental-seo.js"), "utf8");
assert.match(rentalDetail, /id="twitterImage"/);
assert.match(rentalClient, /setMeta\('#twitterImage',image\)/);
assert.match(rentalServer, /setMeta\(html, "twitterImage", meta\.photos\[0\]\)/);

console.log("Site descriptions and social preview metadata checks passed.");
