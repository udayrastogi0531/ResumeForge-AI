# ResumeForge AI

LaTeX resume editor + JD matching + ATS scoring + truthful AI tailoring + cover letters.
Edit real LaTeX, compile to PDF, upload a job-description PDF, see a deterministic
"ResumeForge ATS Compatibility Score", and let the AI rewrite *only what your resume already says*.
Every tailoring pass creates a new version; nothing is overwritten silently.

## Stack
- **Web**: Next.js 16 (App Router), TypeScript, Tailwind, Monaco (bundled locally), Zustand, lucide-react
- **API**: FastAPI, SQLAlchemy 2, SQLite (dev) / PostgreSQL (prod), JWT auth (bcrypt)
- **Compile**: `pdflatex` (`-no-shell-escape`, timeout, temp dir per compile)
- **AI**: provider abstraction — Groq (primary), Gemini, OpenRouter, Mock (offline, default)

## Quick start (local, no Docker)
Requirements: Python 3.12, Node 20+, a TeX distribution providing `pdflatex`
(`apt install texlive-latex-base texlive-latex-recommended texlive-latex-extra`).

```bash
# API
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt email-validator
cp .env.example .env            # AI_PROVIDER=mock works with no key
python3 -m uvicorn app.main:app --port 8000

# Web (new terminal)
cd apps/web
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                     # http://localhost:3000
```

### Using Groq
In `apps/api/.env`: `AI_PROVIDER=groq`, `GROQ_API_KEY=...`, `GROQ_MODEL=<a current Groq model id>`.
Keys stay server-side; the browser never sees them. Set `AI_FALLBACK_ENABLED=true` only if you
accept silent fallback to another configured provider.

## Environment variables
See `apps/api/.env.example` and `apps/web/.env.example`. Key ones: `JWT_SECRET`, `DATABASE_URL`,
`AI_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`, `LATEX_COMPILE_TIMEOUT_SECONDS`, `MAX_UPLOAD_MB`,
`CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`.

## Tests
```bash
cd apps/api && python3 -m pytest tests/test_api.py -v     # 16 backend tests
cd apps/api && python3 tests/acceptance_test.py           # live API flow (server must be running)
cd apps/web && npm run lint && npm run build
cd apps/web && NEXT_PUBLIC_E2E=1 npm run build && npm start   # then:
python3 apps/web/e2e/full_flow.py                         # 28 browser checks (needs `pip install playwright`)
```
`NEXT_PUBLIC_E2E=1` only exposes the Monaco instance to the test script; leave it unset in production.

## Truthfulness model
1. The tailoring prompt forbids fabrication and requires unmet JD requirements to be reported as `missing_keywords`.
2. The AI response must match a fixed JSON contract; invalid JSON gets one repair retry, then an error (resume untouched).
3. Output LaTeX must **compile** or it is discarded and the original is returned.
4. The ATS score is computed deterministically (never by the LLM) and recomputed after tailoring.
5. The user reviews a Monaco diff and chooses **Apply as New Version**, **Keep Original**, or **Cancel**.

Important: the truthfulness check in the response is reported by the model itself. The system does not
independently verify it beyond the compile + deterministic checks, so **always review the diff**.

## Known limitations
See `docs/DEVELOPMENT.md` ("Limitations") — notably: live Groq/Gemini/OpenRouter calls are untested,
Docker files are untested, no Alembic migrations, no rate limiting, no Supabase/OAuth, LaTeX isolation is
process-level (not container-level), ATS scores are not persisted on version records, light theme missing.
