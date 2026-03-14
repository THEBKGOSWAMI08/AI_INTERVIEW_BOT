# AI Interview Platform — Hackathon Plan

**Purpose:** A concise, shareable project plan and roadmap so all four team members (new to web dev but strong in Python/AI) can start coding immediately and deliver a working end-to-end demo for the hackathon.

---

# 1. Quick Overview

**Goal:** Build an adaptive AI interview platform combining resume-driven questions, LLM-based evaluation, and client-side rPPG (webcam) for composure/BPM measurements. Focus on a complete working pipeline and a polished demo story rather than perfect engineering.

**High-level architecture (simplified):**

```
Frontend (Next.js)
        │
        │ API + WebSocket
        ▼
Backend (FastAPI)
        │
        ├── AI logic (LLM + embeddings)
        ├── Resume parser
        ├── rPPG processing
        └── Code evaluation (Judge0)
```

Keep the majority of logic in Python so the team leverages existing strengths.

---

# 2. Role Map (Primary + Secondary)

> Each member has a primary area and a small secondary area (backup/overlap) to reduce bus-factor and distribute integration tasks.

## Member 1 — Frontend Lead (UI + UX + Demo)

**Primary responsibilities**
- Build Next.js + Tailwind UI: login/signup, profile page, dashboard, schedule flow, interview UI, results page.
- Integrate Monaco Editor for coding problems (UI only).
- Implement text + voice display of questions using Web Speech API (TTS).
- Implement UI visualizations: BPM graph, composure score, per-question feedback.

**Secondary responsibilities**
- Wire the frontend to mocked backend during early dev; implement feature flags for offline demo.

**Deliverables**
- React components: `Auth`, `ProfileForm`, `Dashboard`, `InterviewPage`, `ReportPage`, `MonacoEditorPanel`.
- UI storybook pages or demo routes with mock props for judges.
- `README.frontend` with local start steps and ENV variables.

---

## Member 2 — Client rPPG Engineer (Webcam + Signal)

**Primary responsibilities**
- Implement client-side rPPG pipeline: `getUserMedia` → MediaPipe FaceMesh ROI → RGB extraction → lightweight pre-processing and windowed buffering.
- Emit numeric arrays (no raw video) over WebSocket to backend.
- Provide local BPM estimation for immediate UI feedback (FFT or peak detection).
- Provide simple "quality" metrics (face present, lighting OK, motion detected).

**Secondary responsibilities**
- Help Frontend Lead integrate BPM graph and UI hooks.

**Deliverables**
- `rppg-client.js` module with public functions: `startStream()`, `stopStream()`, `getFrameData()`.
- WebSocket sender client that emits `rppg_frame` messages.
- Demo page that shows live BPM and quality indicator.
- `README.rppg` for tuning parameters and testing tips.

---

## Member 3 — Backend & Real-time Lead (APIs, WebSockets, Judge0)

**Primary responsibilities**
- FastAPI server with REST endpoints and WebSocket handlers for real-time rPPG messages and interview orchestration.
- Integrate Judge0 (self-hosted or hosted) for code evaluation.
- Persist interviews, logs, and results to Supabase (or chosen DB).
- Implement a simple job queue interface for heavy tasks (Redis or in-process worker for hackathon).

**Secondary responsibilities**
- Provide mock LLM endpoint or adapter for AI Lead to develop against without final LLM.

**Deliverables**
- FastAPI project exposing:
  - REST: `POST /api/schedule`, `POST /api/start_interview`, `GET /api/report/{id}`
  - WS: `/ws/interview/{session_id}`
- Judge0 integration module
- DB schema scripts (users, profiles, interviews, answers, bpm_samples)
- `README.backend` with run commands and ENV vars

---

## Member 4 — AI & Evaluation Lead (LLM, embeddings, parsing, scoring)

