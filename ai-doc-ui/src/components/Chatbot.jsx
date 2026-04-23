import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// System welcome message shown on first load
const WELCOME_MESSAGE = {
  id: 1,
  role: 'ai',
  text: "Hello! I'm **AI Doc**, your AI-powered medical assistant 🩺\n\nI can help you understand symptoms, medications, and general health queries. How can I assist you today?\n\n> ⚠️ I provide preliminary guidance only. Always consult a real doctor for serious concerns.",
};

export default function Chatbot() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Converts the local message history into the format
   * that the Gemini API expects: [{role, parts: [text]}]
   */
  const buildHistory = (msgs) => {
    return msgs
      .filter((m) => m.id !== 1) // exclude the static welcome message
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [m.text],
      }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // 1. Append user message to state immediately
    const userMsg = { id: Date.now(), role: 'user', text: trimmedInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. API CALL to Python FastAPI backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: buildHistory(messages), // send conversation history for context
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // 3. Append the AI reply to the chat
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // 4. Show error message in chat on failure
      const errMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: `⚠️ I couldn't connect to the server. Please make sure the backend is running at http://localhost:8000.\n\nError: ${error.message}`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[620px]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="bg-blue-100 p-2 rounded-full">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">AI Doc — Medical Chatbot</h2>
          <p className="text-xs text-slate-400">Powered by Google Gemini</p>
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
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
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
          Not a substitute for professional medical advice. Consult a doctor for diagnosis.
        </p>
      </div>
    </div>
  );
}
