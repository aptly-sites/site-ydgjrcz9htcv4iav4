import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mark = await readFile(path.join(root, "assets/mark.svg"), "utf8");
const markContents = mark
  .replace(/^<svg[^>]*>/, "")
  .replace(/<title[^>]*>.*?<\/title>/s, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 113" role="img" aria-labelledby="logo-title" shape-rendering="geometricPrecision">
  <title id="logo-title">J R Grace Realty</title>
  <svg x="4" y="4" width="105" height="105" viewBox="0 0 107 107" aria-hidden="true">
    ${markContents}
  </svg>
  <path d="M123.5 15v83" fill="none" stroke="#374a6a" stroke-width="2"/>
  <text x="139" y="64" fill="#374a6a" font-family="Avenir Next, Montserrat, Arial, sans-serif" font-size="42" font-weight="400" letter-spacing="1">J R Grace</text>
  <text x="347" y="86" fill="#374a6a" font-family="Avenir Next, Montserrat, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="2.4">REALTY</text>
</svg>
`;

await writeFile(path.join(root, "assets/logo.svg"), logo);