**Primary responsibilities**
- Resume & JD parsing pipeline (PyMuPDF → lightweight NLP rules → canonical JSON).
- Embedding pipeline: `sentence-transformers` (all-MiniLM-L6-v2) to build embeddings and similarity scoring service.
- LLM prompts & orchestration: question generation, adaptive difficulty using BPM context, answer evaluation prompts (LLM + embeddings).
- Produce scoring & normalization logic (combine semantic similarity, rubric checks, LLM judgement, and composure metrics).

**Secondary responsibilities**
- Provide an API for backend for `next_question` and `evaluate_answer` endpoints.
- Build local mock that returns testable outputs before production LLM integration.

**Deliverables**
- `ai_service/` exposing:
  - `POST /ai/next_question` (input: profile + resume_summary + bpm_context → question object)
  - `POST /ai/evaluate_answer` (input: question + answer + resume → scoring JSON)
- Parsing utilities & tests
- `README.ai` documenting prompt templates, env needs, and mock mode run instructions

---

# 3. Integration Contracts (Exact — give these on Day 1)

_Mock early. Implement these exact payload shapes to avoid rework._

## WebSocket messages (JSON)

**Client → Server (sent over `/ws/interview/{session_id}`)**

### rppg_frame (high frequency, compact)

```json
{
  "type": "rppg_frame",
  "timestamp": 1680000000,
  "frames": [
    {"t":0, "r":0.45, "g":0.48, "b":0.47},
    {"t":33, "r":0.46, "g":0.49, "b":0.46}
  ]
}
```

**Notes:** Keep `frames` arrays small. Use compact numeric arrays only (no raw images).


**Server → Client**

### processed status update

```json
{
  "type": "status",
  "bpm": 82.5,
  "stress_level": "moderate",   // low|moderate|high
  "confidence": 0.82,
  "action": "soften_next_question" // optional command hint to frontend/AI
}
```

---

## Interview control messages

**question** (sent by server or AI)

```json
{
  "type": "question",
  "id": "q1",
  "text": "Explain X",
  "choices": null,
  "mode": "coding|text"
}
```

**eval_result** (after evaluation)

```json
{
  "type": "eval_result",
  "question_id": "q1",
  "score": 72,
  "feedback": "..."
}
```

**Design note:** Keep payloads small and numeric arrays compact. Mock these early so the frontend can render flows.

---

## REST endpoints (minimal — mock them early)

- `POST /api/schedule` → schedule interview (returns `session_id`)
- `POST /api/start_interview` → marks interview started, returns `ws_url`
- `POST /api/submit_answer` → optional; used if answers sent via REST (text/code)
- `GET /api/report/{id}` → final report JSON (frontend uses to render results)

_Define and mock these early so Frontend can use fake data._

---

# 4. Repo / Branching / Workflow Rules

**One repo** with clearly separated folders: `frontend/`, `backend/`, `ai_service/`, `rppg_client/` (or `rppg` inside frontend).

**Branching**

```
main (stable demo-ready)
dev (integration)
feature branches: feat/<member>-<task>
```

- Each member pushes only to their feature branches.
- PRs to `dev` must pass a lightweight checklist (manual review or CI smoke tests).

**Local integration**
- Use a single `docker-compose.yml` for local integration (FastAPI + Postgres + Judge0 + mock-llm).
- Each member should be able to `docker-compose up` and get a working stack with mock data.

---

# 5. Integration Plan & Checkpoints (Sequence — follow this order)

> Do these steps in this order. Implement mocks early.

## Day-zero setup
- Everyone clones the repo, runs `docker-compose up` (backend + db + judge0 + mock-ai).
- Agree on env vars and add `.env.example` to repo.

## Mock-first integration
- Backend implements endpoints and WS with mocked AI responses.
- Frontend connects to backend with mocks to render flows.
- rPPG dev provides an `rppg_simulator` (script that sends fake frames) so backend+frontend can test without camera.

## Parallel feature build
- Each member builds primary tasks against the mocks.
- AI Lead builds real prompt templates & test harness locally using mock LLM adapter to start.

## First integration
- Swap mock AI for real AI adapter (Ollama or Gemini) if available.
- Integrate Judge0 endpoints.

