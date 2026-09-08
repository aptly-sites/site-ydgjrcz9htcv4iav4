import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8080);
const host = "127.0.0.1";
const blockedRoots = new Set([
  ".git",
  ".github",
  ".local-preview",
  ".next",
  ".vinext",
  ".wrangler",
  "app",
  "dist",
  "functions",
  "node_modules",
  "scripts",
]);
const blockedFiles = new Set([
  ".dev.vars",
  ".env",
  ".env.example",
  ".gitignore",
  "LOCAL-PREVIEW.md",
  "package-lock.json",
  "package.json",
]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

async function loadLocalEnvironment() {
  for (const filename of [".dev.vars", ".env"]) {
    try {
      const contents = await readFile(path.join(projectRoot, filename), "utf8");
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw Object.assign(new Error("Request is too large."), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function runPagesFunction(request, response, url) {
  const match = url.pathname.match(/^\/api\/([a-z0-9-]+)\/?$/i);
  if (!match) return false;

  const functionPath = path.join(projectRoot, "functions", "api", `${match[1]}.js`);
  try {
    const module = await import(`${pathToFileURL(functionPath).href}?local=${Date.now()}`);
    const methodHandler = module[`onRequest${request.method[0]}${request.method.slice(1).toLowerCase()}`];
    const handler = methodHandler || module.onRequest;
    if (typeof handler !== "function") {
      sendJson(response, 405, { message: "Method not allowed." });
      return true;
    }

    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
      else if (value !== undefined) headers.set(name, value);
    }
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await readRequestBody(request);
    const pagesRequest = new Request(url, { method: request.method, headers, body });
    const pagesResponse = await handler({
      request: pagesRequest,
      env: process.env,
      params: {},
      data: {},
      waitUntil() {},
      next() {
        return new Response("Not found", { status: 404 });
      },
    });

    const responseHeaders = Object.fromEntries(pagesResponse.headers.entries());
    response.writeHead(pagesResponse.status, responseHeaders);
    if (request.method === "HEAD" || !pagesResponse.body) response.end();
    else response.end(Buffer.from(await pagesResponse.arrayBuffer()));
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") sendJson(response, 404, { message: "Not found." });
    else {
      console.error(error);
      sendJson(response, error.status || 500, { message: "The local API request could not be completed." });
    }
  }
  return true;
}

function isSafePublicPath(relativePath) {
  const segments = relativePath.split(path.sep).filter(Boolean);
  return Boolean(segments.length) && !blockedRoots.has(segments[0]) && !blockedFiles.has(relativePath) && !segments.some((segment) => segment.startsWith("."));
}

async function findPublicFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates = relative
    ? [relative, `${relative}.html`, path.join(relative, "index.html")]
    : ["index.html"];

  for (const candidate of candidates) {
    if (!isSafePublicPath(candidate)) continue;
    const filePath = path.resolve(projectRoot, candidate);
    if (!filePath.startsWith(`${projectRoot}${path.sep}`)) continue;
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) return { filePath, fileStat };
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }
  return null;
}

async function servePublicFile(request, response, url) {
  const result = await findPublicFile(url.pathname);
  if (!result) return sendJson(response, 404, { message: "Not found." });

  const { filePath, fileStat } = result;
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const range = request.headers.range;

  if (range && contentType.startsWith("video/")) {
    const match = range.match(/bytes=(\d*)-(\d*)/);
    const start = Number(match?.[1] || 0);
    const end = Math.min(Number(match?.[2] || fileStat.size - 1), fileStat.size - 1);
    if (start > end || start >= fileStat.size) {
      response.writeHead(416, { "Content-Range": `bytes */${fileStat.size}` });
      return response.end();
    }
    response.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
      "Content-Type": contentType,
    });
    return request.method === "HEAD" ? response.end() : createReadStream(filePath, { start, end }).pipe(response);
  }

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Length": fileStat.size,
    "Content-Type": contentType,
  });
  return request.method === "HEAD" ? response.end() : createReadStream(filePath).pipe(response);
}

await loadLocalEnvironment();
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (await runPagesFunction(request, response, url)) return;
    if (request.method === "GET" || request.method === "HEAD") return await servePublicFile(request, response, url);
    sendJson(response, 405, { message: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(response, error.status || 500, { message: "The local preview could not complete this request." });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. The local preview may already be running at http://${host}:${port}/`);
  } else console.error(error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`J R Grace local preview: http://${host}:${port}/`);
  console.log("Keep this terminal open while testing. GitHub pushes do not stop this server.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
