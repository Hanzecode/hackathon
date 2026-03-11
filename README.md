# 🌸 CareerWomen: AI-Powered Career Re-entry Platform

**Empowering women to return to the workforce after career breaks with the power of Google Gemini AI.**

CareerWomen is a full-stack platform designed specifically for women navigating career gaps (due to caregiving, personal health, or breaks). It provides a suite of five AI-powered tools to rebuild confidence, optimize skills, and streamline the journey back to professional life.

---

## 🚀 Vision
Many talented women face hurdles when re-entering the workforce. CareerWomen uses **Google Gemini AI** to remove bias from CVs, identify emerging skill gaps during breaks, and provide a supportive environment for interview practice.

---

## ✨ Features (AI-Powered)

| Feature | Description | Gemini AI Role |
| :--- | :--- | :--- |
| **CV Bias-Proofing** | ATS-optimized CV rewrite that reframes career gaps as growth periods. | Reframes caregiving & hiatuses into professional "transferable skills". |
| **Mock Interview Coach** | A realistic, role-specific chatbot for interview practice. | Generates role-specific questions and scores answers on confidence, clarity, and relevance. |
| **Mentorship Roadmap** | personalized week-by-week re-entry plan. | Crafts a custom learning path and suggests real returnship programs (e.g., Google's Reach). |

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **Database**: [SQLite](https://sqlite.org/) (via SQLAlchemy)
- **AI Engine**: [Google Gemini Pro / Flash](https://ai.google.dev/)
- **Infrastructure**: [Docker](https://www.docker.com/) & Docker Compose
- **File Processing**: `pypdf` & `python-docx` for CV parsing

---

## ⚙️ Project Structure

```text
/
├── App.jsx            # Single-page React frontend with custom design system
├── main.py            # FastAPI entry point & API routes
├── ai_service.py      # Integration with Google Gemini API
├── database.py        # SQLAlchemy models & database session
├── schemas.py         # Pydantic request/response models
├── compose.yaml       # Docker Compose setup
├── Dockerfile         # Backend container definition
├── requirements.txt   # Python dependencies
└── returnship.db      # SQLite database (auto-generated)
```

---

## 🏃 Local Setup

### 1. Prerequisites
- Python 3.12+
- Node.js (for frontend)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set your API Key (Environment Variable)
export GEMINI_API_KEY="your_api_key_here"

# Run the server
uvicorn main:app --reload
```
*API will be available at `http://localhost:8000`. Docs at `/docs`.*

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*Frontend will be available at `http://localhost:3000` (or check console).*

---

## 🐳 Running with Docker

You can run the entire stack (exclusive of the external Gemini API) using Docker.

1.  Create a `.env` file in the root:
    ```env
    GEMINI_API_KEY=your_actual_key_here
    DATABASE_URL=sqlite:////app/data/returnship.db
    ```
2.  Run with Compose:
    ```bash
    docker compose up --build
    ```
*Note: The current `compose.yaml` is configured to serve the backend on port 8000 and the frontend on port 3000.*

---

## 📄 API Documentation

### 1. Interview Simulation
- `POST /interview/start` (json: `{job_role}`)
- `POST /interview/answer` (json: `{session_id, answer}`)

### 2. CV Rewrite (Bias-Proof)
`POST /cv/rewrite` (form-data: `file` or `original_cv`)

### 3. Roadmap Generation
`POST /roadmap/generate` (json: `{field, gap_months, target_role}`)

---

## 🤝 Contributing
Built with ❤️ during the Hackathon Hack for Good. 

<<<<<<< HEAD
© 2026 CareerWomen Project.
=======
© 2026 CareerWomen Project.
>>>>>>> efd3a3f (edit readmefile)
