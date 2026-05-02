import { Image as ImageIcon, AlertCircle, CheckCircle, Loader2, RefreshCw, Info, Microscope, ShieldCheck, GitBranch, Brain, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';

const FLASK_URL = 'http://127.0.0.1:5000/diagnose';

const SEV_COLORS = {
  Low:      { text: '#16a34a', bg: 'rgba(22,163,74,0.10)',  border: 'rgba(22,163,74,0.25)'  },
  Medium:   { text: '#b45309', bg: 'rgba(180,83,9,0.10)',   border: 'rgba(180,83,9,0.25)'   },
  High:     { text: '#dc2626', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.25)'  },
  Critical: { text: '#7c3aed', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)' },
  Unknown:  { text: '#64748b', bg: 'rgba(100,116,139,0.10)',border: 'rgba(100,116,139,0.25)' },
};

const AGENT_ICONS = [ShieldCheck, GitBranch, Brain, Brain, Brain];

function PipelineStep({ step, index, total }) {
  const Icon = AGENT_ICONS[index] || Brain;
  const isLast = index === total - 1;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,148,136,0.3)' }}>
          <Icon style={{ width: 16, height: 16, color: '#fff' }} />
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: 'linear-gradient(to bottom,#0d9488,rgba(14,165,233,0.2))', margin: '4px 0' }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: '#1c1917' }}>{step.agent}</p>
          <span style={{ fontSize: '0.68rem', color: '#a8a29e', background: '#f5f5f4', borderRadius: 999, padding: '0.1rem 0.5rem' }}>{step.time}</span>
        </div>
        {step.status && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: step.status === 'PASS' ? '#16a34a' : '#dc2626' }}>
            {step.status === 'PASS' ? '✓ PASSED' : '✗ REJECTED'} · Quality: {step.quality_score}%
          </span>
        )}
        {step.body_part && (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#57534e' }}>
            Body area detected: <strong>{step.body_part}</strong> · Routed to <strong>{step.route_to?.replace('agent', 'Agent ')}</strong>
          </p>
        )}
        {step.top_disease && (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#57534e' }}>
            Top match: <strong>{step.top_disease}</strong> ({step.top_probability?.toFixed(1)}%)
          </p>
        )}
      </div>
    </div>
  );
}

