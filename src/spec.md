# Specification

## Summary
**Goal:** Stop the app from getting stuck on an infinite full-screen loading spinner during Internet Identity initialization, and provide a recoverable error state with basic diagnostics.

**Planned changes:**
- Add a hard timeout to the Internet Identity/AuthClient initialization path; on timeout or error, exit the initializing state and render the normal app shell.
- Show a clear, user-facing initialization error message (English) with a “Retry” action that re-attempts initialization without a full page reload, while still allowing access to unauthenticated home content.
- Add lightweight browser-console diagnostics for auth startup stages (start, AuthClient created, isAuthenticated resolved, end/timeout/error) without logging any secrets.

**User-visible outcome:** The app no longer stays on the initial spinner for minutes; if authentication initialization is slow or fails, users can still see and use the unauthenticated UI and can retry initialization from an error prompt.
