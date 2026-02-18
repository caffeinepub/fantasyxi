# Specification

## Summary
**Goal:** Rebuild and redeploy the existing FantasyXI Dream11-like MVP so it is accessible again, preserving all currently implemented user/admin flows and ensuring required brand assets load as static frontend files.

**Planned changes:**
- Produce a new deployment of the current FantasyXI app and verify it loads successfully in a browser.
- Verify end-to-end MVP flows remain intact: Internet Identity sign-in, profile setup (name + avatar), matches browsing, team building (11 players + captain/vice-captain) and saving, contest browsing/joining with an existing team, and viewing My Teams/My Contests.
- Verify admin capabilities remain intact: seeding players/matches/contests, submitting match scoring, and confirming leaderboards reflect points with captain/vice multipliers.
- Ensure required static images are present under `frontend/public/assets/generated` with exact filenames and are served directly by the frontend at runtime (no backend routing).

**User-visible outcome:** The FantasyXI app is live again; users can sign in and use the full fantasy match/team/contest experience, and admins can seed and score matches with leaderboards updating accordingly.
