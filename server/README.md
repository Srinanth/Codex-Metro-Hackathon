# BizzAI API Foundation

All responses use `{ success, message, data }`.

| Resource | Endpoints |
| --- | --- |
| Business | `POST`, `GET` `/api/business`; `GET`, `PUT`, `DELETE` `/api/business/:id` |
| Record | `POST`, `GET` `/api/records`; `GET`, `PUT`, `DELETE` `/api/records/:id` |
| AI | `POST` `/api/ai/interactions`; `POST` `/api/ai/extract-business` |

`Business.configuration`, `Business.capabilities`, `Business.rules`, `Record.data`, and `Record.metadata` are intentionally flexible. Engines in `src/engines` are placeholders for future deterministic capability handling.

The AI endpoint accepts a `businessId`, `message`, and optional in-memory `history`. It loads the business and its records for each request, then passes dynamically generated context to one reusable Gemini/Mastra receptionist agent. The agent only has access to `executeOperation`; it cannot access MongoDB directly.

`/api/ai/extract-business` accepts a temporary natural-language business description and returns a structured profile for owner review. The raw description is never stored.
