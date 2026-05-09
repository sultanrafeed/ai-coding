# AI Coding Platform

A self-hosted platform where developers solve algorithmic problems with an AI co-pilot that reasons from verified canonical solutions — not model memory.

## Prerequisites

Install these before anything else.

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| Python | 3.12+ | https://python.org |
| uv | latest | `pip install uv` |
| Docker Desktop | latest | https://docker.com/products/docker-desktop |
| Git | any | https://git-scm.com |

Verify everything is installed:
```powershell
node -v        # v20+
pnpm -v        # 9+
python --version  # 3.12+
uv --version
docker --version
```

---

## Quick Start (MVP — Phase 0)

### 1. Clone and enter the repo
```bash
git clone <your-repo-url>
cd ai-coding
```

### 2. Copy environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in **at minimum**:
```env
OPENROUTER_API_KEY=sk-or-...      # https://openrouter.ai/keys
VOYAGE_API_KEY=pa-...             # https://dash.voyageai.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...           # https://clerk.com — free tier
```

### 3. Install JavaScript dependencies
```bash
pnpm install
```

### 4. Install Python dependencies
```bash
cd apps/ai
uv sync
cd ../..
```

### 5. Start infrastructure
```bash
docker compose up -d postgres redis qdrant litellm
```

Wait ~20 seconds, then verify:
```bash
# Should return {"status":"ok"}
curl http://localhost:4000/health    # LiteLLM
curl http://localhost:6333/healthz   # Qdrant
```

### 6. Start Judge0 (code execution)
```bash
docker compose -f services/judge0/docker-compose.yml up -d
```

### 7. Start the three apps (three separate terminals)

**Terminal 1 — API gateway**
```bash
cd apps/api
pnpm dev
# Running on http://localhost:3001
```

**Terminal 2 — AI service**
```bash
cd apps/ai
uv run uvicorn src.main:app --reload --port 8000
# Running on http://localhost:8000
```

**Terminal 3 — Web app**
```bash
cd apps/web
pnpm dev
# Running on http://localhost:3000
```

### 8. Open the app
```
http://localhost:3000
```

---

## Problem Catalog Setup

The platform ships with 3,640 problems pre-ingested. After starting the infrastructure, run these once to complete the catalog.

### Step 1 — Generate editorials (LLM)
Generates `approach`, `explanation`, `keyInsight`, and `commonMistakes` for every problem using the canonical solution as ground truth.
```bash
python scripts/generate_editorials.py
# ~1 hour, idempotent — safe to interrupt and re-run
```

### Step 2 — Fill complexity analysis (LLM)
Fills `timeComplexity` and `spaceComplexity` for each canonical solution.
```bash
python scripts/fill_complexity.py
# ~30 min, idempotent
```

### Step 3 — Index into Qdrant
Embeds all problems + solutions + editorials into the vector database.
```bash
cd apps/ai
uv run python ../../ml/embeddings/index_problems.py
# ~10 min depending on Voyage API rate limits
```

After these three steps, the AI assistant has grounded context for every problem.

---

## Adding Your Own Solutions

If you have a LeetCode solutions repository:
```bash
python scripts/ingest_leetcode_solutions.py "C:\path\to\LeetCode-Solutions-master"
python scripts/fetch_leetcode_metadata.py   # fills descriptions from LC API
```

---

## Environment Variables Reference

