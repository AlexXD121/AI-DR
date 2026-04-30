# 🩺 AI Doc — Intelligent Healthcare Assistant

<div align="center">

![AI Doc Banner](https://img.shields.io/badge/AI%20Doc-Healthcare%20AI-14b8a6?style=for-the-badge&logo=stethoscope)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3--70B-f97316?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack AI-powered medical assistant — clinical chatbot, skin disease analyzer, health profile tracker, and doctor directory — all in one app.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [System Architecture](#-system-architecture)
- [Workflow Diagram](#-workflow-diagram)
- [Skin Analyzer — Detectable Conditions](#-skin-analyzer--detectable-conditions)
- [Setup & Run](#-setup--run)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Disclaimer](#️-disclaimer)

---

## 🌟 Overview

**AI Doc** is a full-stack healthcare AI web application built as a college project. It simulates a clinical consultation experience using a large language model (LLaMA 3.3-70B via Groq), paired with a skin disease analyzer, a personal health profile dashboard, and a mock doctor directory with appointment booking.

---

## ✅ Live Features

| Feature | Description | Status |
|---|---|---|
| 🤖 **AI Medical Chatbot** | Clinical consultation powered by Groq / LLaMA 3.3-70B | ✅ Live |
| 🔬 **Skin Disease Analyzer** | Upload image → AI detects Eczema, Psoriasis, or Acne Vulgaris | ✅ Demo |
| 📊 **Health Profile** | BMI, wellness score, sleep, water & activity tracking | ✅ Live |
| 🏥 **Doctor Directory** | Browse specialists, book mock appointments | ✅ Demo |
| 💬 **Persistent Chat History** | Conversations saved via `localStorage` | ✅ Live |
| 🚨 **Safety Keyword Monitor** | Real-time emergency keyword detection in chat | ✅ Live |
| 🎤 **Voice Input** | Hands-free symptom entry via Web Speech API | ✅ Live |
| 📄 **PDF Report Generator** | Export consultation as downloadable PDF | ✅ Live |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & dev server |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| Web Speech API | Voice input |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Runtime |
| FastAPI | REST API framework |
| Groq SDK | LLM API client (LLaMA 3.3-70B) |
| Uvicorn | ASGI server |
| python-dotenv | Environment variable management |

---

## 📁 Project Structure

```
AI-DR/
│
├── 📂 backend/                    # Python FastAPI backend
│   ├── main.py                    # App entry point, CORS, startup
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Secret keys (not committed)
│   ├── .env.example               # Template for .env
│   └── 📂 routes/
│       ├── __init__.py
│       └── chat.py                # POST /api/chat — LLM consultation endpoint
│
├── 📂 ai-doc-ui/                  # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── 📂 public/
│   │   ├── eczema.png             # Reference: Eczema sample image
│   │   ├── psoriasis.png          # Reference: Psoriasis sample image
│   │   └── acne.png              # Reference: Acne Vulgaris sample image
│   └── 📂 src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Root component + tab routing
│       ├── index.css              # Global styles
│       └── 📂 components/
│           ├── Navbar.jsx         # Top navigation bar
│           ├── Hero.jsx           # Landing hero section
│           ├── Chatbot.jsx        # AI chat interface (main feature)
│           ├── SkinAnalyzer.jsx   # Skin disease analyzer (demo)
│           ├── HealthProfile.jsx  # Wellness dashboard
│           └── DoctorDirectory.jsx# Doctor listing & booking
│
├── .gitignore
└── README.md
```

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────┐  │
│  │ AI Chat  │  │ Skin Analyzer│  │  Health   │  │Doctor │  │
│  │ (Chatbot)│  │   (Demo)     │  │ Profile   │  │  Dir  │  │
│  └────┬─────┘  └──────────────┘  └───────────┘  └───────┘  │
│       │  React 18 + Vite (localhost:5173)                   │
└───────┼─────────────────────────────────────────────────────┘
        │ HTTP POST /api/chat
        │ JSON { message, history, patient_profile }
        ▼
┌───────────────────────────────────────────────┐
│            FastAPI Backend (localhost:8000)    │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  POST /api/chat                        │   │
│  │  • Validate request (Pydantic)         │   │
│  │  • Build dynamic system prompt         │   │
│  │  • Inject patient profile context      │   │
│  │  • Construct full message history      │   │
│  └──────────────────┬─────────────────────┘   │
│                     │ Groq SDK call            │
└─────────────────────┼─────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────┐
│   Groq Cloud API                 │
│   Model: llama-3.3-70b-versatile │
│   Temp: 0.3  |  Max tokens: 1024 │
└──────────────────────────────────┘
```

---

## 🔄 Workflow Diagram

### Clinical Consultation Flow

```
User Opens App
      │
      ▼
 ┌─────────────┐
 │  Hero Page  │  "How are you feeling today?"
 └──────┬──────┘
        │ User types symptom
        ▼
 ┌─────────────────────┐
 │  Safety Keyword     │──── EMERGENCY DETECTED? ──► Show Emergency Banner
 │  Monitor (real-time)│                              (Call 112 / Doctor Now)
 └──────┬──────────────┘
        │ No emergency
        ▼
 ┌─────────────────────┐
 │  Health Profile     │  Optional: Inject BMI, sleep,
 │  Context Injection  │  water intake, activity level
 └──────┬──────────────┘
        │
        ▼
 ┌─────────────────────┐
 │  POST /api/chat     │  message + history + profile
 │  (FastAPI Backend)  │
 └──────┬──────────────┘
        │
        ▼
 ┌─────────────────────┐
 │  Groq LLM           │  LLaMA 3.3-70B
 │  (llama-3.3-70b)    │  Ask 1-2 clarifying questions
 │                     │  → Personalised AI response
 └──────┬──────────────┘
        │
        ▼
 ┌─────────────────────┐
 │  Response Rendered  │  Markdown formatted
 │  in Chat UI         │  with code blocks + bullet points
 └──────┬──────────────┘
        │
        ├──► 💾 Auto-saved to localStorage
        │
        └──► 📄 PDF Report (optional export)
```

### Skin Analyzer Flow (Demo)

```
User opens "Skin Check-up" tab
        │
        ▼
 ┌─────────────────────┐
 │  Upload / Drag-Drop │  JPG, PNG, WEBP accepted
 │  Skin Photo         │
 └──────┬──────────────┘
        │ Click "Analyse Skin"
        ▼
 ┌─────────────────────┐
 │  Simulated AI       │  2.8s inference animation
 │  Inference Engine   │  Progress bar + loading state
 └──────┬──────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────┐
 │  Result Card                                    │
 │                                                 │
 │  • Condition name + AI confidence %             │
 │  • Reference image (real dermatology photo)     │
 │  • Severity level (Mild / Moderate / Severe)    │
 │  • Description of condition                     │
 │  • Common symptoms list                         │
 │  • Doctor recommendations                       │
 │  • Medical disclaimer                           │
 └─────────────────────────────────────────────────┘
```

---

## 🔬 Skin Analyzer — Detectable Conditions

The analyzer demonstrates detection of **3 common skin diseases**:

### 1. 🔴 Eczema (Atopic Dermatitis)
- **Type:** Inflammatory
- **AI Confidence:** 87%
- **Severity:** Moderate
- Chronic condition causing dry, itchy, inflamed skin patches

### 2. 🟠 Psoriasis (Plaque Psoriasis)
- **Type:** Autoimmune
- **AI Confidence:** 79%
- **Severity:** Moderate–Severe
- Autoimmune disorder causing thick silvery scales on red patches

### 3. 🟡 Acne Vulgaris
- **Type:** Sebaceous
- **AI Confidence:** 93%
- **Severity:** Mild–Moderate
- Most common skin condition — clogged follicles causing pimples & nodules

> **Note:** The analyzer is a **demo** — it simulates AI inference for educational purposes. In production, this would integrate a trained CNN model (e.g., ResNet / EfficientNet) fine-tuned on the ISIC dermoscopy dataset.

---

## 🚀 Setup & Run

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+
- A free **Groq API key** from [console.groq.com](https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/AlexXD121/AI-DR.git
cd AI-DR
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Create your .env file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
# → Then edit .env and add your GROQ_API_KEY

# Start the backend server
python -m uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd ai-doc-ui

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be live at: `http://localhost:5173`

### 4. Open the App
Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔐 Environment Variables

Create `backend/.env` (use `backend/.env.example` as template):

```env
GROQ_API_KEY=your_groq_api_key_here
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | API key from [console.groq.com](https://console.groq.com) |

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "status": "AI Doc backend is running 🩺" }
```

### `POST /api/chat`
Sends a message to the AI clinical assistant.

**Request Body:**
```json
{
  "message": "I have a headache for 3 days",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ],
  "patient_profile": {
    "age": 22,
    "weight": 70,
    "height": 175,
    "sleep": 6,
    "water": 2.5,
    "activity": "moderate"
  }
}
```

**Response:**
```json
{
  "reply": "I understand you've had a headache for 3 days. Can you describe the pain? Is it throbbing or constant? ..."
}
```

**Error Codes:**
| Code | Meaning |
|---|---|
| 401 | Invalid Groq API key |
| 429 | Groq rate limit exceeded |
| 503 | Cannot connect to Groq servers |
| 500 | Unexpected server error |

---

## 🤝 Contributing

This is a college project. Contributions, suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add: my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## ⚠️ Disclaimer

> This application is built **for educational purposes only** as part of a college project.
> It is **NOT** a substitute for professional medical advice, diagnosis, or treatment.
> Always consult a qualified and licensed healthcare professional for medical decisions.
> The skin analyzer uses simulated AI inference and does **not** provide real diagnoses.

---

<div align="center">
Made with ❤️ for college project · Powered by Groq + LLaMA 3.3-70B
</div>
