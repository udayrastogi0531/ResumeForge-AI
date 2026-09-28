# Architecture
```
Browser (Next.js) --JWT--> FastAPI --> SQLAlchemy (SQLite/Postgres)
                              |--> parsers/pdf_extract   (pdfplumber -> PyMuPDF -> optional Tesseract)
                              |--> ats/engine            (deterministic scoring + format checks)
                              |--> providers/*           (Groq | Gemini | OpenRouter | Mock)
                              |--> compiler/latex_compiler (pdflatex subprocess)
```
Routes (`apps/api/app/api/routes`): auth, projects (+versions), job_descriptions, compile, ats, tailor, cover_letters.
Ownership: every query filters by the authenticated user; other users' resources return 404 (not 403).
Tables: users, resume_projects, resume_versions, job_descriptions, cover_letters, analysis_cache, compile_jobs.
Frontend: route group `(protected)` wraps pages with the auth guard + sidebar; `lib/api.ts` is the single API client.
