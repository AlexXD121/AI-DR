import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in the .env file!")

# Initialize the Groq client
client = Groq(api_key=GROQ_API_KEY)

# Clinical doctor system prompt
SYSTEM_PROMPT = """You are 'AI Doc', a highly professional, empathetic, and analytical medical AI assistant. Your goal is to simulate a clinical consultation. Guidelines: 1. Act like a real doctor: When a user presents a symptom, DO NOT immediately diagnose. Ask 1 or 2 clarifying questions first (e.g., duration, severity, accompanying symptoms). 2. Tone: Trustworthy, calm, clinical, yet empathetic. 3. Structure: Use short paragraphs and bullet points for readability. 4. Mandatory Disclaimer: Always end your advice by reminding the user that you are an AI and they MUST consult a real doctor for a real diagnosis."""

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []  # [{"role": "user"|"model", "parts": ["text"]}]


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accepts a user message and conversation history,
    and returns an AI-generated reply using Groq (Llama-3).
    """
    try:
        # Build conversation history in the Groq/OpenAI format
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for item in request.history:
            role = item.get("role", "user")  # "user" or "assistant"
            
            # Support both "content" (OpenAI format) and "parts" (legacy Gemini format)
            raw_parts = item.get("parts", [])
            content = item.get("content") or (raw_parts[0] if raw_parts else "")
            if isinstance(content, dict):
                content = content.get("text", "")
                
            messages.append({"role": role, "content": content})

        # Add the latest user message
        messages.append({"role": "user", "content": request.message})

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
        )

        reply_text = chat_completion.choices[0].message.content

        return ChatResponse(reply=reply_text)

    except Exception as e:
        error_detail = str(e)
        raise HTTPException(status_code=500, detail=f"Groq API error: {error_detail}")