```env
# ── Postgres ──────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_coding

# ── Redis ─────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Clerk (Auth) ──────────────────────────────────────────────
# Get from https://clerk.com → Create application → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ── LiteLLM (Model proxy) ─────────────────────────────────────
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=any-string-you-choose

# ── OpenRouter (LLM provider) ─────────────────────────────────
# Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-...

# ── Voyage (Embeddings) ───────────────────────────────────────
# Get from https://dash.voyageai.com
VOYAGE_API_KEY=pa-...

# ── Qdrant (Vector DB) ────────────────────────────────────────
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                        # leave empty for local

# ── Judge0 (Code execution) ───────────────────────────────────
JUDGE0_URL=http://localhost:2358
JUDGE0_AUTH_TOKEN=                     # leave empty for local

# ── Internal service URLs ─────────────────────────────────────
AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Project Structure

```
ai-coding/
├── apps/
│   ├── web/          Next.js 15 — editor, problem list, AI panel
│   ├── api/          NestJS — auth, problems, submissions, AI proxy
│   └── ai/           FastAPI — LLM agents, RAG, embeddings
├── packages/
│   ├── types/        Shared TypeScript types
│   └── ui/           Shared React components (Button, Card)
├── services/
│   ├── judge0/       Code execution sandbox (Docker)
│   ├── qdrant/       Vector database config
│   └── litellm/      LLM proxy config (model routing)
├── ml/
│   ├── agents/       LangGraph agent definitions (Phase 2)
│   ├── embeddings/   Qdrant indexing pipeline
│   ├── eval/         Internal benchmark harness
│   └── finetune/     DPO training scripts (Phase 3)
├── data/
│   └── problems/     3,640 problem JSONs with canonical solutions
└── scripts/
    ├── ingest_leetcode_solutions.py
    ├── fetch_leetcode_metadata.py
    ├── generate_editorials.py
    ├── fill_complexity.py
    └── repair_corrupted.py
```

---

## API Endpoints

### API Gateway (port 3001)
| Method | Path | Description |
|---|---|---|
| GET | `/api/problems` | List problems (filter by difficulty, tag) |
| GET | `/api/problems/:slug` | Get single problem |
| POST | `/api/submissions` | Submit code for execution |
| GET | `/api/submissions/:id` | Get submission result |
| POST | `/api/ai/explain-error` | Stream error explanation |
| POST | `/api/ai/hint` | Stream hint (socratic/conceptual/near-solution) |
| POST | `/api/ai/complexity` | Analyze time/space complexity |
| GET | `/api/users/:id/profile` | User profile |
| GET | `/api/users/:id/skill-graph` | Skill graph nodes |

Interactive docs: `http://localhost:3001/api/docs`

### AI Service (port 8000)
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/ai/explain-error` | SSE stream — bug explanation |
| POST | `/ai/hint` | SSE stream — hint generation |
| POST | `/ai/complexity` | Complexity analysis |
| POST | `/embeddings` | Embed a text snippet |
| POST | `/embeddings/index-problem` | Queue a problem for indexing |

---

## Development Workflow

```bash
# Run all apps in dev mode (single command)
pnpm dev

# Type check everything
pnpm typecheck

# Lint everything
pnpm lint

# Run the full Docker stack (production-like)
docker compose up --build
```

### Adding a new problem
1. Create `data/problems/your-slug.json` following `data/problems/schema.json`
2. Run `python ml/embeddings/index_problems.py` to index it

### Changing an AI prompt
Edit `apps/ai/src/services/llm/prompts.py`, then restart the AI service. Run `python ml/eval/benchmark.py` to verify quality didn't regress.

### Running the eval harness
```bash
cd apps/ai
uv run python ../../ml/eval/benchmark.py
```

---

## Troubleshooting

**LiteLLM returns 401**
→ Check `OPENROUTER_API_KEY` is set in `.env` and matches `services/litellm/config.yaml`

**Qdrant search returns empty**
→ Run `ml/embeddings/index_problems.py` — the collection may not be populated yet

**Judge0 times out**
→ The sandbox worker may not be running: `docker compose -f services/judge0/docker-compose.yml up -d judge0-worker`

**`pnpm dev` fails with workspace errors**
→ Run `pnpm install` from the repo root, not inside an individual app

**AI service can't connect to LiteLLM**
→ Confirm Docker containers are up: `docker compose ps`
→ Check `LITELLM_BASE_URL=http://localhost:4000` in `.env`

**Python import errors in `apps/ai`**
→ Make sure you're running via `uv run`, not bare `python` — the venv is managed by uv
