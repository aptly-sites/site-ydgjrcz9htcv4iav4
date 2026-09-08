# Local preview

Run the website through its local server instead of opening the HTML files directly.

```sh
npm install
npm start
```

Then open <http://127.0.0.1:8080/>. Keep that terminal window open while testing.

The local server serves the current source files directly, supports the same clean page URLs, and runs the Cloudflare Pages API functions locally. Changes appear on refresh without rebuilding or copying files. A GitHub push does not require stopping this server, and future publishing work should leave it running.

For local form and address testing, copy `.env.example` to `.dev.vars` and add the development credentials there. `.dev.vars` is ignored by Git and must never be committed.
