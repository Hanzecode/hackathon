"""
main.py  –  Returnship API
Run with:  uvicorn main:app --reload
Docs at:   http://localhost:8000/docs
"""

import json
import io
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# ── File text extraction ──────────────────────────────────────────────────────
def extract_text_from_file(filename: str, content: bytes) -> str:
    """Extract plain text from PDF or DOCX file bytes."""
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except ImportError:
            raise HTTPException(status_code=500, detail="pypdf not installed. Run: pip install pypdf")

    elif ext in ("docx", "doc"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
        except ImportError:
            raise HTTPException(status_code=500, detail="python-docx not installed. Run: pip install python-docx")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '.{ext}'. Please upload a PDF or DOCX file.")

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

app = FastAPI(
    title="Returnship API",
    description="5 AI-powered tools to help women return to work after career breaks.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()


@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def generic_error_handler(request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(status_code=500, content={"detail": f"{type(exc).__name__}: {str(exc)}"})


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
async def analyze_skills(
    user_id: int = Form(...),
    target_role: str = Form(...),
    file: UploadFile = File(None),
    cv_text: str = Form(None),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF/DOCX file OR paste CV text, plus a target role.
    Returns prioritized missing skills with free learning resources.
    """
    # Extract text from file if provided, otherwise use plain text
    if file and file.filename:
        raw_bytes = await file.read()
        cv_content = extract_text_from_file(file.filename, raw_bytes)
    elif cv_text:
        cv_content = cv_text
    else:
        raise HTTPException(status_code=400, detail="Provide either a file upload or cv_text.")

    result = await ai_service.analyze_skills(cv_content, target_role)

    record = SkillsAnalysis(
        user_id=user_id,
        cv_text=cv_content,
        target_role=target_role,
        result=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return SkillsAnalysisResponse(
        id=record.id,
        target_role=target_role,
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

    session.user_answer = payload.answer
    session.feedback = json.dumps(feedback)
    session.score = feedback["score"]
    db.commit()
    db.refresh(session)

    return InterviewAnswerResponse(
        session_id=session.id,
        feedback=InterviewFeedback(**feedback),
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
async def rewrite_cv(
    user_id: int = Form(...),
    file: UploadFile = File(None),
    original_cv: str = Form(None),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF/DOCX file OR paste CV text.
    Returns an ATS-optimized, bias-free rewrite with tracked improvements.
    """
    # Extract text from file if provided, otherwise use plain text
    if file and file.filename:
        raw_bytes = await file.read()
        cv_content = extract_text_from_file(file.filename, raw_bytes)
    elif original_cv:
        cv_content = original_cv
    else:
        raise HTTPException(status_code=400, detail="Provide either a file upload or original_cv text.")

    result = await ai_service.rewrite_cv(cv_content)

    record = CVRewrite(
        user_id=user_id,
        original_cv=cv_content,
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