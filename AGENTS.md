# J R Grace site workflow

- Use `npm start` from this directory for local previews. Never open the HTML files with a `file://` URL because root-relative links, clean routes, and API functions will not work correctly.
- Keep the local preview server running after GitHub commits and pushes whenever the user is testing locally. Publishing the site must not stop the local preview.
- The preview serves source files directly, so refresh the browser after edits. Restart it only if the server code or local environment values change.
- Keep local API credentials in `.dev.vars`. Never commit `.dev.vars`, `.env`, or API credentials.
