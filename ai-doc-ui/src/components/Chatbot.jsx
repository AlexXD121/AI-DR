import { Send, User, Loader2, AlertTriangle, Smile } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// System welcome message shown on first load
const WELCOME_MESSAGE = {
  id: 1,
  role: 'ai',
  text: "Hi there! I'm AI Doc. I'm here to listen and help you understand how you're feeling. What's bothering you today?\n\n> 💡 Please remember, I'm a helpful guide, not a real doctor!",
};

// Custom markdown components styled for the medical chat UI
const markdownComponents = {
  // Paragraphs
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,

  // Bold text
  strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,

  // Bullet lists
  ul: ({ children }) => (
    <ul className="mt-2 mb-3 space-y-2 pl-5 list-disc marker:text-teal-400">{children}</ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  // Numbered lists
  ol: ({ children }) => (
    <ol className="mt-2 mb-3 space-y-2 pl-5 list-decimal marker:text-teal-400">{children}</ol>
  ),

  // Blockquote (used for disclaimers)
  blockquote: ({ children }) => (
    <blockquote className="mt-4 bg-teal-50 pl-4 pr-3 py-3 rounded-2xl text-teal-800 text-sm border border-teal-100">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ children }) => (
    <code className="bg-stone-100 text-teal-700 rounded-md px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  ),
};

// User message markdown
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
  const [apiError, setApiError] = useState(null);
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
        content: m.text,
      }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setApiError(null);

    // 1. Append user message to UI immediately
    const userMsg = { id: Date.now(), role: 'user', text: trimmedInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. POST to Python FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: buildHistory(messages),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errDetail = data?.detail || `Server error: ${response.status}`;
        if (response.status === 429) {
          setApiError("We're getting a lot of questions right now! Please try again in a moment.");
        } else {
          setApiError(`Something went wrong: ${errDetail}`);
        }
        throw new Error(errDetail);
      }

      // 4. Append AI reply to chat
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      if (!apiError) {
        const errMsg = {
          id: Date.now() + 1,
          role: 'ai',
          text: `**I'm having trouble connecting** ⚠️\n\nI can't seem to reach the clinic's server.\n\n_Details: ${error.message}_`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } else {
        const errMsg = {
          id: Date.now() + 1,
          role: 'ai',
          text: `**Oops, something went wrong** ⚠️\n\n${apiError}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[700px]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 py-5 flex items-center gap-4 flex-shrink-0">
        <div className="bg-teal-100 p-2.5 rounded-full">
          <Smile className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="font-bold text-stone-800 text-lg">Chat with AI Doc</h2>
          <p className="text-sm text-stone-500">Here to listen and help</p>
        </div>
      </div>

      {/* ── API Error Banner ── */}
      {apiError && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm flex-shrink-0">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-auto text-amber-500 hover:text-amber-700 font-bold p-1">✕</button>
        </div>
      )}

      {/* ── Chat History ── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-stone-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-teal-500' : 'bg-white border border-stone-200'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Smile className="w-5 h-5 text-teal-500" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-5 py-4 text-[15px] shadow-sm ${
                msg.role === 'user'
                  ? 'bg-teal-500 text-white rounded-3xl rounded-br-sm'
                  : 'bg-white text-stone-700 border border-stone-100 rounded-3xl rounded-bl-sm'
              }`}
            >
              <ReactMarkdown
                components={msg.role === 'user' ? userMarkdownComponents : markdownComponents}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center">
              <Smile className="w-5 h-5 text-teal-500" />
            </div>
            <div className="bg-white border border-stone-100 rounded-3xl rounded-bl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-2.5 h-2.5 bg-teal-200 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 bg-teal-200 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 bg-teal-200 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white border-t border-stone-100 px-6 py-5 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type how you are feeling here..."
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-stone-50 border border-stone-200 rounded-full text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all disabled:opacity-60 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-14 h-14 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6 ml-1" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
