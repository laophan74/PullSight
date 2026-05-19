# AGENTS.md

Frontend-specific Codex context for PullSight.

## Scope

This repository contains the React + Vite frontend for PullSight. It should remain deployable to Vercel as a standalone frontend repo.

## Standards

- Use React + TypeScript.
- Keep `App.tsx` focused on state orchestration and high-level composition.
- Put review feature components under `src/components/review`.
- Put layout components under `src/components/layout`.
- Put reusable primitives under `src/components/ui`.
- Put temporary mock data under `src/data`; replace it with API services as backend endpoints mature.
- Keep CSS responsive and avoid text overflow on mobile and desktop.

## Verification

Run before finishing frontend changes:

```bash
npm run build
```

Local dev URL:

```text
http://127.0.0.1:5173
```

## Related Docs

In the local full workspace, see `../CONTEXT.md` and `../ARCHITECTURE.md`.
