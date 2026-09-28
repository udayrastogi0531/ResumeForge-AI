# LaTeX Compilation

The backend compiles user resume source into PDF output.

## Expected behavior

- Return a generated PDF when compilation succeeds.
- Return useful diagnostics when compilation fails.
- Enforce timeouts and temporary working directories.
- Avoid enabling unnecessary shell escape behavior.

## Production hardening

Public deployments should isolate the compiler process and restrict filesystem, network, CPU, memory, and execution time for untrusted input.
