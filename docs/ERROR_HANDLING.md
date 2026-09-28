# Error Handling

ResumeForge AI has several failure boundaries:

- Invalid authentication requests
- Invalid or unreadable JD files
- AI provider failures
- Invalid AI JSON responses
- LaTeX compilation failures
- Database errors
- Frontend API/network failures

Errors should be surfaced with actionable messages while avoiding secrets, internal credentials, or sensitive document contents.

For AI operations, provider failures should remain distinguishable from validation failures so users can understand whether a request should be retried or reviewed.
