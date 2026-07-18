# BizzAI Development Guidelines

## Project Overview

BizzAI is an AI-powered receptionist platform for local businesses.

The AI should NEVER directly manipulate application state or databases.

AI performs reasoning.

The backend performs execution.

---

# Architecture

Frontend

- React
- Vite
- TypeScript
- Tailwind CSS v4
- shadcn/ui

Backend

- Express
- TypeScript

Database

- MongoDB
- Mongoose

AI

- Gemini
- Mastra

---

# Coding Standards

- Strict TypeScript
- Never use `any`
- Keep components small
- Reusable hooks
- Reusable services
- Feature-first architecture
- Separate business logic from UI

---

# Backend Rules

Controllers

- Never contain business logic.

Services

- Handle all database interactions.

Models

- Only define schemas.

Routes

- Only register routes.

---

# AI Rules

There must only be ONE reusable agent.

Never create one agent per business.

Business context must be loaded dynamically.

Never store prompts in MongoDB.

Generate prompts dynamically every request.

AI must only:

- Understand intent
- Extract structured information
- Decide which backend tool to call

AI must NEVER

- Write directly to MongoDB
- Generate booking confirmations without using tools
- Skip tool execution

---

# Tool Calling

Every action must go through tools.

Examples

checkAvailability

createBooking

cancelBooking

rescheduleBooking

getBusinessInfo

Tools execute logic.

The AI only decides when to call them.

---

# Booking Engine

Must remain deterministic.

Never use AI for:

- Slot generation
- Collision detection
- Time calculations
- Booking validation

Use plain TypeScript.

---

# Prompt Generation

Never store prompts.

Generate them dynamically from

Business

Bookings

Rules

Services

Current date

Available tools

---

# UI

Theme

Background
#0F172A

Cards
#1E293B

Primary
#2563EB

Accent
#14B8A6

Danger
#EF4444

Success
#22C55E

Borders
#334155

No gradients.

Minimal.

Modern SaaS.

Rounded corners.

Consistent spacing.

Use Tailwind CSS v4 utilities.

---

# General Principles

Prefer readability over cleverness.

Prefer reusable code over duplicated code.

Keep functions small.

Avoid deeply nested logic.

Use descriptive names.

Every feature should be modular and easily replaceable.

Write code that could realistically be extended into a production SaaS.