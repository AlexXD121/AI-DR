import { Image as ImageIcon, AlertCircle, CheckCircle, Loader2, RefreshCw, Info, Microscope } from 'lucide-react';
import { useState } from 'react';

const SKIN_CONDITIONS = [
  {
    id: 'eczema',
    name: 'Eczema (Atopic Dermatitis)',
    confidence: 87,
    severity: 'Moderate',
    sevColor: '#ea580c',
    sevBg: 'rgba(251,146,60,0.12)',
    image: '/eczema.png',
    tag: 'Inflammatory',
    tagColor: '#0ea5e9',
    description:
      'Eczema is a chronic inflammatory skin condition causing dry, itchy and inflamed skin. It results in red, cracked and rough patches. Cause involves a mix of genetic and environmental factors.',
    symptoms: [
      'Dry, sensitive skin with intense itching',
      'Red to brownish-gray patches',
      'Small raised bumps that may weep fluid',
      'Thickened, cracked or scaly skin',
      'Swollen skin from persistent scratching',
    ],
    recs: [
      'Apply fragrance-free moisturiser 2× daily',
      'Use mild, non-soap cleansers',
      'Avoid triggers: dust, pet dander, stress',
      'Wear soft, breathable cotton clothing',
      'Consult a dermatologist for topical corticosteroids',
    ],
  },
  {
    id: 'psoriasis',
    name: 'Psoriasis (Plaque Psoriasis)',
    confidence: 79,
    severity: 'Moderate–Severe',
    sevColor: '#dc2626',
    sevBg: 'rgba(239,68,68,0.10)',
    image: '/psoriasis.png',
    tag: 'Autoimmune',
    tagColor: '#ef4444',
    description:
      'Psoriasis is an autoimmune condition that accelerates the skin-cell cycle. Cells build up rapidly, forming thick silvery scales and red patches that can be itchy and painful.',
    symptoms: [
      'Red patches covered with thick silvery scales',
      'Dry, cracked skin that may bleed',
      'Itching, burning or soreness',
      'Thickened, pitted or ridged nails',
      'Swollen and stiff joints in some cases',
    ],
    recs: [
      'Keep skin moisturised to reduce scaling',
      'Use coal-tar medicated shampoos for scalp psoriasis',
      'Avoid triggers: stress, smoking, alcohol',
      'Phototherapy (UVB) can be very effective',
      'Consult a dermatologist for biologics or retinoids',
    ],
  },
  {
    id: 'acne',
    name: 'Acne Vulgaris',
    confidence: 93,
    severity: 'Mild–Moderate',
    sevColor: '#b45309',
    sevBg: 'rgba(245,158,11,0.10)',
    image: '/acne.png',
    tag: 'Sebaceous',
    tagColor: '#f59e0b',
    description:
      'Acne vulgaris occurs when hair follicles become clogged with oil and dead skin cells, leading to whiteheads, blackheads, pimples and sometimes deeper cysts or nodules.',
    symptoms: [
      'Whiteheads (closed clogged pores)',
      'Blackheads (open clogged pores)',
      'Small red tender bumps (papules)',
      'Pimples (pustules) with pus at tip',
      'Large solid painful lumps (nodules)',
    ],
    recs: [
      'Wash face twice daily with gentle cleanser',
      'Use non-comedogenic (oil-free) skincare products',
      'Avoid picking or squeezing pimples',
      'Apply benzoyl peroxide or salicylic acid topically',
      'Consult a dermatologist for persistent severe acne',
    ],
  },
];

