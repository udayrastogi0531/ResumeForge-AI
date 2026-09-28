# Local Development

## Recommended workflow

1. Start the FastAPI service on port 8000.
2. Start the Next.js application on port 3000.
3. Use the Mock AI provider when working offline.
4. Use a real provider only when its server-side credentials are configured.
5. Keep generated resume versions separate from the original source.

## Development principles

- Keep API keys server-side.
- Prefer deterministic application logic for scoring and validation.
- Review generated LaTeX before applying it as a new version.
- Run backend tests and frontend lint/build checks before opening a pull request.