function PredictionBar({ pred, rank }) {
  const sev = SEV_COLORS[pred.severity] || SEV_COLORS.Unknown;
  const pct = Math.min(pred.probability, 100);
  return (
    <div style={{ marginBottom: rank === 0 ? '1rem' : '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {rank === 0 && <Zap style={{ width: 13, height: 13, color: '#0d9488' }} />}
          <span style={{ fontWeight: rank === 0 ? 700 : 500, fontSize: rank === 0 ? '0.88rem' : '0.8rem', color: rank === 0 ? '#1c1917' : '#57534e' }}>{pred.disease}</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 999, background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>{pred.severity}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: rank === 0 ? '#0d9488' : '#78716c' }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: rank === 0 ? 9 : 6, background: '#f5f5f4', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: rank === 0 ? 'linear-gradient(90deg,#0d9488,#0ea5e9)' : '#d6d3d1', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function SkinAnalyzer() {
  const [dragActive, setDragActive]   = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) applyFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => { if (e.target.files?.[0]) applyFile(e.target.files[0]); };

  const applyFile = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await fetch(FLASK_URL, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        setError(data.error || `Server error ${res.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        `Cannot reach the NeuralTrust classifier server.\n\n` +
        `Please start it by running:\n  cd AI-Skin-Disease-Classifier\n  python app.py\n\nError: ${err.message}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = (e) => {
    e && e.preventDefault();
    setSelectedFile(null); setPreviewUrl(null);
    setResult(null); setError(null); setIsAnalyzing(false);
  };

  const top = result?.predictions?.[0];
  const sevStyle = top ? (SEV_COLORS[top.severity] || SEV_COLORS.Unknown) : null;

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes prog { from { width:0% } to { width:95% } }
        .sa-card { background:#fff; border-radius:1.25rem; border:1px solid #e7e5e4; overflow:hidden; margin-bottom:1.1rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .sa-pad  { padding:1.5rem 1.75rem; }
        .sa-btn-primary { padding:0.55rem 1.3rem; border-radius:999px; background:#0d9488; color:#fff; font-weight:600; font-size:0.875rem; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:0.45rem; transition:background 0.2s; }
        .sa-btn-primary:hover:not(:disabled) { background:#0f766e; }
        .sa-btn-primary:disabled { background:#5eead4; cursor:not-allowed; }
        .sa-btn-secondary { padding:0.55rem 1.1rem; border-radius:999px; background:#fff; border:1px solid #e7e5e4; color:#57534e; font-weight:500; font-size:0.875rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; transition:background 0.15s; }
        .sa-btn-secondary:hover { background:#f5f5f4; }
        .sa-label { font-size:0.68rem; font-weight:700; color:#a8a29e; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem; }
        .sa-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:600px){ .sa-grid2 { grid-template-columns:1fr; } }
      `}</style>

      {/* ── Upload Card ── */}
      <div className="sa-card">
        <div className="sa-pad">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.1rem' }}>
            <div>
              <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#1c1917', margin:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Microscope style={{ width:20, height:20, color:'#14b8a6' }} /> NeuralTrust Skin Analyzer
              </h2>
              <p style={{ color:'#78716c', fontSize:'0.85rem', marginTop:'0.25rem', marginBottom:0 }}>
                5-Agent AI pipeline · Real-time diagnosis · Powered by EfficientNet + ResNet
              </p>
            </div>
            <span style={{ padding:'0.28rem 0.75rem', borderRadius:999, background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', color:'#0d9488', fontSize:'0.72rem', fontWeight:700, whiteSpace:'nowrap' }}>
              🤖 Live AI
            </span>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag} onDrop={handleDrop}
            style={{
              border:`2px dashed ${dragActive ? '#14b8a6' : selectedFile ? '#5eead4' : '#d6d3d1'}`,
              borderRadius:'1.1rem', padding:'1.75rem 1rem',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background: dragActive ? 'rgba(20,184,166,0.06)' : selectedFile ? 'rgba(20,184,166,0.03)' : '#fafaf9',
              transition:'all 0.2s ease', minHeight:180,
            }}
          >
            <input type="file" id="skin-upload" style={{ display:'none' }} accept="image/*" onChange={handleChange} />
            <label htmlFor="skin-upload" style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', width:'100%', textAlign:'center' }}>
              {selectedFile ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview"
                      style={{ width:130, height:130, objectFit:'cover', borderRadius:'0.9rem', marginBottom:'0.75rem', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                  )}
                  <p style={{ fontWeight:600, color:'#1c1917', margin:'0 0 0.1rem' }}>{selectedFile.name}</p>
                  <p style={{ color:'#a8a29e', fontSize:'0.78rem', marginBottom:'0.9rem' }}>{(selectedFile.size/1024/1024).toFixed(2)} MB</p>
                  <div style={{ display:'flex', gap:'0.6rem' }}>
                    <button className="sa-btn-primary" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing
                        ? <><Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> Analysing…</>
                        : '🔬 Run AI Diagnosis'}
                    </button>
                    <button className="sa-btn-secondary" type="button" onClick={handleReset}>
                      <RefreshCw style={{ width:13, height:13 }} /> Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ background:'#fff', borderRadius:'50%', padding:'1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', marginBottom:'0.75rem', border:'1px solid #f5f5f4' }}>
                    <ImageIcon style={{ width:30, height:30, color:'#14b8a6' }} />
                  </div>
                  <p style={{ fontWeight:600, color:'#1c1917', marginBottom:'0.2rem' }}>Tap to select a skin photo</p>
                  <p style={{ color:'#a8a29e', fontSize:'0.83rem' }}>or drag & drop — JPG, PNG, WEBP</p>
                </div>
              )}
            </label>
          </div>
          <p style={{ color:'#a8a29e', fontSize:'0.7rem', marginTop:'0.55rem', textAlign:'center' }}>
            ⚠️ For educational demonstration only. NOT a substitute for professional medical advice.
          </p>
        </div>
      </div>

      {/* ── Analysing Progress ── */}
      {isAnalyzing && (
        <div className="sa-card" style={{ textAlign:'center' }}>
          <div className="sa-pad" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.7rem' }}>
            <Loader2 style={{ width:36, height:36, color:'#14b8a6', animation:'spin 1s linear infinite' }} />
            <p style={{ fontWeight:700, color:'#1c1917', margin:0 }}>Running 5-Agent AI Pipeline…</p>
            <p style={{ color:'#a8a29e', fontSize:'0.8rem', margin:0 }}>Quality check → Body routing → Disease diagnosis</p>
            <div style={{ width:'100%', maxWidth:320, background:'#f5f5f4', borderRadius:999, height:7, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999, background:'linear-gradient(90deg,#14b8a6,#0ea5e9)', animation:'prog 3s ease-in-out forwards' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="sa-card" style={{ borderColor:'#fca5a5', animation:'fadeUp 0.3s ease' }}>
          <div className="sa-pad" style={{ display:'flex', gap:'0.75rem' }}>
            <XCircle style={{ width:22, height:22, color:'#dc2626', flexShrink:0, marginTop:2 }} />
            <div>
              <p style={{ margin:'0 0 0.4rem', fontWeight:700, color:'#dc2626' }}>Could not connect to NeuralTrust Server</p>
              <pre style={{ margin:0, fontFamily:'monospace', fontSize:'0.75rem', color:'#57534e', whiteSpace:'pre-wrap', lineHeight:1.7 }}>{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejected Image ── */}
      {result?.status === 'rejected' && (
        <div className="sa-card" style={{ borderColor:'#fcd34d', animation:'fadeUp 0.3s ease' }}>
          <div className="sa-pad">
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'0.75rem' }}>
              <AlertCircle style={{ width:22, height:22, color:'#b45309' }} />
              <p style={{ margin:0, fontWeight:700, color:'#b45309' }}>Image Rejected by Quality Gate</p>
            </div>
            <p style={{ margin:'0 0 0.5rem', color:'#78716c', fontSize:'0.85rem' }}>{result.rejection_reason}</p>
            <p style={{ margin:0, fontSize:'0.78rem', color:'#a8a29e' }}>Quality score: <strong>{result.quality_score}%</strong> · Please upload a clear, well-lit photo of the skin area.</p>
          </div>
        </div>
      )}

      {/* ── Success Result ── */}
      {result?.status === 'success' && top && (
        <div style={{ animation:'fadeUp 0.4s ease' }}>

          {/* Top diagnosis card */}
          <div className="sa-card">
            <div style={{ background:'linear-gradient(135deg,#f0fdfa,#ecfeff)', borderBottom:'1px solid #e7e5e4', padding:'1.1rem 1.75rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
              <CheckCircle style={{ width:22, height:22, color:'#10b981', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:'0.68rem', color:'#64748b', fontWeight:700, letterSpacing:'0.05em' }}>DIAGNOSIS COMPLETE · {result.total_time}</p>
                <h3 style={{ margin:'0.15rem 0 0', fontSize:'1.15rem', fontWeight:800, color:'#1c1917' }}>{top.disease}</h3>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.3rem' }}>
                <span style={{ padding:'0.2rem 0.7rem', borderRadius:999, background: sevStyle.bg, color: sevStyle.text, border:`1px solid ${sevStyle.border}`, fontSize:'0.72rem', fontWeight:700 }}>
                  {top.severity} Severity
                </span>
                <span style={{ fontSize:'0.72rem', color:'#64748b' }}>Body: <strong>{result.body_part}</strong></span>
              </div>
            </div>

            <div className="sa-pad" style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

              {/* Description */}
              <div>
                <p className="sa-label">About this condition</p>
                <p style={{ margin:0, color:'#44403c', fontSize:'0.85rem', lineHeight:1.7 }}>{top.description}</p>
              </div>

              {/* Top 5 predictions */}
              <div>
                <p className="sa-label">AI Confidence Scores (Top 5)</p>
                {result.predictions.map((pred, i) => (
                  <PredictionBar key={pred.disease} pred={pred} rank={i} />
                ))}
              </div>

              {/* What to do + also known as */}
              <div className="sa-grid2">
                <div style={{ background:'#f0fdf4', borderRadius:'0.9rem', padding:'1rem', border:'1px solid #bbf7d0' }}>
                  <p style={{ fontWeight:700, color:'#166534', fontSize:'0.8rem', margin:'0 0 0.5rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    <CheckCircle style={{ width:14, height:14 }} /> What to do
                  </p>
                  <p style={{ margin:0, color:'#15803d', fontSize:'0.8rem', lineHeight:1.65 }}>{top.what_to_do}</p>
                </div>
                <div style={{ background:'#fef9f0', borderRadius:'0.9rem', padding:'1rem', border:'1px solid #fde68a' }}>
                  <p style={{ fontWeight:700, color:'#92400e', fontSize:'0.8rem', margin:'0 0 0.5rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    <Info style={{ width:14, height:14 }} /> Body focus
                  </p>
                  <p style={{ margin:'0 0 0.4rem', color:'#78716c', fontSize:'0.8rem' }}>{top.body_focus}</p>
                  {top.also_known_as && (
                    <p style={{ margin:0, color:'#a8a29e', fontSize:'0.75rem' }}>Also known as: {top.also_known_as}</p>
                  )}
                </div>
              </div>

              {/* Specialist used */}
              <p style={{ margin:0, fontSize:'0.75rem', color:'#94a3b8', textAlign:'center' }}>
                Diagnosed by <strong>{result.specialist}</strong>
              </p>
            </div>
          </div>

          {/* Pipeline log card */}
          <div className="sa-card">
            <div className="sa-pad">
              <p className="sa-label" style={{ marginBottom:'1rem' }}>5-Agent Pipeline Execution Log</p>
              {result.pipeline.map((step, i) => (
                <PipelineStep key={i} step={step} index={i} total={result.pipeline.length} />
              ))}
            </div>
          </div>

          {/* Disclaimer + reset */}
          <div className="sa-card">
            <div className="sa-pad" style={{ display:'flex', gap:'0.65rem' }}>
              <Info style={{ width:16, height:16, color:'#64748b', flexShrink:0, marginTop:2 }} />
              <p style={{ margin:0, fontSize:'0.78rem', color:'#64748b', lineHeight:1.6 }}>
                <strong>Disclaimer:</strong> This AI analysis is for <strong>educational demonstration only</strong>. It is NOT a substitute for professional medical advice. Always consult a qualified dermatologist for a real diagnosis.
              </p>
            </div>
          </div>

          <div style={{ textAlign:'center', marginBottom:'1rem' }}>
            <button className="sa-btn-secondary" onClick={handleReset}>
              <RefreshCw style={{ width:13, height:13 }} /> Analyse another image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
