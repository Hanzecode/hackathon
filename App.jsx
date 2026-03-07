import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:    #F5F0E8;
    --cream2:   #EDE5D8;
    --forest:   #2D5016;
    --forest2:  #3D6B20;
    --sage:     #7A9E5F;
    --sage-lt:  #C8DDB8;
    --rust:     #B85C2A;
    --rust-lt:  #F0D4C4;
    --ink:      #1A1A14;
    --muted:    #6B6B5A;
    --white:    #FFFFFF;
    --shadow:   0 4px 24px rgba(26,26,20,0.10);
    --shadow-lg:0 8px 48px rgba(26,26,20,0.16);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
    min-height: 100vh;
  }

  .app { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px; min-height: 100vh; background: var(--forest);
    display: flex; flex-direction: column; padding: 32px 0;
    position: fixed; top: 0; left: 0; z-index: 10;
  }
  .sidebar-logo {
    padding: 0 28px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    margin-bottom: 24px;
  }
  .sidebar-logo h1 {
    font-family: 'Playfair Display', serif;
    font-size: 22px; color: var(--cream); line-height: 1.2;
    font-weight: 700;
  }
  .sidebar-logo p { font-size: 11px; color: var(--sage-lt); margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 28px; cursor: pointer; transition: all 0.2s;
    color: rgba(255,255,255,0.65); font-size: 14px; font-weight: 400;
    border-left: 3px solid transparent;
  }
  .nav-item:hover { color: var(--cream); background: rgba(255,255,255,0.06); }
  .nav-item.active { color: var(--cream); background: rgba(255,255,255,0.10); border-left-color: var(--sage-lt); font-weight: 500; }
  .nav-icon { font-size: 18px; width: 22px; text-align: center; }
  .sidebar-footer { margin-top: auto; padding: 24px 28px 0; border-top: 1px solid rgba(255,255,255,0.12); }
  .sidebar-footer p { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6; }

  /* ── Main ── */
  .main { margin-left: 260px; flex: 1; padding: 48px 56px; max-width: calc(100vw - 260px); }

  .page-header { margin-bottom: 40px; }
  .page-header h2 { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--forest); font-weight: 700; }
  .page-header p { color: var(--muted); font-size: 15px; margin-top: 6px; line-height: 1.6; }
  .badge { display: inline-block; background: var(--rust-lt); color: var(--rust); font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Cards ── */
  .card { background: var(--white); border-radius: 16px; padding: 32px; box-shadow: var(--shadow); margin-bottom: 24px; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--forest); margin-bottom: 20px; font-weight: 700; }

  /* ── Form elements ── */
  .form-group { margin-bottom: 20px; }
  label { display: block; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  input, textarea, select {
    width: 100%; padding: 12px 16px; border: 1.5px solid var(--cream2);
    border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: var(--ink); background: var(--cream); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(122,158,95,0.15); }
  textarea { resize: vertical; min-height: 120px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer; border: none;
    transition: all 0.2s; letter-spacing: 0.02em;
  }
  .btn-primary { background: var(--forest); color: var(--cream); }
  .btn-primary:hover { background: var(--forest2); transform: translateY(-1px); box-shadow: var(--shadow); }
  .btn-primary:disabled { background: var(--sage); cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-outline { background: transparent; color: var(--forest); border: 1.5px solid var(--forest); }
  .btn-outline:hover { background: var(--forest); color: var(--cream); }
  .btn-rust { background: var(--rust); color: var(--white); }
  .btn-rust:hover { background: #9e4e24; transform: translateY(-1px); }

  /* ── Results ── */
  .result-block { background: var(--cream); border-radius: 12px; padding: 24px; margin-top: 24px; border: 1.5px solid var(--cream2); }
  .result-block h4 { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--forest); margin-bottom: 14px; }

  .skill-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--cream2); }
  .skill-item:last-child { border-bottom: none; }
  .priority-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; margin-top: 2px; }
  .priority-high   { background: #FEE2E2; color: #991B1B; }
  .priority-medium { background: #FEF3C7; color: #92400E; }
  .priority-low    { background: #D1FAE5; color: #065F46; }
  .skill-name { font-weight: 500; font-size: 14px; color: var(--ink); }
  .skill-resource { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .strength-tag { display: inline-block; background: var(--sage-lt); color: var(--forest); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; margin: 4px; }

  .summary-box { background: var(--forest); color: var(--cream); border-radius: 12px; padding: 20px 24px; margin-top: 16px; }
  .summary-box p { font-size: 14px; line-height: 1.7; font-style: italic; }

  /* ── Interview ── */
  .question-box { background: var(--forest); border-radius: 14px; padding: 28px; margin-bottom: 24px; }
  .question-box p { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--cream); line-height: 1.5; font-style: italic; }
  .question-label { font-size: 11px; color: var(--sage-lt); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }

  .score-circle { width: 80px; height: 80px; border-radius: 50%; background: var(--forest); display: flex; flex-direction: column; align-items: center; justify-content: center; float: right; margin-left: 20px; }
  .score-num { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--cream); font-weight: 700; line-height: 1; }
  .score-denom { font-size: 11px; color: var(--sage-lt); }

  .tip-section { margin-top: 16px; }
  .tip-section h5 { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .tip-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; font-size: 13px; color: var(--ink); line-height: 1.5; }
  .tip-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); flex-shrink: 0; margin-top: 6px; }

  /* ── Jobs ── */
  .job-card { border: 1.5px solid var(--cream2); border-radius: 12px; padding: 20px; margin-bottom: 12px; transition: border-color 0.2s, box-shadow 0.2s; }
  .job-card:hover { border-color: var(--sage); box-shadow: var(--shadow); }
  .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .job-title { font-weight: 600; font-size: 15px; color: var(--ink); }
  .job-company { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .score-bar-wrap { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
  .score-bar-label { font-size: 11px; color: var(--muted); width: 90px; flex-shrink: 0; }
  .score-bar-track { flex: 1; height: 6px; background: var(--cream2); border-radius: 3px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 3px; background: var(--sage); transition: width 0.6s ease; }
  .score-bar-fill.rust { background: var(--rust); }
  .job-match-reason { font-size: 12px; color: var(--forest2); font-style: italic; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--cream2); }

  /* ── Roadmap ── */
  .week-card { border-left: 4px solid var(--sage); padding: 20px 24px; margin-bottom: 16px; background: var(--white); border-radius: 0 12px 12px 0; box-shadow: var(--shadow); }
  .week-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .week-num { width: 36px; height: 36px; border-radius: 50%; background: var(--forest); color: var(--cream); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
  .week-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--forest); font-weight: 700; }
  .week-milestone { font-size: 12px; background: var(--sage-lt); color: var(--forest); padding: 6px 12px; border-radius: 6px; display: inline-block; margin-bottom: 10px; }
  .week-tasks { list-style: none; }
  .week-tasks li { font-size: 13px; color: var(--ink); padding: 4px 0; display: flex; gap: 8px; }
  .week-tasks li::before { content: '→'; color: var(--sage); font-weight: 600; flex-shrink: 0; }
  .cert-chip { display: inline-block; background: var(--rust-lt); color: var(--rust); font-size: 12px; padding: 5px 14px; border-radius: 20px; margin: 4px; font-weight: 500; }

  /* ── CV Rewrite ── */
  .ats-compare { display: flex; gap: 16px; margin: 16px 0; }
  .ats-box { flex: 1; border-radius: 10px; padding: 16px; text-align: center; }
  .ats-box.before { background: #FEE2E2; }
  .ats-box.after  { background: #D1FAE5; }
  .ats-score { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; line-height: 1; }
  .ats-box.before .ats-score { color: #991B1B; }
  .ats-box.after  .ats-score { color: #065F46; }
  .ats-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; color: var(--muted); }
  .improvement-item { border-left: 3px solid var(--rust); padding: 12px 16px; margin-bottom: 10px; background: var(--cream); border-radius: 0 8px 8px 0; }
  .improvement-section { font-size: 11px; font-weight: 600; color: var(--rust); text-transform: uppercase; margin-bottom: 6px; }
  .improvement-reason { font-size: 12px; color: var(--muted); margin-top: 6px; font-style: italic; }

  /* ── Loading ── */
  .loading { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 14px; padding: 24px 0; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--cream2); border-top-color: var(--forest); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Row/Grid helpers ── */
  .row { display: flex; gap: 20px; flex-wrap: wrap; }
  .col-half { flex: 1; min-width: 200px; }
  .divider { border: none; border-top: 1px solid var(--cream2); margin: 24px 0; }
  .text-muted { color: var(--muted); font-size: 13px; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .error-box { background: #FEE2E2; color: #991B1B; padding: 14px 18px; border-radius: 10px; font-size: 13px; margin-top: 16px; }

  /* ── Tabs (for CV) ── */
  .tabs { display: flex; gap: 4px; background: var(--cream2); padding: 4px; border-radius: 10px; margin-bottom: 20px; width: fit-content; }
  .tab { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; color: var(--muted); }
  .tab.active { background: var(--white); color: var(--forest); box-shadow: var(--shadow); }
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

// ── Shared user ID (for demo, fixed at 1) ────────────────────────────────────
const USER_ID = 1;

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Skills Gap Analyzer
// ─────────────────────────────────────────────────────────────────────────────
function SkillsAnalyzer() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api("/skills/analyze", { user_id: USER_ID, cv_text: cvText, target_role: targetRole });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="badge">Feature 1</div>
        <h2>Skills Gap Analyzer</h2>
        <p>Upload your CV and target role to get a prioritized list of skills to update.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Target Role</label>
          <input placeholder="e.g. Head of Digital Marketing" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Your CV (paste as text)</label>
          <textarea rows={6} placeholder="Paste your CV content here..." value={cvText} onChange={e => setCvText(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !cvText || !targetRole}>
          {loading ? "Analyzing…" : "→ Analyze Skills Gap"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" /> Analyzing your CV with AI…</div>}

      {result && (
        <>
          <div className="result-block">
            <h4>Missing Skills ({result.missing_skills?.length})</h4>
            {result.missing_skills?.map((s, i) => (
              <div key={i} className="skill-item">
                <span className={`priority-badge priority-${s.priority}`}>{s.priority}</span>
                <div>
                  <div className="skill-name">{s.skill}</div>
                  <div className="skill-resource">📚 {s.resource}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="result-block">
            <h4>Your Existing Strengths</h4>
            <div style={{ marginTop: 4 }}>
              {result.existing_strengths?.map((s, i) => <span key={i} className="strength-tag">{s}</span>)}
            </div>
          </div>

          <div className="summary-box">
            <p>"{result.summary}"</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Mock Interview Coach
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
    <div>
      <div className="page-header">
        <div className="badge">Feature 2</div>
        <h2>Mock Interview Coach</h2>
        <p>Practice role-specific questions and get detailed AI feedback to rebuild your confidence.</p>
      </div>

      {!session ? (
        <div className="card">
          <div className="form-group">
            <label>Job Role</label>
            <input placeholder="e.g. Product Manager" value={jobRole} onChange={e => setJobRole(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={startSession} disabled={loading || !jobRole}>
            {loading ? "Generating…" : "→ Start Mock Interview"}
          </button>
          {error && <div className="error-box">⚠ {error}</div>}
        </div>
      ) : (
        <>
          <div className="question-box">
            <div className="question-label">Your Interview Question</div>
            <p>{session.question}</p>
          </div>

          {!feedback ? (
            <div className="card">
              <div className="form-group">
                <label>Your Answer</label>
                <textarea rows={5} placeholder="Type your answer here…" value={answer} onChange={e => setAnswer(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-primary" onClick={submitAnswer} disabled={loading || !answer}>
                  {loading ? "Scoring…" : "→ Submit Answer"}
                </button>
                <button className="btn btn-outline" onClick={reset}>New Question</button>
              </div>
              {error && <div className="error-box">⚠ {error}</div>}
            </div>
          ) : (
            <div className="card">
              <div style={{ overflow: "hidden" }}>
                <div className="score-circle">
                  <div className="score-num">{feedback.score?.toFixed(1)}</div>
                  <div className="score-denom">/ 10</div>
                </div>
                <div className="card-title">Your Feedback</div>
              </div>

              {[
                { label: "Confidence", tips: feedback.confidence_tips },
                { label: "Clarity", tips: feedback.clarity_tips },
                { label: "Relevance", tips: feedback.relevance_tips },
              ].map(({ label, tips }) => tips?.length > 0 && (
                <div key={label} className="tip-section">
                  <h5>{label}</h5>
                  {tips.map((t, i) => (
                    <div key={i} className="tip-item"><div className="tip-dot" />{t}</div>
                  ))}
                </div>
              ))}

              {feedback.improved_answer_example && (
                <>
                  <hr className="divider" />
                  <div className="tip-section">
                    <h5>Improved Answer Example</h5>
                    <div className="summary-box" style={{ marginTop: 8 }}>
                      <p>"{feedback.improved_answer_example}"</p>
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={reset}>Try Another Question</button>
              </div>
            </div>
          )}
        </>
      )}
      {loading && <div className="loading"><div className="spinner" />Processing…</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3 — CV Rewriter
// ─────────────────────────────────────────────────────────────────────────────
function CVRewriter() {
  const [originalCV, setOriginalCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("rewritten");

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api("/cv/rewrite", { user_id: USER_ID, original_cv: originalCV });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="badge">Feature 3</div>
        <h2>Bias-Proof CV Rewriter</h2>
        <p>Reframe career gaps positively and optimize your CV for ATS systems.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Your Current CV</label>
          <textarea rows={7} placeholder="Paste your full CV here, including any career gaps…" value={originalCV} onChange={e => setOriginalCV(e.target.value)} />
        </div>
        <button className="btn btn-rust" onClick={submit} disabled={loading || !originalCV}>
          {loading ? "Rewriting…" : "→ Rewrite My CV"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" />Rewriting your CV with AI…</div>}

      {result && (
        <>
          <div className="ats-compare">
            <div className="ats-box before">
              <div className="ats-score">{result.ats_score_before}</div>
              <div className="ats-label">ATS Score Before</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "var(--muted)" }}>→</div>
            <div className="ats-box after">
              <div className="ats-score">{result.ats_score_after}</div>
              <div className="ats-label">ATS Score After</div>
            </div>
          </div>

          <div className="tabs">
            <div className={`tab ${activeTab === "rewritten" ? "active" : ""}`} onClick={() => setActiveTab("rewritten")}>Rewritten CV</div>
            <div className={`tab ${activeTab === "improvements" ? "active" : ""}`} onClick={() => setActiveTab("improvements")}>Improvements ({result.improvements?.length})</div>
          </div>

          {activeTab === "rewritten" && (
            <div className="card">
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
                {result.rewritten_cv}
              </pre>
            </div>
          )}

          {activeTab === "improvements" && (
            <div>
              {result.improvements?.map((imp, i) => (
                <div key={i} className="improvement-item">
                  <div className="improvement-section">{imp.section}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Before</div>
                      <div style={{ color: "#991B1B" }}>{imp.original}</div>
                    </div>
                    <div style={{ color: "var(--muted)" }}>→</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>After</div>
                      <div style={{ color: "#065F46" }}>{imp.rewritten}</div>
                    </div>
                  </div>
                  <div className="improvement-reason">💡 {imp.reason}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 4 — Job Matcher
// ─────────────────────────────────────────────────────────────────────────────
function JobMatcher() {
  const [form, setForm] = useState({ field: "", location: "remote", hours_per_week: 30, seniority: "mid", remote: true });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api("/jobs/match", { user_id: USER_ID, ...form });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="badge">Feature 4</div>
        <h2>Flexible Job Matcher</h2>
        <p>Find jobs that match your field, hours, and flexibility needs.</p>
      </div>

      <div className="card">
        <div className="row">
          <div className="col-half">
            <div className="form-group">
              <label>Your Field</label>
              <input placeholder="e.g. Software Engineering" value={form.field} onChange={e => set("field", e.target.value)} />
            </div>
          </div>
          <div className="col-half">
            <div className="form-group">
              <label>Location</label>
              <input placeholder="e.g. London or remote" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-half">
            <div className="form-group">
              <label>Max Hours / Week</label>
              <input type="number" min={10} max={40} value={form.hours_per_week} onChange={e => set("hours_per_week", parseInt(e.target.value))} />
            </div>
          </div>
          <div className="col-half">
            <div className="form-group">
              <label>Seniority</label>
              <select value={form.seniority} onChange={e => set("seniority", e.target.value)}>
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="remote" style={{ width: "auto" }} checked={form.remote} onChange={e => set("remote", e.target.checked)} />
          <label htmlFor="remote" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 14 }}>Remote / hybrid only</label>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !form.field}>
          {loading ? "Searching…" : "→ Find Matching Jobs"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" />Finding flexible jobs for you…</div>}

      {result && (
        <div>
          <p className="text-muted mt-16" style={{ marginBottom: 16 }}>Found {result.total_found} matching roles</p>
          {result.jobs?.map((job, i) => (
            <div key={i} className="job-card">
              <div className="job-header">
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.company} · {job.location} · {job.hours}</div>
                </div>
                <a href={job.apply_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: 12 }}>Apply →</a>
              </div>
              <div className="score-bar-wrap">
                <span className="score-bar-label">Flexibility {job.flexibility_score}/10</span>
                <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${job.flexibility_score * 10}%` }} /></div>
              </div>
              <div className="score-bar-wrap">
                <span className="score-bar-label">Match {job.match_score}/10</span>
                <div className="score-bar-track"><div className="score-bar-fill rust" style={{ width: `${job.match_score * 10}%` }} /></div>
              </div>
              <div className="job-match-reason">✦ {job.why_good_match}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5 — Roadmap Generator
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
    <div>
      <div className="page-header">
        <div className="badge">Feature 5</div>
        <h2>Returnship Roadmap</h2>
        <p>Get a personalised week-by-week plan to re-enter your field with confidence.</p>
      </div>

      <div className="card">
        <div className="row">
          <div className="col-half">
            <div className="form-group">
              <label>Your Field</label>
              <input placeholder="e.g. Data Science" value={form.field} onChange={e => set("field", e.target.value)} />
            </div>
          </div>
          <div className="col-half">
            <div className="form-group">
              <label>Career Gap (months)</label>
              <input type="number" min={1} max={120} value={form.gap_months} onChange={e => set("gap_months", parseInt(e.target.value))} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Target Role (optional)</label>
          <input placeholder="e.g. Senior Data Analyst" value={form.target_role} onChange={e => set("target_role", e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !form.field}>
          {loading ? "Building…" : "→ Generate My Roadmap"}
        </button>
        {error && <div className="error-box">⚠ {error}</div>}
      </div>

      {loading && <div className="loading"><div className="spinner" />Building your personalised roadmap…</div>}

      {result && (
        <>
          <p className="text-muted mt-16" style={{ marginBottom: 24 }}>
            Your {result.duration_weeks}-week re-entry plan for <strong>{result.field}</strong>
          </p>

          {result.weeks?.map((week, i) => (
            <div key={i} className="week-card">
              <div className="week-header">
                <div className="week-num">{week.week}</div>
                <div className="week-title">{week.title}</div>
              </div>
              <div className="week-milestone">🎯 {week.milestone}</div>
              <ul className="week-tasks">
                {week.tasks?.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
              {week.resources?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {week.resources.map((r, j) => (
                    <span key={j} style={{ fontSize: 12, color: "var(--forest2)", marginRight: 12 }}>📎 {r}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {result.recommended_certifications?.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-title">Recommended Certifications</div>
              {result.recommended_certifications.map((c, i) => <span key={i} className="cert-chip">{c}</span>)}
            </div>
          )}

          {result.returnship_programs?.length > 0 && (
            <div className="card">
              <div className="card-title">Returnship Programs</div>
              {result.returnship_programs.map((p, i) => (
                <div key={i} className="job-card">
                  <div className="job-title">{p.program_name}</div>
                  <div className="job-company">{p.company} · {p.duration}</div>
                  <a href={p.apply_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--forest2)", marginTop: 6, display: "inline-block" }}>Apply → {p.apply_url}</a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const PAGES = [
  { id: "skills", icon: "🔍", label: "Skills Analyzer", component: SkillsAnalyzer },
  { id: "interview", icon: "🎤", label: "Interview Coach", component: InterviewCoach },
  { id: "cv", icon: "✍️", label: "CV Rewriter", component: CVRewriter },
  { id: "jobs", icon: "💼", label: "Job Matcher", component: JobMatcher },
  { id: "roadmap", icon: "🗺️", label: "Roadmap Generator", component: RoadmapGenerator },
];

export default function App() {
  const [page, setPage] = useState("skills");
  const ActivePage = PAGES.find(p => p.id === page)?.component;

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <h1>Returnship</h1>
            <p>Career Re-entry Platform</p>
          </div>
          {PAGES.map(p => (
            <div key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`} onClick={() => setPage(p.id)}>
              <span className="nav-icon">{p.icon}</span>
              {p.label}
            </div>
          ))}
          <div className="sidebar-footer">
            <p>Helping women return to work after career breaks.</p>
          </div>
        </nav>
        <main className="main">
          {ActivePage && <ActivePage />}
        </main>
      </div>
    </>
  );
}
