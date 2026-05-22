# ThoughtTrace

An AI-powered tool for tracing how you reason through coding problems. Log your raw thoughts while solving a Data Structures & Algorithms problem, then let an LLM reconstruct your thinking into a clear, structured explanation.

**Live demo:** https://thoughttrace.vercel.app
**Backend API:** https://thoughttrace.onrender.com

> Note: the backend runs on a free tier that sleeps after inactivity, so the first request may take 30–50 seconds to wake up.

---

## What it does

- Log coding problems you're working through (title, difficulty, topic)
- Record your raw, in-progress thoughts as you solve each one
- Generate an AI reconstruction that turns those scattered thoughts into a clear, step-by-step explanation of your reasoning
- View an overview of your tracked problems and thoughts

---

## Tech Stack

**Frontend:** React (Vite), React Router, Axios
**Backend:** Node.js, Express
**Database:** PostgreSQL (Supabase)
**AI:** LLM via an OpenAI-compatible API (NVIDIA NIM, model `meta/llama-3.1-8b-instruct`)
**Infrastructure:** Frontend on Vercel, backend on Render, CI via GitHub Actions

---

## Architecture

ThoughtTrace is two independently deployed applications:

- The **React frontend** (Vercel) runs in the browser and handles all rendering.
- The **Express backend** (Render) exposes a REST API and returns JSON. It owns all database access and the AI integration.

The frontend never talks to the database directly. It requests data from the backend, the backend returns JSON, and the frontend renders it. The backend address is supplied to the frontend through an environment variable (`VITE_API_URL`), so the same frontend code runs against a local backend in development and the live backend in production with no code changes.

The AI integration is written against the OpenAI-compatible interface, so the LLM provider is just a base URL and a model name. This made it possible to swap providers (OpenRouter → NVIDIA NIM) by changing configuration rather than code.

```
Browser ──> React (Vercel) ──HTTP/JSON──> Express (Render) ──> PostgreSQL (Supabase)
                                                │
                                                └──> LLM (OpenAI-compatible API)
```

---

## API Endpoints

| Method | Route                              | Description                                  |
|--------|------------------------------------|----------------------------------------------|
| GET    | `/health`                          | Health check                                 |
| GET    | `/problems`                        | List all problems                            |
| POST   | `/problems`                        | Create a problem                             |
| GET    | `/problems/:id/thoughts`           | List thoughts for a problem                  |
| POST   | `/problems/:id/thoughts`           | Add a thought to a problem                   |
| DELETE | `/problems/:id/thoughts/:thoughtId`| Delete a thought                             |
| POST   | `/ai/reconstruct/:problemId`       | Generate an AI reconstruction for a problem  |
| GET    | `/stats`                           | Totals and a breakdown by difficulty         |

The backend includes security headers (Helmet), rate limiting, parameterised SQL queries to prevent injection, and graceful error handling so an external (database or AI) failure logs server-side and returns a clean error rather than crashing.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A PostgreSQL database (this project uses Supabase)
- An API key for an OpenAI-compatible LLM provider (this project uses NVIDIA NIM)

### Backend
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```
DATABASE_URL=your_postgres_connection_string
NVIDIA_API_KEY=your_api_key
PORT=3001
```
Then:
```bash
node index.js
```
The API runs on `http://localhost:3001`.

### Frontend
```bash
cd client
npm install
npm run dev
```
The app runs on `http://localhost:5173` and talks to `http://localhost:3001` by default. To point it at a deployed backend, set `VITE_API_URL` in the frontend environment.

### Database schema
```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  difficulty TEXT,
  topic TEXT,
  reconstruction TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id),
  raw_thought TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Design Decisions

- **Provider-agnostic AI layer.** Coding against the OpenAI-compatible interface avoids vendor lock-in; the provider is configuration, not code.
- **Reconstruction stored on the problem, not per thought.** A reconstruction describes the whole problem's reasoning, so it lives as a single column on `problems` rather than being duplicated across thought rows.
- **Environment-based configuration.** Secrets and the backend URL come from environment variables, never committed to source control.
- **Markdown rendering on the frontend.** The AI returns markdown; it's rendered client-side rather than stored as HTML, keeping stored data clean.

---

## Future Improvements

- **Authentication and per-user data** (Supabase Auth with Google OAuth and row-level security) so each user has their own private set of problems.
- **Edit/update thoughts** to complete full CRUD.
- **A dedicated `GET /problems/:id` endpoint** (the detail view currently derives a single problem from the list client-side).
- **Automatic provider failover** across multiple LLM providers for resilience.
- **Unit tests** for the API routes in the CI pipeline.

---

## License

MIT
