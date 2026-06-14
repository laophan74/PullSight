# AGENTS.md

Frontend-specific Codex context for PullSight.

## Scope

This repository contains the React + Vite frontend for PullSight. It should remain deployable to Vercel as a standalone frontend repo.

Production backend URL:

```text
https://pullsight-backend.onrender.com
```

When adding or changing API calls, read the backend base URL from:

```text
VITE_API_BASE_URL
```

All backend URLs should be derived in `src/services/api.ts`. Production Vercel value:

```text
VITE_API_BASE_URL=https://pullsight-backend.onrender.com
```

GitHub login is already wired through backend auth endpoints and uses cookie credentials.

Recent Reviews is implemented through `src/services/reviews.ts` and `src/components/review/RecentReviews.tsx`. Keep history API calls in the service layer and selection/loading orchestration in `App.tsx`.

Compare Reviews is implemented through `POST /api/reviews/compare` and `src/components/review/CompareReviews.tsx`. Keep API calls in `src/services/reviews.ts` and comparison selection/loading orchestration in `App.tsx`.

Review History filters, Markdown/JSON export, and GitHub publish actions are implemented in the Recent view. Keep filters/actions presentational components under `src/components/review`, API calls in `src/services/reviews.ts`, and request state orchestration in `App.tsx`.

Recent Reviews displays all lifecycle statuses, structured summaries, sanitized failed errors, retry, issue-comment publish, Check Run publish, and per-finding inline publish state. Keep incomplete-run actions disabled and preserve the independently scrolling history list and mobile burger menu.

## Standards

- Use React + TypeScript.
- Keep `App.tsx` focused on state orchestration and high-level composition.
- Put review feature components under `src/components/review`.
- Put layout components under `src/components/layout`.
- Put reusable primitives under `src/components/ui`.
- Put API services under `src/services`; avoid scattered hard-coded backend URLs.
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
