# Testing Guide

ResumeForge AI includes backend API tests and an end-to-end acceptance flow.

## Backend

From the API workspace, install the Python dependencies and run the test suite with pytest.

## Frontend

Run the production build and lint checks from the web workspace.

## Acceptance flow

The acceptance flow exercises the main application path: authentication, resume/project handling, job-description analysis, tailoring, compilation, ATS analysis, and cover-letter generation.

## Before a release

- Backend tests pass.
- Frontend lint passes.
- Production build succeeds.
- PDF compilation is verified in the target environment.
- AI-provider configuration is checked without committing secrets.
