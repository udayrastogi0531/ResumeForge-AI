# AI Provider Guide

ResumeForge AI uses a provider abstraction rather than coupling the application to one model vendor.

## Provider responsibilities

A provider should expose the operations required by the application, including structured extraction, resume tailoring, and cover-letter generation.

## Local development

The mock provider can be used for deterministic local testing without external API credentials.

## Production

Configure a supported provider through environment variables. Keep provider keys outside source control and monitor provider errors separately from application validation errors.
