"""
ai_service.py
All calls to the Google Gemini API live here.
Set GEMINI_API_KEY in your environment before running.
"""

import os
import json
import httpx
from typing import Any, Dict
from fastapi import HTTPException

MODEL = "gemini-2.5-flash"
HEADERS = {"Content-Type": "application/json"}


def _get_api_url() -> str:
    """Build the API URL fresh on every call so the key is always current."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is not set. Run: export GEMINI_API_KEY=..."
        )
    return f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={api_key}"


async def _call_gemini(system: str, user: str, max_tokens: int = 1500) -> str:
    payload = {
        "system_instruction": {
            "parts": [{"text": system}]
        },
        "contents": [{
            "parts": [{"text": user}]
        }],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
        }
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(_get_api_url(), headers=HEADERS, json=payload)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Gemini API error {resp.status_code}: {resp.text}"
            )

        data = resp.json()
        try:
            candidate = data["candidates"][0]
            # Detect truncation — if finishReason is MAX_TOKENS the JSON is incomplete
            finish_reason = candidate.get("finishReason", "")
            if finish_reason == "MAX_TOKENS":
                raise HTTPException(
                    status_code=500,
                    detail="Gemini response was truncated (MAX_TOKENS). Increase max_tokens or shorten the prompt."
                )
            return candidate["content"]["parts"][0]["text"]
        except HTTPException:
            raise
        except (KeyError, IndexError):
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected Gemini response structure: {data}"
            )


def _parse_json(text: str) -> Any:
    """
    Robustly extract and parse JSON from Gemini responses.
    Strategy: find the first { or [ and the last } or ] and parse whatever is between.
    This handles all fence variations and any extra text before/after.
    """
    clean = text.strip()

    # Find the first JSON object or array
    start = -1
    end = -1
    for i, ch in enumerate(clean):
        if ch in ('{', '['):
            start = i
            break
    for i in range(len(clean) - 1, -1, -1):
        if clean[i] in ('}', ']'):
            end = i
            break

    if start == -1 or end == -1 or end < start:
        raise HTTPException(
            status_code=500,
            detail=f"No JSON found in AI response. Raw response: {text[:300]}"
        )

    json_str = clean[start:end + 1]

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response as JSON: {e}. Raw response: {text[:300]}"
        )


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
    raw = await _call_gemini(system, user, max_tokens=3000)
    return _parse_json(raw)


# ── 2. Mock Interview Coach ───────────────────────────────────────────────────

async def generate_interview_question(job_role: str) -> str:
    system = "You are a supportive interview coach. Return ONLY the interview question as plain text."
    user = f"Generate one realistic, mid-level interview question for a {job_role} role."
    return (await _call_gemini(system, user, max_tokens=1000)).strip()


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