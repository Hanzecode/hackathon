# Returnship API 🚀

AI-powered FastAPI backend helping women return to work after career breaks using Google Gemini.

## Features
| # | Endpoint | What it does |
|---|----------|-------------|
| 1 | `POST /skills/analyze` | CV skills gap analysis vs target role |
| 2 | `POST /interview/start` + `/answer` | Mock interview with AI scoring |
| 3 | `POST /cv/rewrite` | Bias-free, ATS-optimized CV rewrite |
| 4 | `POST /jobs/match` | Flexible job matching |
| 5 | `POST /roadmap/generate` | Personalized week-by-week re-entry plan |

---

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set your Gemini API key
export GEMINI_API_KEY=AIza...

# 3. Run the server
uvicorn main:app --reload
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Quick Start

### Register a user
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Sarah", "email": "sarah@example.com", "field": "Marketing", "gap_months": 18}'
```

### 1. Analyze skills gap
```bash
curl -X POST http://localhost:8000/skills/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "cv_text": "10 years marketing experience, last role Senior Brand Manager 2021...",
    "target_role": "Head of Digital Marketing"
  }'
```

### 2. Start a mock interview
```bash
curl -X POST http://localhost:8000/interview/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "job_role": "Product Manager"}'
# Returns a session_id and question

curl -X POST http://localhost:8000/interview/answer \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1, "answer": "In my previous role I led a team of 5..."}'
```

### 3. Rewrite CV
```bash
curl -X POST http://localhost:8000/cv/rewrite \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "original_cv": "...your CV text..."}'
```

### 4. Match flexible jobs
```bash
curl -X POST http://localhost:8000/jobs/match \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "field": "Marketing",
    "location": "London",
    "hours_per_week": 25,
    "seniority": "mid",
    "remote": true
  }'
```

### 5. Generate returnship roadmap
```bash
curl -X POST http://localhost:8000/roadmap/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "field": "Software Engineering",
    "gap_months": 24,
    "target_role": "Senior Frontend Developer"
  }'
```

---

## Project Structure
```
returnship_api/
├── main.py          # FastAPI routes
├── database.py      # SQLite models & session
├── schemas.py       # Pydantic request/response models
├── ai_service.py    # All Google Gemini API calls
├── requirements.txt
└── returnship.db    # Auto-created on first run
```

## Database
SQLite auto-creates `returnship.db` on startup. All AI results are stored for history/retrieval.
Each feature has a `GET /{feature}/history/{user_id}` endpoint to fetch past results.