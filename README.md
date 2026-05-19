# PullSight

PullSight is an AI-assisted GitHub pull request review dashboard built as a fullstack portfolio project. The frontend is a React + Vite dashboard that lets a user connect GitHub, choose a repository, select a pull request, and review risk findings produced by an AI analyzer or a static fallback analyzer.

## Frontend Scope

- GitHub OAuth entry state
- Repository and pull request selectors
- PR risk score, changed-file metrics, quota, and cache key summary
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
  data/          Temporary mock data until the ASP.NET API is connected
  utils/         Pure helpers for filtering and deriving review state
  types.ts       Domain models shared across the frontend
```

## Planned Backend

- ASP.NET Core Web API
- EF Core + Npgsql with Supabase Postgres
- GitHub OAuth and GitHub API integration
- AI provider abstraction for Gemini, Groq, OpenRouter, or GitHub Models
- Rule-based analyzer fallback when AI quota is unavailable
- Review cache by repository, PR number, and head SHA

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
