import { Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// System welcome message shown on first load
const WELCOME_MESSAGE = {
  id: 1,
  role: 'ai',
  text: "Hello! I'm **AI Doc**, your AI-powered medical assistant 🩺\n\nI'm here to help you understand your symptoms through a clinical consultation. Please describe what you're experiencing, and I'll ask a few questions before offering guidance.\n\n> ⚠️ I provide preliminary guidance only. Always consult a real doctor for a formal diagnosis.",
};

// Custom markdown components styled for the medical chat UI
const markdownComponents = {
  // Paragraphs
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,

  // Bold text
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,

  // Bullet lists
  ul: ({ children }) => (
    <ul className="mt-1 mb-2 space-y-1 pl-4 list-disc marker:text-blue-400">{children}</ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  // Numbered lists
  ol: ({ children }) => (
    <ol className="mt-1 mb-2 space-y-1 pl-4 list-decimal marker:text-blue-400">{children}</ol>
  ),

  // Blockquote (used for disclaimers)
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-2 border-amber-400 bg-amber-50 pl-3 pr-2 py-1.5 rounded-r-lg text-amber-800 text-xs italic">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ children }) => (
    <code className="bg-slate-100 text-blue-700 rounded px-1 py-0.5 text-xs font-mono">
      {children}
    </code>
  ),
};

// User message markdown — white text on blue background
const userMarkdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="mt-1 mb-2 space-y-1 pl-4 list-disc">{children}</ul>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
};

export default function Chatbot() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // tracks quota/connection errors
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Converts local message history into Groq/OpenAI format:
   * [{ role: "user" | "assistant", content: "text" }]
   */
  const buildHistory = (msgs) => {
    return msgs
      .filter((m) => m.id !== 1) // exclude static welcome message
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        parts: [m.text],
      }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setApiError(null); // clear any previous error banner

    // 1. Append user message to UI immediately
    const userMsg = { id: Date.now(), role: 'user', text: trimmedInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. POST to Python FastAPI backend → /api/chat
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: buildHistory(messages),
        }),
      });

      // 3. Parse response
      const data = await response.json();

      if (!response.ok) {
        // Surface specific backend errors (e.g. 429 quota exceeded)
        const errDetail = data?.detail || `Server error: ${response.status}`;
        if (response.status === 429) {
          setApiError('⏳ API quota exceeded. Please wait a moment and try again.');
        } else {
          setApiError(`❌ Backend error: ${errDetail}`);
        }
        throw new Error(errDetail);
      }

      // 4. Append AI reply to chat
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      if (!apiError) {
        // Network / connection failure (backend not running)
        const errMsg = {
          id: Date.now() + 1,
          role: 'ai',
          text: `**Connection Error** ⚠️\n\nCould not reach the backend server at \`http://localhost:8000\`.\n\n**To fix this**, open a terminal and run:\n\`\`\`\ncd backend\npython -m uvicorn main:app --reload --port 8000\n\`\`\`\n\n_Error details: ${error.message}_`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } else {
        // Backend returned an error — show it in chat
        const errMsg = {
          id: Date.now() + 1,
          role: 'ai',
          text: `**I encountered an issue** ⚠️\n\n${apiError}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[660px]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="bg-blue-100 p-2 rounded-full">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">AI Doc — Clinical Consultation</h2>
          <p className="text-xs text-slate-400">Powered by Groq / Llama 3.3</p>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {/* ── API Error Banner (quota / connection issues) ── */}
      {apiError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-auto text-amber-500 hover:text-amber-700">✕</button>
        </div>
      )}

      {/* ── Chat History ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-white border border-slate-200'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-blue-500" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
              }`}
            >
              {/* ReactMarkdown renders bullet points, bold, blockquotes etc. */}
              <ReactMarkdown
                components={msg.role === 'user' ? userMarkdownComponents : markdownComponents}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Typing / thinking indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Not a substitute for professional medical advice. Consult a licensed doctor for diagnosis.
        </p>
      </div>
    </div>
  );
}
