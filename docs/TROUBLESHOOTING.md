# Troubleshooting

## API does not start

Verify the Python environment, dependencies, `.env` file, and port 8000.

## Frontend cannot reach the API

Check `NEXT_PUBLIC_API_URL` and confirm the FastAPI server is running.

## AI tailoring fails

Use `AI_PROVIDER=mock` to isolate application issues from external provider issues. For Groq, verify `GROQ_API_KEY` and `GROQ_MODEL`.

## PDF compilation fails

Verify that `pdflatex` is installed and available on PATH. Check the compiler timeout and the generated LaTeX diagnostics before retrying.

## Generated changes look wrong

Do not replace the original automatically. Inspect the source diff and either keep the original or apply the result as a separate version.
