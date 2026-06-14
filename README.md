# PullSight

PullSight is an AI-assisted GitHub pull request review dashboard built as a fullstack portfolio project. The frontend is a React + Vite dashboard that lets a user connect GitHub, choose a repository, select a pull request, and review risk findings produced by an AI analyzer or a static fallback analyzer.

## Frontend Scope

- GitHub OAuth entry state and logged-in user display
- Repository and pull request selectors
- PR risk score, changed-file metrics, analyzer, head SHA, and cache status
- Review findings grouped by severity
- AI analyzer and static fallback pipeline status
- Responsive dashboard layout for desktop and mobile

## Project Structure

```text
src/
  components/
    layout/      App shell, sidebar, and top bar
    review/      Review workflow controls, metrics, findings, and side panel
    ui/          Small reusable presentational components
  constants/     Shared labels and display order
  services/      API URL construction and auth API calls
  utils/         Pure helpers for filtering and deriving review state
  types.ts       Domain models shared across the frontend
```

## Completed Integration

- The top bar checks the current GitHub session with `GET /api/auth/me`.
- Login redirects to `GET /api/auth/github/login` on the ASP.NET backend.
- Logout calls `POST /api/auth/logout`.
- Auth requests use `credentials: 'include'` so the backend auth cookie is sent.
- Repository Browser calls `GET /api/repositories` through `src/services/repositories.ts`.
- Pull Request Browser calls `GET /api/repositories/{owner}/{name}/pull-requests` through `src/services/pullRequests.ts` when a repo is selected.
- `Analyze PR` calls `POST /api/reviews/github` through `src/services/reviews.ts`.
- The review response updates the risk score, analyzer status, summary, findings, changed-file metrics, and fetched diff list.
- Persisted results display `completed` or `fallback`; repeated analysis of the same PR head SHA displays `cached`.
- Recent Reviews calls `GET /api/reviews` with pagination and opens persisted findings through `GET /api/reviews/{reviewRunId}`.
- Review history filters by repository, PR number, source, and status; filter changes return to page 1 and include loading, empty, no-results, error, pagination, and saved detail states.
- Recent Reviews allows selecting two runs, and Compare Reviews displays base/target head SHAs plus added, resolved, and unchanged finding groups.
- Saved reviews and comparisons export as Markdown or JSON through `src/services/reviews.ts`.
- Saved reviews and comparisons publish to GitHub after confirmation, with loading, success, and error feedback.
- Review history displays queued, analyzing, completed, fallback, and failed badges and filters. Failed runs can be retried from persisted context.
- Current and saved reviews render structured overview, risk overview, key changes, and semantic suggested-test-plan lists.
- Saved completed/fallback reviews expose separate issue-comment and Check Run actions.
- Inline-eligible findings can publish individually; important findings can publish as a group with per-finding publishing, published, skipped, and error states.
- Comparison includes loading, empty, validation, and API error states.
- Sidebar navigation separates the dashboard into `#reviews` for active PR analysis and `#recent` for saved results plus comparisons.
- Recent review cards scroll inside a bounded list, while pagination stays visible.
- On tablet/mobile widths, the sidebar becomes a sticky top bar with a burger menu and signed-in user details.
- Mock repositories, pull requests, and review findings have been removed from the dashboard. Empty states are shown until real data is loaded.
- All backend URLs are derived from `VITE_API_BASE_URL` in `src/services/api.ts`.

Review persistence and cache display are connected. Daily quota display/enforcement is deferred.

## Production Test Data

After logging in at `https://pull-sight.vercel.app`, select:

```text
laophan74/test-pull-requests
```

Expected open PRs:

- `#5 Add PR review checklist`
- `#6 Add pull request summary helper`
- `#7 Add sample webhook handler`
- `#8 Add release checklist`
- `#9 Add discount calculator`
- `#10 Add session token middleware`

If these do not appear, refresh repositories, verify the backend deployment is awake, and confirm the GitHub OAuth token has repo access.

## Backend Integration

- ASP.NET Core Web API
- EF Core + Npgsql with Supabase Postgres
- GitHub OAuth and GitHub API integration
- AI provider abstraction for Gemini, Groq, OpenRouter, or GitHub Models
- Rule-based analyzer fallback when Gemini is unavailable
- Persisted review runs/findings
- Review cache by repository, PR number, and head SHA

## Next Frontend Feature

Add hosted share links only when persistent public reports are needed.

## Local Development

```bash
npm install
npm run dev
```

Create a local `.env` file when the backend is not running on the default URL:

```text
VITE_API_BASE_URL=http://localhost:5200
```

Use `.env.example` as the template. All frontend backend URLs are derived from `VITE_API_BASE_URL` through `src/services/api.ts`, so changing the backend domain should only require updating that environment variable.

## Production Build

```bash
npm run build
```

For Vercel, set:

```text
VITE_API_BASE_URL=https://pullsight-backend.onrender.com
```

Changing the backend domain in production should only require changing `VITE_API_BASE_URL` in Vercel and redeploying the frontend.
