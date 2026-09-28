# API Overview

The FastAPI backend is organized around focused route modules.

## Main areas

- Authentication
- Resume projects and versions
- LaTeX compilation
- Job-description ingestion
- ATS analysis
- Resume tailoring
- Cover-letter generation

The frontend communicates with the API through the web application's API client.

## Provider abstraction

AI calls are routed through a provider abstraction so the application can use a mock provider during local testing and configured external providers when credentials are available.

## Security note

Never commit API keys, JWT secrets, generated databases, or local environment files.