## End-to-end pass
- Run a complete interview session and fix gaps.
- Add per-question BPM overlay and evaluation.

## Polish & Demo
- Tidy UI flows, ensure accessibility of demo steps, record a short demo script.

---

# 6. Testing, Fallbacks & Demo Tips

**Smoke commands** (each module should have a simple command):
- Frontend: `npm run dev`
- Backend: `uvicorn app.main:app --reload` or `uvicorn main:app --reload`
- AI: `python ai_service/mock_server.py`
- rPPG: `npm run demo` (or a simple `node rppg_simulator.js`)

**Fallbacks**
- If rPPG fails in demo, show canned BPM traces and explain limits.
- If LLM quota is hit, switch to saved "demo mode" answers.

**Demo script tips**
- Create a one-page script for the presenter listing exact clicks and expected outputs (helps if network flaps).
- Assign: 1 person to run demo, 1 person to monitor backend logs.

---

# 7. Integration Responsibilities & Conflict Avoidance

**Integration lead:** Member 3 (Backend) will merge to `dev` and resolve API contract mismatches. All members must review merges.

**Cross-pair backups:**
- Frontend ↔ rPPG (Member 1 & Member 2)
- Backend ↔ AI (Member 3 & Member 4)

**PR practice:** Frequent small PRs rather than large merges.

---

# 8. Acceptance Criteria ("Done" for each module)

- **Frontend:** Login → Profile → Schedule → Start interview page loads, connects to WS, shows question and BPM graph (mock OK).
- **rPPG client:** When camera allowed, browser emits `rppg_frame` messages and shows local BPM (or demo simulation).
- **Backend:** Accepts WS messages, responds with `status` and `question` messages, stores BPM and answers.
- **AI service:** Given resume+context returns valid `question` object and `eval_result` JSON. Has a mock mode.

---

# 9. Phased Roadmap (Practical, hackathon-focused)

**Constraints:** None of you have strong web dev experience but you do know Python/AI/ML. Roadmap reduces frontend complexity, reuses Python, focuses on end-to-end demo and avoids overengineering.

## Phase 1 — Basic interview system (first ~4 hours)
- Everyone focuses on minimal functionality.

**Member 1 (Frontend)**
- Learn Next.js basics and create pages: `/login`, `/dashboard`, `/interview`, `/report`.
- Build a simple interview page: show question, answer textbox, submit button.
- Wire `fetch('/api/question')` to backend mock.

**Member 3 (Backend)**
- Create FastAPI server and a simple endpoint `GET /question` that returns a hard-coded question.
- Run server with `uvicorn`.

**Member 4 (AI)**
- Create a local question generator (mock). Return simple text questions.

**Member 2 (rPPG)**
- Confirm webcam capture works, detect face using MediaPipe or OpenCV, and extract face ROI.

## Phase 2 — Smart AI interview (next ~5–6 hours)
- Add dynamic question generation and session management.

**Member 4 (AI)**
- Implement question generator that uses resume/skill info and previous answers.

**Member 3 (Backend)**
- Implement interview session handling (in-memory store acceptable).
- Create `POST /api/start_interview` returning `ws_url`.

**Member 1 (Frontend)**
- Add TTS using `SpeechSynthesis` API and simple timer UI.

**Member 2 (rPPG)**
- Prototype rPPG pipeline on client and show local BPM estimate.

## Phase 3 — Evaluation + Embeddings (next ~6–8 hours)
- Build automatic answer scoring and report generation.

**Member 4 (AI)**
- Use `sentence-transformers` to compute similarity between expected and candidate answers and produce a score.

**Member 3 (Backend)**
- Add `POST /api/evaluate` endpoint and store results.

**Member 1 (Frontend)**
- Build Report page showing technical score, communication score and stress score (use Chart.js).

**Member 2 (rPPG)**
- Send `rppg_frame` messages via WS and integrate BPM overlays in UI.

## Phase 4 — Polish & Demo (last ~4–6 hours)
- Swap mock LLM for a real adapter (if available), integrate Judge0, fix UX, and create demo script.

