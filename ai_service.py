"""
ai_service.py
All calls to the Anthropic API live here.
Set ANTHROPIC_API_KEY in your environment before running.
"""

import os
import json
import httpx
from typing import Any, Dict
from fastapi import HTTPException # Added for HTTPException

# Use the API key directly or from env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "IzaSyCOLxFlljZsugniaQdigEsPBSnTH8bGrA0")
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
MODEL   = "gemini-2.0-flash" # Updated model name

HEADERS = {
    "Content-Type": "application/json",
}


async def _call_gemini(system: str, user: str, max_tokens: int = 1500) -> str:
    # Gemini 2.0/1.5 expects a list of contents. 
    # System instruction is a separate field in some versions, 
    # but we can also prepending it to the user prompt for simplicity 
    # or use the system_instruction field if supported by the endpoint.
    
    payload = {
        "contents": [{
            "parts": [{"text": f"{system}\n\nUser Input: {user}"}]
        }],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
        }
    }
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(API_URL, headers=HEADERS, json=payload)
        if resp.status_code != 200:
            print(f"Error from Gemini: {resp.text}")
            resp.raise_for_status()
            
        data = resp.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            print(f"Unexpected Gemini response structure: {data}")
            raise HTTPException(status_code=500, detail="AI Service Error")


def _parse_json(text: str) -> Any:
    """Strip markdown fences and parse JSON."""
    clean = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(clean)


# ── 1. Skills Gap Analyzer ────────────────────────────────────────────────────

async def analyze_skills(cv_text: str, target_role: str) -> Dict:
    system = (
        "You are a career coach specializing in helping women return to work after career breaks. "
        "Respond ONLY with valid JSON, no extra text."
    )
    user = f"""
Analyze this CV against the target role and return a JSON object with this exact structure:
{{
  "missing_skills": [
    {{"skill": "...", "priority": "high|medium|low", "resource": "free URL or course name"}}
  ],
  "existing_strengths": ["strength1", "strength2"],
  "summary": "2-sentence encouraging summary"
}}

TARGET ROLE: {target_role}

CV:
{cv_text}
"""
    raw = await _call_gemini(system, user)
    return _parse_json(raw)


# ── 2. Mock Interview Coach ───────────────────────────────────────────────────

async def generate_interview_question(job_role: str) -> str:
    system = "You are a supportive interview coach. Return ONLY the interview question as plain text."
    user = f"Generate one realistic, mid-level interview question for a {job_role} role."
    return (await _call_gemini(system, user, max_tokens=200)).strip()


async def evaluate_interview_answer(job_role: str, question: str, answer: str) -> Dict:
    system = (
        "You are a supportive interview coach helping women rebuild confidence. "
        "Respond ONLY with valid JSON, no extra text."
    )
    user = f"""
Evaluate this interview answer and return JSON with this exact structure:
{{
  "score": <float 0-10>,
  "confidence_tips": ["tip1", "tip2"],
  "clarity_tips": ["tip1", "tip2"],
  "relevance_tips": ["tip1"],
  "improved_answer_example": "a better version of their answer"
}}

JOB ROLE: {job_role}
QUESTION: {question}
ANSWER: {answer}
"""
    raw = await _call_gemini(system, user)
    return _parse_json(raw)


# ── 3. CV Rewriter ────────────────────────────────────────────────────────────

async def rewrite_cv(original_cv: str) -> Dict:
    system = (
        "You are an expert CV writer who reframes career gaps positively and optimizes for ATS. "
        "Respond ONLY with valid JSON, no extra text."
    )
    user = f"""
Rewrite this CV to remove bias around career gaps, reframe caregiving experience positively,
and optimize for ATS. Return JSON with this exact structure:
{{
  "rewritten_cv": "full rewritten CV text",
  "improvements": [
    {{"section": "...", "original": "...", "rewritten": "...", "reason": "..."}}
  ],
  "ats_score_before": <int 0-100>,
  "ats_score_after": <int 0-100>
}}

ORIGINAL CV:
{original_cv}
"""
    raw = await _call_gemini(system, user, max_tokens=3000)
    return _parse_json(raw)


# ── 4. Flexible Job Matcher ───────────────────────────────────────────────────

async def match_jobs(field: str, location: str, hours: int, seniority: str, remote: bool) -> Dict:
    system = (
        "You are a job matching assistant. Suggest realistic flexible job opportunities. "
        "Respond ONLY with valid JSON, no extra text."
    )
    user = f"""
Generate 5 realistic flexible job listings for someone returning to work in {field}.
Preferences: location={location}, max hours/week={hours}, seniority={seniority}, remote={remote}

Return JSON with this exact structure:
{{
  "jobs": [
    {{
      "title": "...",
      "company": "...",
      "location": "...",
      "hours": "e.g. 25 hrs/week",
      "flexibility_score": <int 1-10>,
      "match_score": <int 1-10>,
      "apply_url": "https://...",
      "why_good_match": "1 sentence"
    }}
  ]
}}
"""
    raw = await _call_gemini(system, user)
    return _parse_json(raw)


# ── 5. Roadmap Generator ──────────────────────────────────────────────────────

async def generate_roadmap(field: str, gap_months: int, target_role: str | None) -> Dict:
    system = (
        "You are a returnship career strategist. "
        "Respond ONLY with valid JSON, no extra text."
    )
    duration = min(8, max(4, gap_months // 3))
    user = f"""
Create a {duration}-week returnship roadmap for someone returning to {field}
after a {gap_months}-month career break{f", targeting {target_role}" if target_role else ""}.

Return JSON with this exact structure:
{{
  "duration_weeks": {duration},
  "weeks": [
    {{
      "week": 1,
      "title": "...",
      "tasks": ["task1", "task2"],
      "resources": ["free URL or resource name"],
      "milestone": "what they'll have achieved"
    }}
  ],
  "recommended_certifications": ["cert1", "cert2"],
  "returnship_programs": [
    {{
      "company": "...",
      "program_name": "...",
      "duration": "e.g. 16 weeks",
      "apply_url": "https://..."
    }}
  ]
}}
"""
    raw = await _call_gemini(system, user, max_tokens=3000)
    return _parse_json(raw)
