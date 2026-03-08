# ── Imports ───────────────────────────────────────────────────────────────────
# SQLAlchemy for ORM, SQLite for local storage, and datetime for timestamps.
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

import os

# ── Database Configuration ────────────────────────────────────────────────────
# Setup connection parameters and core SQLAlchemy objects for DB interaction.

DATABASE_URL = os.getenv("DATABASE_URL")

# Engine manages the connection pool and dialect; SQLite requires single-thread check bypass for FastAPI.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal is the factory for creating database transactional scopes.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class used for model inheritance to hook into the declarative system.
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────
# Definitions of database tables mapped to Python classes.

class User(Base):
    """Primary user entity containing identity and career context."""
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100))
    email         = Column(String(200), unique=True, index=True)
    field         = Column(String(100))
    gap_months    = Column(Integer)
    created_at    = Column(DateTime, default=datetime.utcnow)


class SkillsAnalysis(Base):
    """Result of AI processing comparing user experience against job requirements."""
    __tablename__ = "skills_analyses"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    cv_text       = Column(Text)
    target_role   = Column(String(200))
    result        = Column(Text)   # Stores structured JSON data
    created_at    = Column(DateTime, default=datetime.utcnow)


class InterviewSession(Base):
    """Log of mock interview questions, user input, and performance metrics."""
    __tablename__ = "interview_sessions"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    job_role      = Column(String(200))
    question      = Column(Text)
    user_answer   = Column(Text)
    feedback      = Column(Text)   # Detailed AI evaluation
    score         = Column(Float)
    created_at    = Column(DateTime, default=datetime.utcnow)


class CVRewrite(Base):
    """Persistent storage for original and AI-optimized resumes."""
    __tablename__ = "cv_rewrites"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    original_cv   = Column(Text)
    rewritten_cv  = Column(Text)
    improvements  = Column(Text)   # Summary of changes made
    created_at    = Column(DateTime, default=datetime.utcnow)


class JobMatch(Base):
    """Job search history and filtered recommendations for the user."""
    __tablename__ = "job_matches"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    filters       = Column(Text)   # Search criteria used
    results       = Column(Text)   # List of matching jobs in JSON
    created_at    = Column(DateTime, default=datetime.utcnow)


class Roadmap(Base):
    """Step-by-step learning path generated to bridge the user's career gap."""
    __tablename__ = "roadmaps"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, index=True)
    field         = Column(String(200))
    gap_months    = Column(Integer)
    roadmap       = Column(Text)   # Structured curriculum content
    created_at    = Column(DateTime, default=datetime.utcnow)


# ── Database Utilities ────────────────────────────────────────────────────────
# Helper functions for managing database lifecycle and sessions.

def get_db():
    """Generator for database sessions to be used as a FastAPI dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Creates all tables defined in the metadata if they do not exist."""
    Base.metadata.create_all(bind=engine)