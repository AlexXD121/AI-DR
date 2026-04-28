import { useState, useEffect } from 'react';
import { Save, RefreshCw, Droplets, Moon, Zap, User, Ruler, Scale } from 'lucide-react';

// ── Wellness Score Algorithm ────────────────────────────────────────────────
function calculateWellnessScore({ age, weight, height, sleep, water, activity }) {
  let score = 0;

  // 1. BMI Score (30 pts) ─ World Health Organisation thresholds
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi >= 18.5 && bmi <= 24.9)      score += 30;
  else if (bmi >= 25.0 && bmi <= 26.9) score += 22;
  else if (bmi >= 17.0 && bmi < 18.5)  score += 22;
  else if (bmi >= 27.0 && bmi <= 29.9) score += 12;
  else if (bmi >= 16.0 && bmi < 17.0)  score += 12;
  else                                  score += 4;

  // 2. Sleep Score (25 pts) ─ NHS recommends 7-9 hrs for adults
  const sleepNum = parseFloat(sleep);
  if (sleepNum >= 7 && sleepNum <= 9)    score += 25;
  else if (sleepNum >= 6 && sleepNum < 7) score += 18;
  else if (sleepNum > 9 && sleepNum <= 10) score += 18;
  else if (sleepNum >= 5 && sleepNum < 6) score += 10;
  else if (sleepNum > 10)                score += 10;
  else                                   score += 3;

  // 3. Water Intake Score (20 pts) ─ WHO recommends ~2-3L/day
  const waterNum = parseFloat(water);
  if (waterNum >= 2 && waterNum <= 3)    score += 20;
  else if (waterNum >= 1.5 && waterNum < 2) score += 14;
  else if (waterNum > 3 && waterNum <= 4)   score += 14;
  else if (waterNum >= 1 && waterNum < 1.5) score += 7;
  else if (waterNum > 4)                 score += 7;
  else                                   score += 2;

  // 4. Activity Score (25 pts)
  const actMap = { sedentary: 5, light: 13, moderate: 20, active: 25, very_active: 25 };
  score += actMap[activity] || 0;

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ── Score colour thresholds ─────────────────────────────────────────────────
function scoreTheme(score) {
  if (score >= 80) return { ring: '#14b8a6', bg: 'bg-teal-50',  text: 'text-teal-700',  label: '🌟 Excellent',  border: 'border-teal-200' };
  if (score >= 60) return { ring: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', label: '👍 Good',         border: 'border-green-200' };
  if (score >= 40) return { ring: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', label: '💪 Fair',         border: 'border-amber-200' };
  return           { ring: '#f87171', bg: 'bg-red-50',   text: 'text-red-700',   label: '❤️ Needs Care',  border: 'border-red-200' };
}

// ── Circular Progress Bar (pure SVG) ──────────────────────────────────────
function CircularScore({ score }) {
  const R = 72;
  const stroke = 10;
  const normalised = R - stroke / 2;
  const circumference = 2 * Math.PI * normalised;
  const offset = circumference - (score / 100) * circumference;
  const theme = scoreTheme(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="176" height="176" className="-rotate-90">
        {/* Track */}
        <circle
          cx="88" cy="88" r={normalised}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx="88" cy="88" r={normalised}
          fill="none"
          stroke={theme.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      {/* Centre text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-stone-800">{score}</span>
        <span className="text-sm text-stone-500 font-medium">out of 100</span>
      </div>
    </div>
  );
}

// ── Default form state ──────────────────────────────────────────────────────
const DEFAULT = {
  age: '',
  weight: '',
  height: '',
  sleep: '',
  water: '',
  activity: 'moderate',
};

const STORAGE_KEY = 'ai-doc-health-profile';

// ── Main Component ──────────────────────────────────────────────────────────
export default function HealthProfile() {
  const [form, setForm]       = useState(DEFAULT);
  const [score, setScore]     = useState(null);
  const [saved, setSaved]     = useState(false);
  const [errors, setErrors]   = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setForm(parsed);
        setScore(calculateWellnessScore(parsed));
      }
    } catch (_) {}
  }, []);

  const validate = () => {
    const e = {};
    if (!form.age    || form.age < 1 || form.age > 120) e.age    = 'Enter a valid age (1–120)';
    if (!form.weight || form.weight < 10 || form.weight > 400) e.weight = 'Enter weight in kg (10–400)';
    if (!form.height || form.height < 50 || form.height > 280) e.height = 'Enter height in cm (50–280)';
    if (!form.sleep  || form.sleep < 0  || form.sleep > 24)    e.sleep  = 'Enter sleep hours (0–24)';
    if (!form.water  || form.water < 0  || form.water > 10)    e.water  = 'Enter water in litres (0–10)';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSaved(false);
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const computed = calculateWellnessScore(form);
    setScore(computed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setForm(DEFAULT);
    setScore(null);
    setErrors({});
    setSaved(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const theme = score !== null ? scoreTheme(score) : null;

  // ── BMI helper for display ──────────────────────────────────────────────
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiLabel = (b) => {
    if (b < 16)   return { text: 'Severely underweight', color: 'text-red-600' };
    if (b < 18.5) return { text: 'Underweight',          color: 'text-amber-600' };
    if (b < 25)   return { text: 'Healthy weight ✓',     color: 'text-teal-600' };
    if (b < 30)   return { text: 'Overweight',            color: 'text-amber-600' };
    return               { text: 'Obese',                 color: 'text-red-600' };
  };

  return (
    <div className="space-y-8">

      {/* ── Score Card ── */}
      <div className={`bg-white rounded-[2rem] border shadow-sm p-8 ${theme ? theme.border : 'border-stone-200'}`}>
        {score !== null ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <CircularScore score={score} />
            <div className="flex-1 text-center md:text-left">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3 ${theme.bg} ${theme.text} border ${theme.border}`}>
                {theme.label}
              </span>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Your Wellness Score</h2>
              <p className="text-stone-500 text-base leading-relaxed">
                Based on your BMI, sleep, hydration, and activity level.
                Update your details regularly for the most accurate score.
              </p>
              {bmi && (
                <p className={`mt-4 text-sm font-medium ${bmiLabel(parseFloat(bmi)).color}`}>
                  BMI: {bmi} — {bmiLabel(parseFloat(bmi)).text}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-5">
              <span className="text-5xl">🩺</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Your Wellness Score</h2>
            <p className="text-stone-500 max-w-sm">
              Fill in your details below and tap <strong>Save Profile</strong> to see your personalised score.
            </p>
          </div>
        )}
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-stone-800 mb-1">Your Health Profile</h3>
        <p className="text-stone-500 text-sm mb-8">
          All data is saved only on this device — nothing is sent to any server.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Age */}
          <Field
            icon={<User className="w-4 h-4 text-teal-500" />}
            label="Age"
            unit="years"
            error={errors.age}
          >
            <input
              type="number" min="1" max="120"
              value={form.age}
              onChange={e => handleChange('age', e.target.value)}
              placeholder="e.g. 28"
              className={inputCls(errors.age)}
            />
          </Field>

          {/* Weight */}
          <Field
            icon={<Scale className="w-4 h-4 text-teal-500" />}
            label="Weight"
            unit="kg"
            error={errors.weight}
          >
            <input
              type="number" min="10" max="400" step="0.1"
              value={form.weight}
              onChange={e => handleChange('weight', e.target.value)}
              placeholder="e.g. 70"
              className={inputCls(errors.weight)}
            />
          </Field>

          {/* Height */}
          <Field
            icon={<Ruler className="w-4 h-4 text-teal-500" />}
            label="Height"
            unit="cm"
            error={errors.height}
          >
            <input
              type="number" min="50" max="280" step="0.1"
              value={form.height}
              onChange={e => handleChange('height', e.target.value)}
              placeholder="e.g. 170"
              className={inputCls(errors.height)}
            />
          </Field>

          {/* Sleep */}
          <Field
            icon={<Moon className="w-4 h-4 text-teal-500" />}
            label="Sleep"
            unit="hours / night"
            error={errors.sleep}
          >
            <input
              type="number" min="0" max="24" step="0.5"
              value={form.sleep}
              onChange={e => handleChange('sleep', e.target.value)}
              placeholder="e.g. 7.5"
              className={inputCls(errors.sleep)}
            />
          </Field>

          {/* Water */}
          <Field
            icon={<Droplets className="w-4 h-4 text-teal-500" />}
            label="Water Intake"
            unit="litres / day"
            error={errors.water}
          >
            <input
              type="number" min="0" max="10" step="0.1"
              value={form.water}
              onChange={e => handleChange('water', e.target.value)}
              placeholder="e.g. 2"
              className={inputCls(errors.water)}
            />
          </Field>

          {/* Activity Level */}
          <Field
            icon={<Zap className="w-4 h-4 text-teal-500" />}
            label="Activity Level"
            unit=""
            error={errors.activity}
          >
            <select
              value={form.activity}
              onChange={e => handleChange('activity', e.target.value)}
              className={inputCls(errors.activity)}
            >
              <option value="sedentary">🛋️  Sedentary (little or no exercise)</option>
              <option value="light">🚶 Light (1–3 days/week)</option>
              <option value="moderate">🏃 Moderate (3–5 days/week)</option>
              <option value="active">🏋️ Active (6–7 days/week)</option>
              <option value="very_active">⚡ Very Active (physical job + training)</option>
            </select>
          </Field>

        </div>

        {/* Live BMI preview */}
        {bmi && (
          <div className="mt-6 flex items-center gap-3 px-5 py-3 bg-stone-50 rounded-2xl border border-stone-100">
            <span className="text-stone-500 text-sm">Live BMI:</span>
            <span className="font-bold text-stone-800">{bmi}</span>
            <span className={`text-sm font-medium ${bmiLabel(parseFloat(bmi)).color}`}>
              — {bmiLabel(parseFloat(bmi)).text}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full transition-all shadow-sm text-base"
          >
            <Save className="w-5 h-5" />
            {saved ? 'Saved ✓' : 'Save Profile'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-7 py-3.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold rounded-full transition-all text-base"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── Score breakdown ── */}
      {score !== null && (
        <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Score Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <BreakdownCard
              emoji="⚖️"
              label="BMI"
              detail={bmi ? `BMI ${bmi}` : '—'}
              max={30}
              value={scoreBmiPart(bmi)}
            />
            <BreakdownCard
              emoji="🌙"
              label="Sleep"
              detail={`${form.sleep} hrs`}
              max={25}
              value={scoreSleepPart(form.sleep)}
            />
            <BreakdownCard
              emoji="💧"
              label="Hydration"
              detail={`${form.water}L`}
              max={20}
              value={scoreWaterPart(form.water)}
            />
            <BreakdownCard
              emoji="🏃"
              label="Activity"
              detail={form.activity.replace('_', ' ')}
              max={25}
              value={scoreActivityPart(form.activity)}
            />
          </div>
          <p className="mt-6 text-xs text-stone-400 text-center">
            ⚠️ This score is for general wellness awareness only. It is not a medical assessment. Please consult a qualified healthcare professional for medical advice.
          </p>
        </div>
      )}

    </div>
  );
}

// ── Helper sub-score functions (mirror the main algorithm) ──────────────────
function scoreBmiPart(bmi) {
  if (!bmi) return 0;
  const b = parseFloat(bmi);
  if (b >= 18.5 && b <= 24.9) return 30;
  if ((b >= 25 && b <= 26.9) || (b >= 17 && b < 18.5)) return 22;
  if ((b >= 27 && b <= 29.9) || (b >= 16 && b < 17))   return 12;
  return 4;
}

function scoreSleepPart(sleep) {
  const s = parseFloat(sleep);
  if (s >= 7 && s <= 9)    return 25;
  if ((s >= 6 && s < 7) || (s > 9 && s <= 10)) return 18;
  if ((s >= 5 && s < 6) || s > 10) return 10;
  return 3;
}

function scoreWaterPart(water) {
  const w = parseFloat(water);
  if (w >= 2 && w <= 3)    return 20;
  if ((w >= 1.5 && w < 2) || (w > 3 && w <= 4)) return 14;
  if ((w >= 1 && w < 1.5) || w > 4) return 7;
  return 2;
}

function scoreActivityPart(activity) {
  const m = { sedentary: 5, light: 13, moderate: 20, active: 25, very_active: 25 };
  return m[activity] || 0;
}

// ── Shared input class ──────────────────────────────────────────────────────
function inputCls(error) {
  return `w-full px-4 py-3.5 bg-stone-50 border rounded-2xl text-stone-800 text-base focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all appearance-none ${
    error ? 'border-red-300 bg-red-50' : 'border-stone-200'
  }`;
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({ icon, label, unit, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
        {icon}
        {label}
        {unit && <span className="text-stone-400 font-normal">({unit})</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}

// ── Breakdown card ──────────────────────────────────────────────────────────
function BreakdownCard({ emoji, label, detail, value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="bg-stone-50 rounded-3xl p-5 flex flex-col items-center text-center border border-stone-100">
      <span className="text-3xl mb-2">{emoji}</span>
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">{label}</span>
      {/* Mini bar */}
      <div className="w-full bg-stone-200 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full bg-teal-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-bold text-stone-800 text-lg">{value}<span className="text-stone-400 font-normal text-sm">/{max}</span></span>
      <span className="text-stone-500 text-xs mt-0.5 capitalize">{detail}</span>
    </div>
  );
}
