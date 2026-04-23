# AI Doc — Healthcare AI Assistant

A full-stack AI-powered medical assistant for college project.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Python FastAPI + Google Gemini 2.0 Flash

## Features
- 🩺 **AI Medical Chatbot** — Ask symptoms, get preliminary guidance (powered by Gemini)
- 🔍 **Skin Disease Analyzer** — Upload images for AI analysis *(coming soon)*

## Project Structure
```
AI-DR/
├── ai-doc-ui/        # React + Vite frontend
└── backend/          # Python FastAPI backend
```

## Setup & Run

### Backend
```bash
cd backend
python -m pip install -r requirements.txt
# Create a .env file with: GEMINI_API_KEY=your_key_here
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd ai-doc-ui
npm install
npm run dev
```

Open `http://localhost:5173`

## Environment Variables
Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
Get a free API key at [aistudio.google.com](https://aistudio.google.com)

---
> ⚠️ For educational purposes only. Not a substitute for professional medical advice.
