# AI Doc 🩺
**An AI-powered, context-aware digital clinic and triage assistant.**

---

## ✨ Key Features

- 💬 **Context-Aware Clinical Chatbot** — Powered by Groq / Llama-3.3-70b. Acts like a real doctor: asks clarifying questions before advising. Detects emergency keywords and shows an instant 🚨 alert with hospital links.
- 📊 **Health Profile & Wellness Scoring** — Users enter age, weight, height, sleep, hydration, and activity. A live score (0–100) is calculated using WHO/NHS thresholds. Data persists in `localStorage` — nothing sent to any server.
- 🔬 **NeuralTrust Skin Analyzer** — Uploads a photo through a 5-agent AI pipeline (Gatekeeper → Body Router → EfficientNet / ResNet specialist). Returns real disease predictions, confidence scores, and plain-English action plans.
- 💾 **Local Storage Persistence** — Chat history and health profile survive page refreshes without a database.
- 🏥 **Doctor Directory** — Browse mock specialists, filter by specialty, and book a demo appointment with a confirmation toast.
- 🎙️ **Voice Input** — Browser-native speech recognition for hands-free symptom entry.
- 📄 **PDF Report Export** — Download the full consultation as a formatted PDF via jsPDF.

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, ReactMarkdown, jsPDF |
| **Chat API** | FastAPI (Python), Groq SDK (Llama-3.3-70b-versatile), python-dotenv |
| **Skin AI** | Flask, TensorFlow (EfficientNetV2B0, ResNet50), PyTorch (ResNet34 / ResNet18), OpenCV, scikit-learn |

---

## ⚡ Quickstart

### 1 · Frontend

```bash
cd ai-doc-ui
npm install
npm run dev
```
Open → `http://localhost:5173`

---

### 2 · Chat Backend (FastAPI)

```bash
cd backend
# create backend/.env  →  GROQ_API_KEY=your_key_here
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Get a free key at [console.groq.com](https://console.groq.com)

---

### 3 · Skin AI Backend (Flask / NeuralTrust)

```bash
cd AI-Skin-Disease-Classifier
pip install -r requirements.txt
python app.py
```
Skin classifier runs at `http://127.0.0.1:5000` · Test images in `test_images/`

---

## 📁 Structure

```
AI-DR/
├── ai-doc-ui/                   # React + Vite frontend
├── backend/                     # FastAPI chat backend  (port 8000)
└── AI-Skin-Disease-Classifier/  # Flask skin AI backend (port 5000)
```

---

> ⚠️ **Disclaimer:** For educational and demonstration purposes only. Not a substitute for professional medical advice.
