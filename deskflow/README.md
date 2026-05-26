# DeskFlow — Support Ticket Triage Board

A full-stack MERN application for managing and triaging customer support tickets across a kanban-style board with SLA tracking and priority management.

**Live Demo:**
- Frontend → [https://apiround-cyan.vercel.app](https://apiround-cyan.vercel.app)
- Backend API → [https://apiround.onrender.com](https://apiround.onrender.com)

---

## Features

- **Kanban Board** — 4-column status pipeline: Open → In Progress → Resolved → Closed
- **SLA Tracking** — per-priority response targets with breach indicators on overdue tickets
- **Status Transitions** — enforced forward/backward rules (one step at a time, no skipping)
- **Stats Strip** — live counts per status + total SLA-breached tickets
- **Filters** — filter by priority, show only breached tickets, combinable
- **Create Ticket** — slide-in panel with client + server-side inline validation
- **Auto-timestamps** — `resolvedAt` set automatically on resolve, cleared on rollback

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, CSS Modules |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Atlas), Mongoose |
| HTTP Client | Axios |
| Validation | express-validator |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
APIROUND/
└── deskflow/
    ├── backend/
    │   ├── models/
    │   │   └── Ticket.js            # Mongoose schema + enum statics
    │   ├── middleware/
    │   │   └── validateTicket.js    # express-validator rules
    │   ├── routes/
    │   │   └── tickets.js           # All ticket endpoints
    │   ├── utils/
    │   │   ├── transitions.js       # Status transition rules + SLA targets
    │   │   └── deriveFields.js      # ageMinutes + slaBreached computation
    │   ├── server.js                # Express app entry point
    │   ├── .env.example
    │   └── package.json
    └── frontend/
        ├── src/
        │   ├── components/
        │   │   ├── StatsStrip.jsx   # Live stats bar
        │   │   ├── BoardView.jsx    # 4-column kanban layout
        │   │   ├── TicketCard.jsx   # Card with move controls + SLA badge
        │   │   ├── FilterBar.jsx    # Priority + breached filters
        │   │   └── CreateTicketForm.jsx  # Slide-in modal form
        │   ├── utils/
        │   │   ├── api.js           # Axios instance + API functions
        │   │   └── transitions.js   # Frontend mirror of transition logic
        │   ├── App.jsx              # Root state + wiring
        │   └── index.css            # Global dark theme tokens
        ├── vite.config.js           # Dev proxy → backend
        └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/aniruddhasharma39/APIROUND.git
cd APIROUND
```

### 2. Backend setup

```bash
cd deskflow/backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017/deskflow
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd deskflow/frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

App runs on `http://localhost:5173`.

> The Vite dev server proxies `/tickets` requests to the backend automatically — no CORS issues in local dev.

---

## API Reference

Base URL: `https://apiround.onrender.com`

### Ticket object

```json
{
  "_id": "...",
  "subject": "Login broken",
  "description": "Users can't log in after the update",
  "customerEmail": "user@example.com",
  "priority": "high",
  "status": "open",
  "resolvedAt": null,
  "createdAt": "2026-05-26T10:00:00.000Z",
  "ageMinutes": 47,
  "slaBreached": false
}
```

### Endpoints

#### `GET /tickets`
List all tickets. Supports query filters:

| Param | Example | Description |
|---|---|---|
| `status` | `?status=open` | Filter by status |
| `priority` | `?priority=high` | Filter by priority |
| `breached` | `?breached=true` | Only SLA-breached tickets |

Filters are combinable: `?priority=urgent&breached=true`

---

#### `POST /tickets`
Create a new ticket.

**Body:**
```json
{
  "subject": "string (required, max 150)",
  "description": "string (required)",
  "customerEmail": "valid email (required)",
  "priority": "low | medium | high | urgent (required)"
}
```

**Response:** `201` with created ticket object.

**Validation errors:** `422` with `{ "errors": { "field": "message" } }`

---

#### `PATCH /tickets/:id`
Update ticket status. Enforces one-step transition rules.

**Body:**
```json
{ "status": "in_progress" }
```

**Transition rules:**
- Forward: `open → in_progress → resolved → closed`
- Backward: one step back only (e.g. `in_progress → open`)
- Skipping steps returns `409`

`resolvedAt` is auto-set when status becomes `resolved`, cleared on rollback.

---

#### `DELETE /tickets/:id`
Delete a ticket. Returns `{ "message": "Ticket deleted", "id": "..." }`.

---

#### `GET /tickets/stats`
Aggregate counts for the stats strip.

**Response:**
```json
{
  "statusCounts":   { "open": 3, "in_progress": 1, "resolved": 2, "closed": 0 },
  "priorityCounts": { "high": 2, "urgent": 1, "medium": 2, "low": 1 },
  "breachedCount":  1
}
```

---

## SLA Targets

| Priority | Target |
|---|---|
| urgent | 60 min (1 hr) |
| high | 240 min (4 hrs) |
| medium | 1440 min (24 hrs) |
| low | 4320 min (72 hrs) |

`slaBreached` is `true` when:
- Ticket is **unresolved** and age exceeds the target
- Ticket is **resolved/closed** and resolution time exceeded the target

---

## Deployment

### Backend → Render

**Environment variables to set on Render:**

| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `PORT` | `5000` (or Render sets this automatically) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

**Build command:** *(none — Node.js)*
**Start command:** `node server.js`
**Root directory:** `deskflow/backend`

---

### Frontend → Vercel

**Environment variables to set on Vercel:**

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

**Root directory:** `deskflow/frontend`
**Build command:** `npm run build`
**Output directory:** `dist`

---

## Git History

```
fix: explicit CORS origin whitelist via ALLOWED_ORIGINS env var
style: board layout and priority badge colors
feat: wire up app state, filters, and board interactions
feat: create ticket form with inline validation
feat: filter bar component
feat: board view with 4 status columns
feat: ticket card with move controls and SLA indicator
feat: stats strip component
feat: axios api utility functions
init: frontend vite react setup
feat: mount routes and error handling
feat: all ticket CRUD and stats API routes
feat: ageMinutes and slaBreached derived field logic
feat: transition rules and SLA targets utility
feat: add input validation middleware
feat: add Ticket mongoose model
init: backend server and db connection
```

---

## License

MIT
