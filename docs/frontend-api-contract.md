# Plumbline API contract (test build)

The React frontend communicates with a FastAPI backend. This document describes the endpoints currently implemented; it is not a specification of planned features.

## Authentication

- `POST /api/auth/register` accepts `full_name`, `email`, `password`, and optional `workspace_id`. The first registrant creates a workspace; colleagues can join it using its Workspace ID.
- `POST /api/auth/login` accepts `email` and `password`.
- `GET /api/auth/me` returns the signed-in user.
- `POST /api/auth/logout` revokes the current session.

Authenticated API calls use `Authorization: Bearer <session_token>`.

## Workspace

- `GET /api/workspace/data` returns shared workspace records.
- `PUT /api/workspace/data` saves workspace fields: `workspace`, `guidelines`, `guideline_versions`, `posts`, `comments`, `onboarding_completed`, and `clean_workspace`.
- `GET /api/workspace/members` returns registered users who joined the same workspace.

## Social accounts

- `GET /api/social/config` reports which provider OAuth applications have been configured on the server.
- `GET /api/social/connections` lists only the current Plumbline user's authorized accounts.
- `POST /api/social/{platform}/connect` returns an official provider authorization URL.
- `GET /api/social/callback/{platform}` exchanges the authorization code on the server and stores the resulting provider token.
- `DELETE /api/social/{platform}/disconnect?account_id=...` disconnects one account (omit `account_id` to disconnect all accounts for that platform).
- `POST /api/social/{platform}/publish` publishes supported text/media content to a connected account. The request can include `account_id`, `text`, `image_url`, or `video_url` depending on the provider.
- `GET /api/social/comments` retrieves comments/mentions for providers enabled in this build. Each returned comment includes `accountId` so replies are sent from the same account.
- `POST /api/social/comments/{comment_id}/reply` accepts `platform`, `reply_text`, and `account_id`.

Provider APIs enforce their own scopes, app review, account eligibility, quotas, and media rules. Unsupported actions return an explicit API error; they are not simulated.

## AI

- `GET /api/ai/status` reports whether `GROQ_API_KEY` is configured and which model is selected.
- `POST /api/ai/test` verifies the Groq configuration.
- `POST /api/ai/chat/completions` proxies a chat-completion request to Groq.

The Groq API key is read from `backend/.env` only. It is never stored in frontend configuration.

## Health

- `GET /health` returns API health status.

## Not implemented in this build

Invitation email delivery, document parsing, scheduled publishing, cross-platform analytics, and provider-specific moderation actions are not implemented. Local comment triage labels do not perform moderation actions on the social platform.
