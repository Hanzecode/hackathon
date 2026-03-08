import { useState } from "react";

const API_BASE = "http://localhost:8000";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary-blue:   #7C95E4;
    --secondary-blue: #A5B4F2;
    --bg-light:       #F8FAFF;
    --text-main:      #2D2D2D;
    --text-muted:    #6B6B7A;
    --white:          #FFFFFF;
    --shadow:         0 8px 32px rgba(124,149,228,0.12);
    --radius-lg:      24px;
    --radius-md:      16px;
    --radius-sm:      12px;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-light);
    color: var(--text-main);
    min-height: 100vh;
    line-height: 1.5;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Header / Navbar ── */
  .header {
    height: 80px; background: var(--primary-blue);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .header-logo {
    font-size: 24px; font-weight: 700; color: var(--white);
    letter-spacing: -0.02em; cursor: pointer;
  }
  .navbar { display: flex; gap: 32px; align-items: center; }
  .nav-link {
    color: rgba(255,255,255,0.8); font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; position: relative;
    padding: 8px 12px; border-radius: 8px;
  }
  .nav-link:hover { color: var(--white); background: rgba(255,255,255,0.1); }
  .nav-link.active {
    color: var(--text-main); background: var(--white);
    font-weight: 600;
  }

  /* ── Layout ── */
  .main { flex: 1; }
  .container { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
  .page-header { margin-bottom: 40px; }
  .page-header h2 { font-size: 36px; font-weight: 800; color: var(--primary-blue); letter-spacing: -0.02em; }
  .page-header p { font-size: 16px; color: var(--text-muted); margin-top: 8px; }

  /* ── Hero ── */
  .hero {
    background: var(--secondary-blue); border-radius: var(--radius-lg);
    padding: 80px 60px; text-align: center; margin-bottom: 64px;
    color: var(--white); position: relative; overflow: hidden;
  }
  .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.03em; }
  .hero p { font-size: 20px; opacity: 0.9; max-width: 700px; margin: 0 auto 40px; }
  .hero-btn {
    background: var(--white); color: var(--text-main);
    padding: 16px 40px; border-radius: 50px; font-weight: 700;
    font-size: 16px; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
  }
  .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

  /* ── Cards ── */
  .card {
    background: var(--white); border-radius: var(--radius-md); padding: 40px;
    box-shadow: var(--shadow); border: 1px solid rgba(124,149,228,0.1);
    margin-bottom: 32px;
  }
  .card-title { font-size: 24px; font-weight: 700; color: var(--primary-blue); margin-bottom: 24px; }

  /* ── Forms ── */
  .form-group { margin-bottom: 24px; }
  label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 10px; }
  input, textarea, select {
    width: 100%; padding: 14px 20px; border: 2px solid #E2E8F0;
    border-radius: var(--radius-sm); font-family: inherit; font-size: 15px;
    color: var(--text-main); background: var(--white); outline: none;
    transition: all 0.2s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 4px rgba(124,149,228,0.15); }
  textarea { min-height: 140px; }

  .upload-zone {
    border: 2px dashed var(--secondary-blue); border-radius: var(--radius-md);
    padding: 48px 32px; text-align: center; cursor: pointer;
    background: rgba(165,180,242,0.05); transition: all 0.2s;
    position: relative;
  }
  .upload-zone:hover { background: rgba(165,180,242,0.1); border-color: var(--primary-blue); }
  .upload-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-icon { font-size: 40px; margin-bottom: 16px; }
  .upload-file-name { background: rgba(124,149,228,0.1); padding: 12px 20px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; color: var(--primary-blue); font-weight: 600; }
  .upload-or { text-align: center; margin: 16px 0; color: var(--text-muted); font-size: 14px; display: flex; align-items: center; gap: 12px; }
  .upload-or::before, .upload-or::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    padding: 14px 32px; border-radius: var(--radius-sm); font-size: 15px;
    font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
  }
  .btn-primary { background: var(--primary-blue); color: var(--white); }
  .btn-primary:hover { background: #6A82CE; transform: translateY(-1px); }
  .btn-primary:disabled { background: #CBD5E0; cursor: not-allowed; transform: none; }
  .btn-outline { background: transparent; border: 2px solid var(--primary-blue); color: var(--primary-blue); }
  .btn-outline:hover { background: var(--primary-blue); color: var(--white); }

  /* ── Grid/List Styles ── */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  .job-card {
    background: var(--secondary-blue); color: var(--white);
    padding: 32px; border-radius: var(--radius-md); transition: transform 0.2s;
    display: flex; flex-direction: column; gap: 12px;
  }
  .job-card:hover { transform: translateY(-5px); }
  .job-title { font-size: 20px; font-weight: 700; }
  .job-company { font-size: 14px; opacity: 0.9; }

  /* ── Feedback/Results ── */
  .result-block { background: var(--white); border-radius: var(--radius-md); padding: 32px; margin-top: 24px; border: 1px solid #E2E8F0; }
  .result-block h4 { font-size: 18px; color: var(--primary-blue); margin-bottom: 20px; font-weight: 700; }
  .skill-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #E2E8F0; }
  .skill-item:last-child { border-bottom: none; }
  .priority-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 50px; text-transform: uppercase; }
  .priority-high { background: #FEE2E2; color: #DC2626; }
  .priority-medium { background: #FEF3C7; color: #D97706; }
  .priority-low { background: #DCFCE7; color: #16A34A; }
  
  .strength-tag { display: inline-block; background: rgba(124,149,228,0.1); color: var(--primary-blue); padding: 6px 16px; border-radius: 50px; margin: 4px; font-size: 14px; font-weight: 600; }
  
  .summary-box { background: var(--primary-blue); color: var(--white); padding: 24px; border-radius: var(--radius-md); margin-top: 24px; }

  /* ── Chat/Interview ── */
  .question-box { background: rgba(124,149,228,0.1); border-left: 6px solid var(--primary-blue); padding: 32px; margin-bottom: 32px; border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  .question-label { font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; margin-bottom: 8px; }
  .question-text { font-size: 22px; font-weight: 600; color: var(--text-main); font-style: italic; }

  .score-circle { width: 100px; height: 100px; border-radius: 50%; border: 6px solid var(--primary-blue); display: flex; flex-direction: column; align-items: center; justify-content: center; float: right; margin-left: 24px; }
  .score-num { font-size: 32px; font-weight: 800; color: var(--primary-blue); line-height: 1; }
  .score-denom { font-size: 12px; color: var(--text-muted); }

  /* ── CV Improvements ── */
  .ats-compare { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; margin-bottom: 40px; }
  .ats-box { padding: 32px; border-radius: var(--radius-md); text-align: center; }
  .ats-box.before { background: #FEE2E2; color: #991B1B; }
  .ats-box.after { background: #DCFCE7; color: #065F46; }
  .ats-score { font-size: 48px; font-weight: 800; }
  
  .tabs { display: flex; gap: 8px; background: #E2E8F0; padding: 6px; border-radius: 50px; width: fit-content; margin-bottom: 32px; }
  .tab { padding: 10px 24px; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .tab.active { background: var(--white); color: var(--primary-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

  .improvement-item { border: 1px solid #E2E8F0; padding: 24px; border-radius: var(--radius-md); margin-bottom: 16px; background: var(--white); }
  .improvement-section { font-size: 12px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; margin-bottom: 12px; }

  /* ── Roadmap ── */
  .week-card { background: var(--white); border-radius: var(--radius-md); padding: 32px; margin-bottom: 24px; box-shadow: var(--shadow); border: 1px solid rgba(124,149,228,0.1); position: relative; }
  .week-num { position: absolute; left: -16px; top: -16px; width: 48px; height: 48px; background: var(--primary-blue); color: var(--white); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 4px solid var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .week-title { font-size: 20px; font-weight: 700; color: var(--primary-blue); margin-bottom: 12px; }
  .week-milestone { background: rgba(124,149,228,0.1); color: var(--primary-blue); padding: 8px 16px; border-radius: 8px; font-weight: 600; display: inline-block; margin-bottom: 16px; }

  /* ── Loading ── */
  .loading { display: flex; align-items: center; gap: 16px; color: var(--text-muted); justify-content: center; padding: 60px; font-weight: 500; }
  .spinner { width: 32px; height: 32px; border: 4px solid #E2E8F0; border-top-color: var(--primary-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-box { background: #FEE2E2; color: #DC2626; padding: 20px; border-radius: var(--radius-sm); margin-top: 24px; font-weight: 500; }
`;

// ── API helpers ───────────────────────────────────────────────────────────────
async function api(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

const USER_ID = 1;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FileUploadZone({ file, onFile, onClear, accept = ".pdf,.doc,.docx" }) {
  const [drag, setDrag] = useState(false);
  return (
    <div>
      {!file ? (
        <div
          className={`upload-zone ${drag ? "dragover" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        >
          <input type="file" accept={accept} onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
          <div className="upload-icon">📁</div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--primary-blue)' }}>Drop your CV here or click to browse</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>Supports PDF and DOCX files</div>
        </div>
      ) : (
        <div className="upload-file-name">
          <span>📄 {file.name}</span>
          <span style={{ cursor: 'pointer' }} onClick={onClear}>✕</span>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Mock Interview Coach (ChatBot)
// ─────────────────────────────────────────────────────────────────────────────
function InterviewCoach() {
  const [jobRole, setJobRole] = useState("");
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function startSession() {
    setLoading(true); setError(null); setFeedback(null); setAnswer("");
    try {
      const data = await api("/interview/start", { user_id: USER_ID, job_role: jobRole });
      setSession(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function submitAnswer() {
    setLoading(true); setError(null);
    try {
      const data = await api("/interview/answer", { session_id: session.session_id, answer });
      setFeedback(data.feedback);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  function reset() { setSession(null); setFeedback(null); setAnswer(""); setError(null); }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Interview ChatBot</h2>
        <p>Practice with AI-generated interview questions and get real-time feedback on your answers.</p>
      </div>

      {!session ? (
        <div className="card">
          <div className="form-group">
            <label>What role are you interviewing for?</label>
            <input placeholder="e.g. Marketing Director" value={jobRole} onChange={e => setJobRole(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={startSession} disabled={loading || !jobRole}>
            {loading ? "Preparing..." : "Start Practice Session"}
          </button>
          {error && <div className="error-box">⚠ {error}</div>}
        </div>
      ) : (
        <>
          <div className="question-box">
            <div className="question-label">Question for you:</div>
            <div className="question-text">"{session.question}"</div>
          </div>

          {!feedback ? (
            <div className="card">
              <div className="form-group">
                <label>Your Answer</label>
                <textarea rows={5} placeholder="Type your answer here..." value={answer} onChange={e => setAnswer(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-primary" onClick={submitAnswer} disabled={loading || !answer}>
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
                <button className="btn btn-outline" onClick={reset}>New Question</button>
              </div>
              {error && <div className="error-box">⚠ {error}</div>}
            </div>
          ) : (
            <div className="card">
              <div style={{ overflow: "hidden", marginBottom: '32px' }}>
                <div className="score-circle">
                  <div className="score-num">{feedback.score?.toFixed(1)}</div>
                  <div className="score-denom">out of 10</div>
                </div>
                <div className="card-title">AI Feedback</div>
                <p style={{ color: 'var(--text-muted)' }}>Great job practicing today! Here are some tips to improve.</p>
              </div>

              {[
                { label: "Confidence", tips: feedback.confidence_tips },
                { label: "Clarity", tips: feedback.clarity_tips },
                { label: "Relevance", tips: feedback.relevance_tips },
              ].map(({ label, tips }) => tips?.length > 0 && (
                <div key={label} style={{ marginBottom: '24px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-blue)', marginBottom: '12px' }}>{label}</h5>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tips.map((t, i) => (
                      <li key={i} style={{ fontSize: '15px', display: 'flex', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-blue)' }}>•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {feedback.improved_answer_example && (
                <div className="summary-box">
                  <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Improved Example</div>
                  <p style={{ fontStyle: 'italic', opacity: 0.9 }}>"{feedback.improved_answer_example}"</p>
                </div>
              )}

              <div style={{ marginTop: 40, borderTop: '1px solid #E2E8F0', paddingTop: '32px' }}>
                <button className="btn btn-primary" onClick={reset}>Next Question</button>
              </div>
            </div>
          )}
        </>
      )}
      {loading && <div className="loading"><div className="spinner" /> AI is thinking...</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3 — CV Analysis (Rewriter)
// ─────────────────────────────────────────────────────────────────────────────
function CVRewriter() {
  const [file, setFile] = useState(null);
  const [originalCV, setOriginalCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("rewritten");

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.append("user_id", USER_ID);
      if (file) form.append("file", file);
      else form.append("original_cv", originalCV);

      const res = await fetch(`${API_BASE}/cv/rewrite`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  const canSubmit = !loading && (file || originalCV);

  return (
    <div className="container">
      <div className="page-header">
        <h2>CV Analysis & Rewrite</h2>
        <p>Optimize your CV for ATS systems and reframe career gaps with confidence.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Upload Your Current CV</label>
          <FileUploadZone file={file} onFile={f => { setFile(f); setOriginalCV(""); }} onClear={() => setFile(null)} />
        </div>
        <div className="upload-or">or paste as text</div>
        <div className="form-group">
          <textarea rows={6} placeholder="Paste your CV content here..." value={originalCV} onChange={e => { setOriginalCV(e.target.value); setFile(null); }} disabled={!!file} style={{ opacity: file ? 0.4 : 1 }} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={!canSubmit}>
          {loading ? "Processing..." : "Analyze & Rewrite"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" /> Optimizing your CV with AI...</div>}

      {result && (
        <div className="result-section">
          <div className="ats-compare">
            <div className="ats-box before">
              <div className="ats-score">{result.ats_score_before}</div>
              <div style={{ fontWeight: 600 }}>ATS Score Before</div>
            </div>
            <div style={{ fontSize: '32px', color: '#CBD5E0' }}>→</div>
            <div className="ats-box after">
              <div className="ats-score">{result.ats_score_after}</div>
              <div style={{ fontWeight: 600 }}>Optimized Score</div>
            </div>
          </div>

          <div className="tabs">
            <div className={`tab ${activeTab === "rewritten" ? "active" : ""}`} onClick={() => setActiveTab("rewritten")}>Rewritten CV</div>
            <div className={`tab ${activeTab === "improvements" ? "active" : ""}`} onClick={() => setActiveTab("improvements")}>Detailed Improvements</div>
          </div>

          {activeTab === "rewritten" && (
            <div className="card">
              <div className="card-title">Proposed Content</div>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "15px", lineHeight: 1.8, color: "var(--text-main)" }}>
                {result.rewritten_cv}
              </pre>
            </div>
          )}

          {activeTab === "improvements" && (
            <div className="grid">
              {result.improvements?.map((imp, i) => (
                <div key={i} className="improvement-item">
                  <div className="improvement-section">{imp.section}</div>
                  <div style={{ display: "flex", flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#DC2626", fontWeight: 700, marginBottom: 4 }}>BEFORE</div>
                      <div style={{ fontSize: '14px', fontStyle: 'italic' }}>{imp.original}</div>
                    </div>
                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 12 }}>
                      <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginBottom: 4 }}>AFTER</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{imp.rewritten}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: '13px', color: 'var(--text-muted)' }}>💡 {imp.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5 — Roadmap Generator (Mentor)
// ─────────────────────────────────────────────────────────────────────────────
function RoadmapGenerator() {
  const [form, setForm] = useState({ field: "", gap_months: 12, target_role: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api("/roadmap/generate", { user_id: USER_ID, ...form });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Personalized Mentorship Roadmap</h2>
        <p>Get a step-by-step plan to update your skills and re-enter your industry.</p>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="form-group">
            <label>Industry / Field</label>
            <input placeholder="e.g. Data Science" value={form.field} onChange={e => set("field", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Career Gap (months)</label>
            <input type="number" min={1} max={120} value={form.gap_months} onChange={e => set("gap_months", parseInt(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label>Specific Target Role (optional)</label>
          <input placeholder="e.g. Senior Data Analyst" value={form.target_role} onChange={e => set("target_role", e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !form.field}>
          {loading ? "Building Roadmap..." : "Generate Roadmap"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" /> Crafting your personalized plan...</div>}

      {result && (
        <div className="result-section">
          <div className="card" style={{ background: 'var(--primary-blue)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '24px' }}>Your {result.duration_weeks}-Week Re-entry Plan</h3>
            <p style={{ opacity: 0.9 }}>Tailored for re-entering the field of <strong>{result.field}</strong>.</p>
          </div>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {result.weeks?.map((week, i) => (
              <div key={i} className="week-card">
                <div className="week-num">{week.week}</div>
                <div className="week-title">{week.title}</div>
                <div className="week-milestone">Target: {week.milestone}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {week.tasks?.map((t, j) => (
                    <li key={j} style={{ fontSize: '15px', display: 'flex', gap: '12px' }}>
                      <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>→</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {result.recommended_certifications?.length > 0 && (
            <div className="card" style={{ marginTop: '32px' }}>
              <div className="card-title">Recommended Certifications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {result.recommended_certifications.map((c, i) => <span key={i} className="strength-tag">{c}</span>)}
              </div>
            </div>
          )}

          {result.returnship_programs?.length > 0 && (
            <div className="card">
              <div className="card-title">Returnship Programs</div>
              <div className="grid">
                {result.returnship_programs.map((p, i) => (
                  <div key={i} className="job-card" style={{ background: 'white', color: 'var(--text-main)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary-blue)' }}>{p.program_name}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.company}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duration: {p.duration}</div>
                    <a href={p.apply_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginTop: '12px', fontSize: '13px', padding: '10px' }}>Learn More</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
function Home({ onNavigate }) {
  return (
    <div>
      <section className="container">
        <div className="hero">
          <h1>Empowering Women to Return to the Workforce</h1>
          <p>Your journey back to a fulfilling career starts here. Get AI-powered CV analysis, interview coaching, and personalized roadmaps.</p>
          <button className="hero-btn" onClick={() => onNavigate("cv")}>Get Started Today</button>
        </div>
      </section>

      <section className="container" style={{ paddingTop: 0 }}>
        <h2 style={{ marginBottom: "32px", fontSize: "32px", fontWeight: 800 }}>Available Opportunities</h2>
        <div className="grid">
          {[
            { title: "Senior Marketing Manager", company: "TechCorp Solutions" },
            { title: "Product Designer", company: "Creative Flow" },
            { title: "Data Analyst", company: "Insight Partners" },
            { title: "Customer Success Lead", company: "Global Reach" },
          ].map((job, i) => (
            <div key={i} className="job-card">
              <div className="job-title">{job.title}</div>
              <div className="job-company">{job.company}</div>
              <button className="btn" style={{ background: "white", color: "#7C95E4", fontWeight: 700 }}>View Project</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="container" style={{ textAlign: "center", borderTop: "1px solid #E2E8F0", marginTop: "80px", color: "var(--text-muted)", paddingBottom: '80px' }}>
        <p>© 2026 CareerWomen. All rights reserved.</p>
        <p style={{ marginTop: "8px" }}>Contact us: info@careerwomen.com | Follow us @CareerFem</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const PAGES = [
  { id: "home", label: "Home", component: Home },
  { id: "cv", label: "CV Analysis", component: CVRewriter },
  { id: "roadmap", label: "Mentor", component: RoadmapGenerator },
  { id: "interview", label: "ChatBot", component: InterviewCoach },
  { id: "account", label: "My Account", component: () => <div className="container"><h2>My Account</h2><p>Account settings and profile coming soon.</p></div> },
];

export default function App() {
  const [page, setPage] = useState("home");
  const ActivePage = PAGES.find(p => p.id === page)?.component;

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <header className="header">
          <div className="header-logo" onClick={() => setPage("home")}>CareerWomen</div>
          <nav className="navbar">
            {PAGES.map(p => (
              <div
                key={p.id}
                className={`nav-link ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
              >
                {p.label}
              </div>
            ))}
          </nav>
        </header>
        <main className="main">
          {ActivePage && <ActivePage onNavigate={setPage} />}
        </main>
      </div>
    </>
  );
}