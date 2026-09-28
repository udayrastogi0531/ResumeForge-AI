# Deployment
Web -> Vercel (set `NEXT_PUBLIC_API_URL`). API -> Render/Railway/Fly/VPS using `apps/api/Dockerfile`
(includes TeX Live). DB -> Postgres via `DATABASE_URL=postgresql+psycopg2://...`.
Set a strong `JWT_SECRET`, restrict `CORS_ORIGINS`, and put LaTeX compilation in an isolated worker before
exposing to untrusted users. Most serverless hosts cannot run pdflatex; use a container host.
