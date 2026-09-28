# AI Provider Guide

ResumeForge uses an AI provider abstraction so the tailoring workflow is not tightly coupled to one vendor.

## Mock

Use `AI_PROVIDER=mock` for offline development and deterministic application testing.

## Groq

Set `AI_PROVIDER=groq`, `GROQ_API_KEY`, and `GROQ_MODEL`. Credentials remain on the backend.

## Gemini and OpenRouter

These providers are supported by the provider architecture when their corresponding configuration is available.

## Provider fallback

Fallback behavior should be enabled deliberately. When enabled, understand that a request can be handled by another configured provider.
