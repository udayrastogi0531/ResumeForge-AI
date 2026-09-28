# Data Model Overview

The application persists user and resume workflow data through SQLAlchemy.

Core concepts include:

- Users and authentication
- Resume projects
- Resume versions
- Job descriptions
- ATS/tailoring workflow data
- Generated cover letters

A resume version represents a reviewable snapshot rather than an implicit mutation of the original source. This supports comparison, recovery, and user-controlled submission decisions.
