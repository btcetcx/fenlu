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

## Conventions
- Keep UI changes consistent with the existing ERP console style: dense, work-focused, and suitable for repeated operational use.
- Prefer focused edits over broad refactors.
- Preserve Chinese UI copy and business terminology unless a requested change explicitly updates it.
- Use a local static server for visual verification after significant frontend changes.

## Next Steps
- Decide whether the `1/` directory should remain tracked as an archive or be removed before long-term maintenance.
- Consider replacing placeholder icons with a consistent icon set such as Lucide if the project moves beyond prototype status.
- Consider adding a package setup and lint/format workflow if the codebase will continue growing.
