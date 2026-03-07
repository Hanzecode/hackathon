from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    field: str
    gap_months: int

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    field: str
    gap_months: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── 1. Skills Gap Analyzer ────────────────────────────────────────────────────

class SkillsAnalysisRequest(BaseModel):
    user_id: int
    cv_text: str
    target_role: str

class SkillGap(BaseModel):
    skill: str
    priority: str        # high / medium / low
    resource: str        # free learning link or suggestion

class SkillsAnalysisResponse(BaseModel):
    id: int
    target_role: str
    missing_skills: List[SkillGap]
    existing_strengths: List[str]
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── 2. Mock Interview Coach ───────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    user_id: int
    job_role: str

class InterviewStartResponse(BaseModel):
    session_id: int
    job_role: str
    question: str

class InterviewAnswerRequest(BaseModel):
    session_id: int
    answer: str

class InterviewFeedback(BaseModel):
    score: float                  # 0–10
    confidence_tips: List[str]
    clarity_tips: List[str]
    relevance_tips: List[str]
    improved_answer_example: str

class InterviewAnswerResponse(BaseModel):
    session_id: int
    feedback: InterviewFeedback
    created_at: datetime

    class Config:
        from_attributes = True


# ── 3. Bias-Proof CV Rewriter ─────────────────────────────────────────────────

class CVRewriteRequest(BaseModel):
    user_id: int
    original_cv: str

class CVImprovement(BaseModel):
    section: str
    original: str
    rewritten: str
    reason: str

class CVRewriteResponse(BaseModel):
    id: int
    rewritten_cv: str
    improvements: List[CVImprovement]
    ats_score_before: int
    ats_score_after: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── 4. Flexible Job Matcher ───────────────────────────────────────────────────

class JobMatchRequest(BaseModel):
    user_id: int
    field: str
    location: Optional[str] = "remote"
    hours_per_week: Optional[int] = 30
    seniority: Optional[str] = "mid"   # junior / mid / senior
    remote: Optional[bool] = True

class JobListing(BaseModel):
    title: str
    company: str
    location: str
    hours: str
    flexibility_score: int   # 1–10
    match_score: int         # 1–10
    apply_url: str
    why_good_match: str

class JobMatchResponse(BaseModel):
    id: int
    total_found: int
    jobs: List[JobListing]
    created_at: datetime

    class Config:
        from_attributes = True


# ── 5. Returnship Roadmap Generator ──────────────────────────────────────────

class RoadmapRequest(BaseModel):
    user_id: int
    field: str
    gap_months: int
    target_role: Optional[str] = None

class RoadmapWeek(BaseModel):
    week: int
    title: str
    tasks: List[str]
    resources: List[str]
    milestone: str

class ReturnshipProgram(BaseModel):
    company: str
    program_name: str
    duration: str
    apply_url: str

class RoadmapResponse(BaseModel):
    id: int
    field: str
    gap_months: int
    duration_weeks: int
    weeks: List[RoadmapWeek]
    recommended_certifications: List[str]
    returnship_programs: List[ReturnshipProgram]
    created_at: datetime

    class Config:
        from_attributes = True
