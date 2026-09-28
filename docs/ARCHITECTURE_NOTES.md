# Architecture Notes

ResumeForge AI follows a frontend/API split.

```
Browser
  |
  v
Next.js Web App
  |
  v
FastAPI API
  |---- SQLAlchemy persistence
  |---- JD PDF extraction
  |---- ATS analysis
  |---- LaTeX compilation
  |---- AI provider abstraction
  |
  +---- Groq / other configured providers
```

The editor keeps resume source code visible to the user while generated versions are stored separately from the original.

## Core principle

The application should make AI changes inspectable: source code, generated versions, ATS analysis, and cover letters are separate concerns rather than hidden mutations.