**Polish items:**
- Resume upload & parsing (PyMuPDF)
- Adaptive difficulty: if BPM > threshold, AI chooses easier behavioral question; else increase difficulty
- Final report & export

---

# 10. Final Feature Set (Hackathon-ready minimum)

- AI interviewer (resume-aware questions)
- Semantic answer evaluation (embeddings + simple rubric)
- Coding environment (Monaco editor UI only, evaluated via Judge0)
- Webcam-based stress detection (client-side rPPG or canned trace)
- Adaptive interview difficulty using BPM context
- Final feedback report

---

# 11. Project Folder Structure (copy into repo root)

```
ai-interview-platform/
│
├── frontend/                # Next.js app (Member 1)
│
├── backend/                 # FastAPI server (Member 3)
│
├── ai_engine/               # AI logic & evaluation (Member 4)
│
├── stress_detection/        # rPPG + webcam processing (Member 2)
│
├── shared/                  # Shared models / schemas
│
├── scripts/                 # Setup scripts
│
└── docker-compose.yml       # Local integration
```

**Frontend sketch**
```
frontend/
├── app/
│   ├── page.js
│   ├── login/page.js
│   ├── dashboard/page.js
│   ├── interview/page.js
│   └── report/page.js
├── components/
└── services/api.js
```

**Backend sketch**
```
backend/
├── main.py
├── routes/
└── websocket/
```

**AI engine sketch**
```
ai_engine/
├── question_generator.py
├── answer_evaluator.py
└── resume_parser.py
```

**rPPG sketch**
```
stress_detection/
├── rppg_pipeline.py
├── webcam_stream.js
└── rppg_simulator.js
```

---

# 12. Useful Code Snippets (copy/paste)

**FastAPI example (backend/main.py)**

```python
from fastapi import FastAPI
app = FastAPI()

@app.get('/question')
def get_question():
    return {'question': 'Explain overfitting vs underfitting.'}

# run: uvicorn main:app --reload
```

**Frontend fetch example (services/api.js)**

```js
export async function getQuestion() {
  const res = await fetch('http://localhost:8000/question')
  return res.json()
}
```

**Simple rPPG-client public API (rppg-client.js)**

```js
export async function startStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  // attach to video element, run mediapipe face mesh, extract RGB signals
}

export function stopStream() {
  // stop tracks
}
```

**Sentence-transformers similarity (ai_engine/answer_evaluator.py)**

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

def similarity_score(expected: str, candidate: str) -> float:
    e = model.encode([expected])
    c = model.encode([candidate])
    return float(cosine_similarity(e, c)[0][0]) * 100
```

---

# 13. Acceptance & Demo Checklist (for the 5-minute demo)

- [ ] `docker-compose up` brings services online with mock data.
- [ ] Presenter logs in (or demo uses guest mode).
- [ ] Upload resume → AI generates first question.
- [ ] Candidate answers (textbox or Monaco) → backend evaluates → report updated.
- [ ] Demo shows BPM graph (live or canned trace) and adaptive question changing difficulty.
- [ ] Final report displayed with scores and improvement tips.

---

# 14. Practical Tips to Survive the Hackathon

- Start with mock data early — integration kills timelines.
- Keep a single, well-rehearsed demo story that shows end-to-end flow.
- Use environment variables and include `.env.example`.
- Assign 1 person to run the demo and 1 to watch logs during presentation.
- Prefer small, testable PRs and pair programming for tricky merges.

---

# 15. Next actions I can do for you

Choose one and I will produce it directly:

1. Generate a `docker-compose.yml` layout for the whole stack (FastAPI + Postgres + Supabase emulator/mocks + Judge0 + mock-llm).
2. Produce exact JSON schemas for REST endpoints and sample request/response bodies for each API.
3. Create a ready-to-copy `README.frontend`, `README.backend`, `README.ai`, and `README.rppg` with commands and env examples.


---

*Document generated to be shared with your team. Keep `.env.example` and mock-data accessible in the repo root for fast setup.*

