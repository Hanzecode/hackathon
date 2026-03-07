from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# ── Database Configuration ────────────────────────────────────────────────────

DATABASE_URL = "sqlite:///./returnship.db"

# Create the SQLAlchemy engine. 'check_same_thread' is False for SQLite compatibility with FastAPI.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Session factory for creating new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative class definitions
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    """Stores basic user profile and returnship context."""
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100))
    email         = Column(String(200), unique=True, index=True)
    field         = Column(String(100))
    gap_months    = Column(Integer)
    created_at    = Column(DateTime, default=datetime.utcnow)


class SkillsAnalysis(Base):
    """Stores AI-generated gap analysis between a user's CV and a target role."""
    __tablename__ = "skills_analyses"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    cv_text       = Column(Text)
    target_role   = Column(String(200))
    result        = Column(Text)   # JSON string containing analysis details
    created_at    = Column(DateTime, default=datetime.utcnow)


class InterviewSession(Base):
    """Records mock interview interactions, user responses, and AI feedback."""
    __tablename__ = "interview_sessions"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    job_role      = Column(String(200))
    question      = Column(Text)
    user_answer   = Column(Text)
    feedback      = Column(Text)   # JSON string containing evaluation
    score         = Column(Float)
    created_at    = Column(DateTime, default=datetime.utcnow)


class CVRewrite(Base):
    """Maintains history of CV improvements and rewritten content."""
    __tablename__ = "cv_rewrites"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    original_cv   = Column(Text)
    rewritten_cv  = Column(Text)
    improvements  = Column(Text)   # JSON string listing specific changes
    created_at    = Column(DateTime, default=datetime.utcnow)


class JobMatch(Base):
    """Stores job search results and the filters used to generate them."""
    __tablename__ = "job_matches"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    filters       = Column(Text)   # JSON string of search parameters
    results       = Column(Text)   # JSON string of matched job listings
    created_at    = Column(DateTime, default=datetime.utcnow)


class Roadmap(Base):
    """Stores personalized learning paths for users to bridge their career gaps."""
    __tablename__ = "roadmaps"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    field         = Column(String(200))
    gap_months    = Column(Integer)
    roadmap       = Column(Text)   # JSON string of the structured learning path
    created_at    = Column(DateTime, default=datetime.utcnow)


# ── Database Utilities ────────────────────────────────────────────────────────

def get_db():
    """Dependency that provides a database session and ensures it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes the database by creating all defined tables."""
    Base.metadata.create_all(bind=engine)
