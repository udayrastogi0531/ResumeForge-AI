# Security Policy

## Reporting

Please report security issues privately to the repository owner rather than publishing exploit details in an issue.

## Sensitive data

Do not commit:

- API keys
- JWT secrets
- Production database files
- Uploaded resumes containing personal information
- Generated credentials or tokens

Use the provided environment examples as configuration references.

## LaTeX compilation

Public deployments must isolate compilation of untrusted LaTeX input with appropriate process, filesystem, resource, and timeout controls.
