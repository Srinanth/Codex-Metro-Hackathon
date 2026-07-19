# BizzAI

BizzAI is a full-stack prototype for local businesses that need a customer-facing AI receptionist and a simple operations workspace. A customer can discover a business, ask about its services or hours, and make supported requests in natural language. A business owner can create a business profile, configure it from a plain-English description, and view or manage its operational records.

The important design choice is that the AI **does not** directly update the database or decide whether an operation is valid. It understands the customer's message and requests a constrained backend tool; deterministic server-side engines validate and carry out the actual operation.

## What it does

### Customer experience

- Browse and search the businesses in the system.
- Open a business profile and chat with its AI receptionist.
- Ask factual questions about configured services, hours, rules, pricing, and contact details.
- Use the capabilities enabled for that business:
  - appointments: check availability, create, update, or cancel an appointment;
  - reservations: create, update, or cancel a resource reservation;
  - queue: join, check, update, or leave a queue; and
  - orders: create, update, or cancel an order.

### Owner experience

- Describe a new business in natural language during onboarding.
- Have Gemini extract a draft name, type, configuration, capabilities, and rules.
- Review the extracted profile before it is saved.
- Access dashboard, profile, operations, AI configuration, and settings views for the selected business.

## How it works

```text
Customer or owner
       |
React + Vite client
       |
Express API + MongoDB
       |
Gemini / Mastra receptionist
       |
Constrained tools: query | mutate | explain | suggest
       |
Dispatcher -> registered deterministic engine -> MongoDB record
```

For every chat request, the server loads the chosen business and its current operation records, then generates a business-specific receptionist prompt. The receptionist can only call one of four tools:

| Tool | Responsibility |
| --- | --- |
| `explain` | Returns configured facts such as services, hours, rules, pricing, or contact information. |
| `query` | Reads records or availability without changing data. |
| `mutate` | Requests a create, update, cancellation, or removal. |
| `suggest` | Produces a deterministic availability, duration, or wait-time suggestion. |

The dispatcher checks that the business supports the requested capability and sends it to the corresponding engine. The engines—not the model—validate required details, working hours, appointment overlaps, resource conflicts, queue position, and record ownership before writing to MongoDB. The customer receives the engine's authoritative result, rather than an AI-generated confirmation.

Current engines are `appointments`, `reservations`, `queue`, and `orders`. A business only exposes the capabilities listed on its profile; the seeded demo businesses use appointments, reservations, queueing, and FAQ-style information as appropriate.

## Tech stack

- Client: React 18, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion
- Server: Node.js, Express, TypeScript, Mongoose, Zod
- AI orchestration: Google Gemini through AI SDK and Mastra
- Data store: MongoDB
- Workspace: pnpm

## Run locally

### Prerequisites

- Node.js 20+ and pnpm 10+
- A running MongoDB instance (local or hosted)
- A Gemini API key for the AI chat and business-extraction features

### 1. Configure the server

Create `server/.env` with the following values:

```env
# The client uses this API address by default.
PORT=4001
MONGODB_URI=mongodb://localhost:27017/bizzai
GEMINI_API_KEY=your_gemini_api_key
# Optional; this is the server default.
GEMINI_MODEL=gemini-3.5-flash
```

`PORT=4001` is intentional: the client defaults to `http://localhost:4001/api`. If you choose another API port, set `VITE_API_URL` for the client to the matching `<url>/api` value.

### 2. Install, seed, and start

```bash
pnpm install
pnpm run seed
pnpm run dev
```

`pnpm run seed` upserts four sample businesses and replaces their sample operation records. It is safe for the named demo businesses, but it resets their appointments, reservations, and queue entries—do not use it against data you need to keep.

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Choose **Search businesses**, then try **Tony's Barber** or **Pixel Gaming Cafe**.

Useful demo prompts:

- “What services does Tony's Barber offer?”
- “What times are available tomorrow?”
- “My name is Priya” followed by an appointment date and time.
- “Can I reserve a PS5 at Pixel Gaming Cafe?”
- “How long is the queue?”

## Scripts

| Command | Description |
| --- | --- |
| `pnpm run dev` | Runs the Vite client and Express API together. |
| `pnpm run build` | Type-checks and builds the client and server. |
| `pnpm run seed` | Seeds or updates the four demo businesses and resets their sample operations. |
| `pnpm run start` | Starts the built server. |

## Project layout

```text
client/                 React customer and owner application
  src/pages/            Search, chat, onboarding, and owner screens
  src/services/api.ts   Client-to-API calls
server/                 Express API and business logic
  src/agents/           Gemini/Mastra receptionist and dynamic prompts
  src/tools/            AI tool definitions and factual lookups
  src/engines/          Deterministic appointment, reservation, queue, and order logic
  src/services/         Dispatcher plus business, record, and agent services
  src/models/           MongoDB business and operational-record models
  src/scripts/seed.ts   Demo data
```

## API overview

All API responses use `{ success, message, data }`.

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Businesses | `POST`, `GET /api/business`; `GET`, `PUT`, `DELETE /api/business/:id` |
| Operational records | `POST`, `GET /api/records`; `GET`, `PUT`, `DELETE /api/records/:id` |
| AI receptionist | `POST /api/ai/interactions` with `businessId`, `message`, and optional chat `history` |
| Owner onboarding | `POST /api/ai/extract-business` with a temporary `description` |

The onboarding endpoint returns a structured draft only. The original free-text description is not stored; the owner must review and explicitly save the resulting profile.

## Demo data

The seed creates these businesses:

- Tony's Barber — appointments and business information
- Elite Salon — appointments and business information
- Pixel Gaming Cafe — reservations, queueing, and business information
- Smile Dental Clinic — appointments, consultations configured on the profile, and business information

## Notes and current scope

- MongoDB is required for business data and operational records.
- Gemini is required for natural-language chat and business-profile extraction.
- The API enables CORS for local client development.
- Authentication and multi-user authorization are not implemented in this prototype; the owner selection is stored in browser local storage.
- `consultations` and `faq` may appear in a business profile as configuration/context, but only the four registered engines listed above perform deterministic operations.
