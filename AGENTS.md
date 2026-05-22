# Project Context

## Goal
This repository contains a high-fidelity ERP console UI prototype for a manufacturing/business management workflow. The app is a static frontend made from `index.html`, CSS files, and many JSX screen/component modules.

## How To Preview
Run a local static server from the repository root, then open the printed localhost URL.

```bash
python -m http.server 4174
```

The preview entry is `index.html`. Do not rely on double-clicking the HTML file because browser local-file restrictions can block script loading.

## Current State
- The project is not built with a package manager yet; it is a static prototype.
- Main shared UI and navigation code lives in `components.jsx`, `screens.jsx`, `app.jsx`, and `styles.css`.
- Feature screens are split into standalone `*-list.jsx`, `*-screen.jsx`, and picker/drawer modules.
- The `1/` directory currently appears to be a snapshot/copy of the project files and is preserved intentionally until the owner decides whether it should become an archive or be removed.
- Latest synced version: `v2026.05.22` on branch `main`.
- The PRD page feedback block titled `8. 待确认问题 / 反馈给 Codex` should stay hidden in deliverable/package builds.

## Conventions
- Keep UI changes consistent with the existing ERP console style: dense, work-focused, and suitable for repeated operational use.
- Prefer focused edits over broad refactors.
- Preserve Chinese UI copy and business terminology unless a requested change explicitly updates it.
- Use a local static server for visual verification after significant frontend changes.
- Every GitHub sync should preserve continuity: update this file when the project direction, latest version, deployment/package rules, or important decisions change.
- Normal syncs should use a regular commit and push. Use Git tags for clear version checkpoints; avoid force push except when explicitly replacing remote history.

## Version Notes
- `v2026.05.22`: Added the PRD business flow page (`业务流程图`) and related navigation/styles. Deployment target is `/www/wwwroot/115.159.71.102/fenlu/1`; deploy only the local repository root main version and exclude the legacy local `1/` snapshot directory, logs, archives, and deployment helper files.
- `v2026.05.21`: Synced the latest UI updates to GitHub as a versioned checkpoint. Added `.zip` to `.gitignore` so local delivery packages remain local. Local packaging should include the project files but exclude `.git`, runtime logs, and existing `.zip` files.

## Next Steps
- Decide whether the `1/` directory should remain tracked as an archive or be removed before long-term maintenance.
- Consider replacing placeholder icons with a consistent icon set such as Lucide if the project moves beyond prototype status.
- Consider adding a package setup and lint/format workflow if the codebase will continue growing.
