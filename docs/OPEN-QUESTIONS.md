# Open questions

## Checkpoint 0

- **A2UI version drift.** Sources disagree on whether v0.9 or v0.9.1 is "current" (a2ui.org's own nav labels v0.9 "Previous Stable"). CLAUDE.md pins us to v0.9; recorded so a later move to v0.9.1/v1.0 is a deliberate choice, not a surprise.
- **`feature-flags` and `mfe-integration` specs have requirements flagged ">500 characters" by `openspec validate --strict`.** Not fixed (not formatting-only) — needs a human decision on whether/how to split them. See `docs/VERSIONS.md`'s OpenSpec section.
