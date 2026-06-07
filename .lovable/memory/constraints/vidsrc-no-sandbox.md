---
name: Vidsrc iframe — never sandbox
description: Hard rule — never apply the sandbox attribute to any Vidsrc/embed iframe
type: constraint
---
Never add a `sandbox` attribute to any iframe that loads a Vidsrc embed (or any other streaming provider iframe). Sandboxing breaks playback/UX.

**Why:** User rule #1. Don't use `sandbox` on anything concerning Vidsrc.
**How to apply:** If top-nav hijacks from embed ads are an issue, solve via other means (provider choice, UX) — never via `sandbox`.
