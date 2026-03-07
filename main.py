"""
main.py  –  Returnship API
Run with:  uvicorn main:app --reload
Docs at:   http://localhost:8000/docs
"""

import json
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, init_db, User, SkillsAnalysis, InterviewSession, CVRewrite, JobMatch, Roadmap
from schemas import (
    UserCreate, UserResponse,
    SkillsAnalysisRequest, SkillsAnalysisResponse, SkillGap,
    InterviewStartRequest, InterviewStartResponse,
    InterviewAnswerRequest, InterviewAnswerResponse, InterviewFeedback,
    CVRewriteRequest, CVRewriteResponse, CVImprovement,
    JobMatchRequest, JobMatchResponse, JobListing,
    RoadmapRequest, RoadmapResponse, RoadmapWeek, ReturnshipProgram,
)
import ai_service

# ── App setup ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialise the database
    init_db()
    yield

app = FastAPI(
    title="Returnship API",
    description="5 AI-powered tools to help women return to work after career breaks.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Returnship API is running 🚀"}


# ── Users ─────────────────────────────────────────────────────────────────────

@app.post("/users", response_model=UserResponse, tags=["Users"])
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Feature 1: Skills Gap Analyzer ───────────────────────────────────────────

@app.post("/skills/analyze", response_model=SkillsAnalysisResponse, tags=["1. Skills Gap Analyzer"])
async def analyze_skills(payload: SkillsAnalysisRequest, db: Session = Depends(get_db)):
    """
    Upload your CV text and a target role.
    Returns prioritized missing skills with free learning resources.
    """
    result = await ai_service.analyze_skills(payload.cv_text, payload.target_role)

    record = SkillsAnalysis(
        user_id=payload.user_id,
        cv_text=payload.cv_text,
        target_role=payload.target_role,
        result=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return SkillsAnalysisResponse(
        id=record.id,
        target_role=payload.target_role,
        missing_skills=[SkillGap(**s) for s in result["missing_skills"]],
        existing_strengths=result["existing_strengths"],
        summary=result["summary"],
        created_at=record.created_at,
    )


@app.get("/skills/history/{user_id}", tags=["1. Skills Gap Analyzer"])
def skills_history(user_id: int, db: Session = Depends(get_db)):
    """Get all past skills analyses for a user."""
    records = db.query(SkillsAnalysis).filter(SkillsAnalysis.user_id == user_id).all()
    return [{"id": r.id, "target_role": r.target_role, "created_at": r.created_at} for r in records]


# ── Feature 2: Mock Interview Coach ──────────────────────────────────────────

@app.post("/interview/start", response_model=InterviewStartResponse, tags=["2. Interview Coach"])
async def start_interview(payload: InterviewStartRequest, db: Session = Depends(get_db)):
    """
    Start a mock interview session for a given job role.
    Returns the first interview question.
    """
    question = await ai_service.generate_interview_question(payload.job_role)

    session = InterviewSession(
        user_id=payload.user_id,
        job_role=payload.job_role,
        question=question,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return InterviewStartResponse(
        session_id=session.id,
        job_role=payload.job_role,
        question=question,
    )


@app.post("/interview/answer", response_model=InterviewAnswerResponse, tags=["2. Interview Coach"])
async def submit_answer(payload: InterviewAnswerRequest, db: Session = Depends(get_db)):
    """
    Submit your answer to be scored.
    Returns detailed feedback on confidence, clarity, and relevance.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    feedback = await ai_service.evaluate_interview_answer(
        session.job_role, session.question, payload.answer
    )

    feedback_obj = InterviewFeedback(**feedback)
    session.user_answer = payload.answer
    session.feedback = json.dumps(feedback)
    session.score = feedback_obj.score
    db.commit()
    db.refresh(session)

    return InterviewAnswerResponse(
        session_id=session.id,
        feedback=feedback_obj,
        created_at=session.created_at,
    )


@app.get("/interview/history/{user_id}", tags=["2. Interview Coach"])
def interview_history(user_id: int, db: Session = Depends(get_db)):
    """Get all past interview sessions and scores for a user."""
    records = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()
    return [
        {"id": r.id, "job_role": r.job_role, "score": r.score, "created_at": r.created_at}
        for r in records
    ]


# ── Feature 3: Bias-Proof CV Rewriter ────────────────────────────────────────

@app.post("/cv/rewrite", response_model=CVRewriteResponse, tags=["3. CV Rewriter"])
async def rewrite_cv(payload: CVRewriteRequest, db: Session = Depends(get_db)):
    """
    Submit your CV with career gaps.
    Returns an ATS-optimized, bias-free rewrite with tracked improvements.
    """
    result = await ai_service.rewrite_cv(payload.original_cv)

    record = CVRewrite(
        user_id=payload.user_id,
        original_cv=payload.original_cv,
        rewritten_cv=result["rewritten_cv"],
        improvements=json.dumps(result["improvements"]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return CVRewriteResponse(
        id=record.id,
        rewritten_cv=result["rewritten_cv"],
        improvements=[CVImprovement(**i) for i in result["improvements"]],
        ats_score_before=result["ats_score_before"],
        ats_score_after=result["ats_score_after"],
        created_at=record.created_at,
    )


@app.get("/cv/history/{user_id}", tags=["3. CV Rewriter"])
def cv_history(user_id: int, db: Session = Depends(get_db)):
    """Get all CV rewrites for a user."""
    records = db.query(CVRewrite).filter(CVRewrite.user_id == user_id).all()
    return [{"id": r.id, "created_at": r.created_at} for r in records]



# ── Feature 5: Returnship Roadmap Generator ───────────────────────────────────

@app.post("/roadmap/generate", response_model=RoadmapResponse, tags=["5. Roadmap Generator"])
async def generate_roadmap(payload: RoadmapRequest, db: Session = Depends(get_db)):
    """
    Input your field and career gap length.
    Returns a personalized week-by-week re-entry plan with certifications and returnship programs.
    """
    result = await ai_service.generate_roadmap(
        payload.field, payload.gap_months, payload.target_role
    )

    record = Roadmap(
        user_id=payload.user_id,
        field=payload.field,
        gap_months=payload.gap_months,
        roadmap=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return RoadmapResponse(
        id=record.id,
        field=payload.field,
        gap_months=payload.gap_months,
        duration_weeks=result["duration_weeks"],
        weeks=[RoadmapWeek(**w) for w in result["weeks"]],
        recommended_certifications=result["recommended_certifications"],
        returnship_programs=[ReturnshipProgram(**p) for p in result["returnship_programs"]],
        created_at=record.created_at,
    )


@app.get("/roadmap/history/{user_id}", tags=["5. Roadmap Generator"])
def roadmap_history(user_id: int, db: Session = Depends(get_db)):
    """Get all roadmaps generated for a user."""
    records = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    return [{"id": r.id, "field": r.field, "gap_months": r.gap_months, "created_at": r.created_at} for r in records]