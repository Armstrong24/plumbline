# Plumbline Brand Guard (Chrome extension)

Brings Plumbline's brand audit into apps the backend can't publish to (Instagram personal, LinkedIn pages/comments, Threads replies, Reddit, WhatsApp Web, Discord, Telegram, Bluesky, Medium, Quora…). Right-click "Check with Plumbline" works on any site.

## Pipeline (lib/)
1. `rules.js` – exact port of `AIAuditEngine` (terminology + claim regex + same risk score).
2. `rag.js` – guidelines → chunks (voice, platform rules, terminology, facts, pasted rulebook passages) → hybrid retrieval: local BM25 + Gemini embeddings, merged with Reciprocal Rank Fusion; platform rule always pinned.
3. `llm.js` – Groq (`openai/gpt-oss-20b`) primary, Gemini (`gemini-3.5-flash-lite`) fallback on 429/errors, `gemini-embedding-001` for vectors.
4. `pipeline.js` – grounded audit: LLM sees only top-k retrieved chunks, must cite chunk ids; findings whose quote isn't in the draft or with no valid citation are dropped; merged with rule findings and scored. Also `runRewrite` and `runReply`.
Works with no key (rules + BM25 only).

## Install
1. chrome://extensions → Developer mode → Load unpacked → select this `extension/` folder.
2. Options page opens: paste free keys (Groq: console.groq.com/keys, Gemini: aistudio.google.com/api-keys).
3. Guidelines: sign in to your local Plumbline backend (http://localhost:8000) to sync the workspace's Brand Knowledge, or press "Load sample" → Save.
4. Open Instagram/LinkedIn/etc., click into a composer → "Plumbline check" pill.

## Test
`node extension/test/pipeline.test.mjs`

## Note for the web app
`llama-3.3-70b-versatile` (README + groqService default) is Enterprise-only on Groq's free plan now; use `openai/gpt-oss-120b` or `openai/gpt-oss-20b` in `backend/.env`.
