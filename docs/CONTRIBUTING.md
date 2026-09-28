# Contributing to ResumeForge AI

## Development flow

1. Create a focused branch for a feature or fix.
2. Keep changes small and reviewable.
3. Run the relevant backend tests and frontend checks before opening a pull request.
4. Document behavior changes that affect the API, editor, ATS analysis, tailoring, or compilation flow.

## Commit conventions

Use descriptive conventional-style messages such as:

- `feat: add resume version comparison`
- `fix: handle failed latex compilation`
- `docs: clarify local development setup`
- `test: cover tailoring validation`

Avoid commits that only change timestamps or add empty files.

## Safety

Resume tailoring must preserve user-provided facts. Do not introduce unsupported skills, employers, education, achievements, or metrics.