export default function SkinAnalyzer() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) applyFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => {
    if (e.target.files?.[0]) applyFile(e.target.files[0]);
  };
  const applyFile = (file) => {
    setSelectedFile(file);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));
  };
  const handleAnalyze = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      const picked = SKIN_CONDITIONS[Math.floor(Math.random() * SKIN_CONDITIONS.length)];
      setResult(picked);
      setIsAnalyzing(false);
    }, 2800);
  };
  const handleReset = (e) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes prog { from { width:0% } to { width:92% } }
        .sa-card { background:#fff; border-radius:1.5rem; border:1px solid #e7e5e4; overflow:hidden; margin-bottom:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .sa-pad { padding:1.75rem 2rem; }
        .sa-btn-primary { padding:0.6rem 1.4rem; border-radius:999px; background:#0d9488; color:#fff; font-weight:600; font-size:0.875rem; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:0.45rem; transition:background 0.2s; }
        .sa-btn-primary:hover { background:#0f766e; }
        .sa-btn-primary:disabled { background:#5eead4; cursor:not-allowed; }
        .sa-btn-secondary { padding:0.6rem 1.2rem; border-radius:999px; background:#fff; border:1px solid #e7e5e4; color:#57534e; font-weight:500; font-size:0.875rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; }
        .sa-label { font-size:0.7rem; font-weight:700; color:#a8a29e; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.45rem; }
        .sa-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:600px){ .sa-grid2 { grid-template-columns:1fr; } }
      `}</style>

      {/* ── Upload Card ──────────────────────────────────────────────────── */}
      <div className="sa-card">
        <div className="sa-pad">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
            <div>
              <h2 style={{ fontSize:'1.25rem', fontWeight:700, color:'#1c1917', margin:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Microscope style={{ width:20, height:20, color:'#14b8a6' }} /> AI Skin Analyzer
              </h2>
              <p style={{ color:'#78716c', fontSize:'0.875rem', marginTop:'0.3rem', marginBottom:0 }}>
                Upload a photo of your skin concern for AI-powered analysis.
              </p>
            </div>
            <span style={{ padding:'0.3rem 0.8rem', borderRadius:999, background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', color:'#0d9488', fontSize:'0.75rem', fontWeight:600, whiteSpace:'nowrap' }}>
              🤖 AI Demo
            </span>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            style={{
              border:`2px dashed ${dragActive ? '#14b8a6' : selectedFile ? '#5eead4' : '#d6d3d1'}`,
              borderRadius:'1.25rem', padding:'2rem 1rem',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background: dragActive ? 'rgba(20,184,166,0.06)' : selectedFile ? 'rgba(20,184,166,0.03)' : '#fafaf9',
              transition:'all 0.2s ease', minHeight:190,
            }}
          >
            <input type="file" id="skin-upload" style={{ display:'none' }} accept="image/*" onChange={handleChange} />
            <label htmlFor="skin-upload" style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', width:'100%', textAlign:'center' }}>
              {selectedFile ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" style={{ width:140, height:140, objectFit:'cover', borderRadius:'1rem', marginBottom:'0.85rem', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }} />
                  )}
                  <p style={{ fontWeight:600, color:'#1c1917', margin:'0 0 0.15rem' }}>{selectedFile.name}</p>
                  <p style={{ color:'#a8a29e', fontSize:'0.8rem', marginBottom:'1rem' }}>{(selectedFile.size/1024/1024).toFixed(2)} MB</p>
                  <div style={{ display:'flex', gap:'0.65rem' }}>
                    <button className="sa-btn-primary" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing
                        ? <><Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> Analysing…</>
                        : '🔍 Analyse Skin'
                      }
                    </button>
                    <button className="sa-btn-secondary" type="button" onClick={handleReset}>
                      <RefreshCw style={{ width:13, height:13 }} /> Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ background:'#fff', borderRadius:'50%', padding:'1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', marginBottom:'0.85rem', border:'1px solid #f5f5f4' }}>
                    <ImageIcon style={{ width:32, height:32, color:'#14b8a6' }} />
                  </div>
                  <p style={{ fontWeight:600, color:'#1c1917', marginBottom:'0.2rem' }}>Tap to select a skin photo</p>
                  <p style={{ color:'#a8a29e', fontSize:'0.85rem' }}>or drag & drop — JPG, PNG, WEBP</p>
                </div>
              )}
            </label>
          </div>
          <p style={{ color:'#a8a29e', fontSize:'0.72rem', marginTop:'0.65rem', textAlign:'center' }}>
            ⚠️ Demo only — NOT a real medical diagnosis. Always consult a qualified doctor.
          </p>
        </div>
      </div>

      {/* ── Analysing State ───────────────────────────────────────────────── */}
      {isAnalyzing && (
        <div className="sa-card" style={{ textAlign:'center' }}>
          <div className="sa-pad" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
            <Loader2 style={{ width:36, height:36, color:'#14b8a6', animation:'spin 1s linear infinite' }} />
            <p style={{ fontWeight:600, color:'#1c1917', margin:0 }}>Analysing your image…</p>
            <p style={{ color:'#a8a29e', fontSize:'0.82rem', margin:0 }}>Running AI model · Matching pattern database</p>
            <div style={{ width:'100%', maxWidth:300, background:'#f5f5f4', borderRadius:999, height:7, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999, background:'linear-gradient(90deg,#14b8a6,#0ea5e9)', animation:'prog 2.8s ease-in-out forwards' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Result Card ───────────────────────────────────────────────────── */}
      {result && (
        <div className="sa-card" style={{ animation:'fadeUp 0.4s ease' }}>
          {/* Result header */}
          <div style={{ background:'linear-gradient(135deg,#f0fdfa,#ecfeff)', borderBottom:'1px solid #e7e5e4', padding:'1.25rem 2rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <CheckCircle style={{ width:22, height:22, color:'#10b981', flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:'0.72rem', color:'#64748b', fontWeight:600 }}>ANALYSIS COMPLETE</p>
              <h3 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#1c1917' }}>{result.name}</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.3rem' }}>
              <span style={{ background:result.tagColor+'22', color:result.tagColor, border:`1px solid ${result.tagColor}44`, borderRadius:999, fontSize:'0.7rem', fontWeight:700, padding:'0.18rem 0.65rem' }}>{result.tag}</span>
              <span style={{ fontSize:'0.75rem', color:'#64748b' }}>AI Confidence: <strong style={{ color:'#0d9488' }}>{result.confidence}%</strong></span>
            </div>
          </div>

          <div className="sa-pad" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {/* Image + confidence + severity */}
            <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'1.25rem', alignItems:'start' }}>
              <div>
                <p className="sa-label">Reference</p>
                <img src={result.image} alt={result.name} style={{ width:'100%', borderRadius:'0.85rem', border:'2px solid #f5f5f4', objectFit:'cover', aspectRatio:'1' }} />
              </div>
              <div>
                <p className="sa-label">Confidence</p>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem' }}>
                  <div style={{ flex:1, background:'#f5f5f4', borderRadius:999, height:9, overflow:'hidden' }}>
                    <div style={{ width:`${result.confidence}%`, height:'100%', borderRadius:999, background:'linear-gradient(90deg,#14b8a6,#0ea5e9)' }} />
                  </div>
                  <span style={{ fontWeight:700, color:'#0d9488', fontSize:'0.9rem' }}>{result.confidence}%</span>
                </div>
                <p className="sa-label">Severity</p>
                <span style={{ display:'inline-block', padding:'0.3rem 0.9rem', borderRadius:999, background:result.sevBg, color:result.sevColor, fontWeight:600, fontSize:'0.82rem', border:`1px solid ${result.sevColor}33`, marginBottom:'0.9rem' }}>{result.severity}</span>
                <p className="sa-label">About</p>
                <p style={{ color:'#57534e', fontSize:'0.85rem', lineHeight:1.65, margin:0 }}>{result.description}</p>
              </div>
            </div>

            {/* Symptoms + Recs */}
            <div className="sa-grid2">
              <div style={{ background:'#fef9f0', borderRadius:'1rem', padding:'1.1rem', border:'1px solid #fde68a' }}>
                <p style={{ fontWeight:700, color:'#92400e', fontSize:'0.82rem', margin:'0 0 0.6rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <AlertCircle style={{ width:14, height:14 }} /> Symptoms
                </p>
                <ul style={{ margin:0, paddingLeft:'1.1rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {result.symptoms.map((s,i) => <li key={i} style={{ color:'#78716c', fontSize:'0.8rem', lineHeight:1.55 }}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background:'#f0fdfa', borderRadius:'1rem', padding:'1.1rem', border:'1px solid #99f6e4' }}>
                <p style={{ fontWeight:700, color:'#134e4a', fontSize:'0.82rem', margin:'0 0 0.6rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <CheckCircle style={{ width:14, height:14 }} /> Recommendations
                </p>
                <ul style={{ margin:0, paddingLeft:'1.1rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {result.recs.map((r,i) => <li key={i} style={{ color:'#0f766e', fontSize:'0.8rem', lineHeight:1.55 }}>{r}</li>)}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ display:'flex', gap:'0.65rem', padding:'0.9rem 1.1rem', background:'#f8fafc', borderRadius:'1rem', border:'1px solid #e2e8f0' }}>
              <Info style={{ width:16, height:16, color:'#64748b', flexShrink:0, marginTop:2 }} />
              <p style={{ margin:0, fontSize:'0.78rem', color:'#64748b', lineHeight:1.6 }}>
                <strong>Disclaimer:</strong> This AI analysis is for <strong>educational demonstration only</strong> and is NOT a substitute for professional medical advice. Always consult a qualified dermatologist.
              </p>
            </div>

            <div style={{ textAlign:'center' }}>
              <button className="sa-btn-secondary" onClick={handleReset}>
                <RefreshCw style={{ width:13, height:13 }} /> Analyse another image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Conditions preview (empty state) ─────────────────────────────── */}
      {!selectedFile && !result && (
        <div className="sa-card">
          <div className="sa-pad" style={{ textAlign:'center' }}>
            <p style={{ fontWeight:600, color:'#1c1917', marginBottom:'1rem' }}>Detectable Conditions (Demo)</p>
            <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
              {SKIN_CONDITIONS.map(c => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'0.65rem', background:'#f9fafb', border:'1px solid #f0f0f0', borderRadius:'0.85rem', padding:'0.65rem 0.9rem' }}>
                  <img src={c.image} alt={c.name} style={{ width:48, height:48, borderRadius:'0.55rem', objectFit:'cover' }} />
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontWeight:600, color:'#1c1917', fontSize:'0.8rem', margin:0 }}>{c.name}</p>
                    <span style={{ display:'inline-block', marginTop:3, fontSize:'0.68rem', fontWeight:700, background:c.tagColor+'22', color:c.tagColor, border:`1px solid ${c.tagColor}44`, borderRadius:999, padding:'0.1rem 0.5rem' }}>{c.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color:'#a8a29e', fontSize:'0.78rem', marginTop:'1rem', marginBottom:0 }}>Upload any skin image above to run the demo analysis.</p>
          </div>
        </div>
      )}
    </div>
  );
}
