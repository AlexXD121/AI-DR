import { Send, User, Loader2, AlertTriangle, Smile, Trash2, Download, PhoneCall, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

// ── Emergency keywords ──────────────────────────────────────────────────────
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cardiac arrest', 'unconscious', 'not breathing',
  'bleeding heavily', 'can\'t breathe', 'cannot breathe', 'stroke', 'seizure',
  'overdose', 'poisoning', 'suicide', 'kill myself', 'end my life',
  'anaphylaxis', 'severe allergic', 'choking', 'drowning',
  'severe burn', 'broken bone', 'loss of consciousness',
];

const checkEmergency = (text) =>
  EMERGENCY_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

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
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai-doc-chat-history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Check if browser supports speech recognition ────────────────────────
  const speechSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ── Voice input handler ─────────────────────────────────────────────────
  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      // Stop manually
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;  // show live partial transcription
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      // Build the transcript from all result segments
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai-doc-chat-history', JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [messages]);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([WELCOME_MESSAGE]);
      setApiError(null);
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Doc Consultation Report', margin, cursorY);
    cursorY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, cursorY);
    cursorY += 15;

    // Iterate through messages
    messages.forEach((msg) => {
      if (msg.id === 1) return; // Skip welcome message

      // Add a new page if we are too low
      if (cursorY > 270) {
        doc.addPage();
        cursorY = 20;
      }

      const isUser = msg.role === 'user';
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      if (isUser) {
        doc.setTextColor(13, 148, 136); // teal-600
        doc.text('Patient Symptom:', margin, cursorY);
      } else {
        doc.setTextColor(68, 64, 60); // stone-700
        doc.text('AI Doc Advice:', margin, cursorY);
      }
      cursorY += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // black

      // Simple text formatting (removes basic markdown)
      let cleanText = msg.text.replace(/\*\*/g, '').replace(/> /g, '').replace(/_/g, '');
      
      const lines = doc.splitTextToSize(cleanText, maxLineWidth);
      doc.text(lines, margin, cursorY);
      
      cursorY += (lines.length * 6) + 10; // line height spacing + padding
    });

    doc.save('AI_Doc_Consultation.pdf');
  };

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

    // Check for emergency keywords before anything else
    if (checkEmergency(trimmedInput)) {
      setIsEmergency(true);
    }

    // 1. Append user message to UI immediately
    const userMsg = { id: Date.now(), role: 'user', text: trimmedInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Read health profile from localStorage to personalise AI responses
      let patientProfile = null;
      try {
        const savedProfile = localStorage.getItem('ai-doc-health-profile');
        if (savedProfile) patientProfile = JSON.parse(savedProfile);
      } catch (_) {}

      // 2. POST to Python FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: buildHistory(messages),
          patient_profile: patientProfile,
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
    <div className={`rounded-[2rem] shadow-sm border overflow-hidden flex flex-col h-[700px] transition-colors duration-500 ${
      isEmergency ? 'bg-red-50 border-red-300' : 'bg-white border-stone-200'
    }`}>

      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 py-5 flex items-center gap-4 flex-shrink-0">
        <div className="bg-teal-100 p-2.5 rounded-full">
          <Smile className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-stone-800 text-lg">Chat with AI Doc</h2>
          <p className="text-sm text-stone-500">Here to listen and help</p>
        </div>
        <div className="flex gap-2">
          {messages.length > 1 && (
            <>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-full transition-colors border border-transparent hover:border-teal-100"
                title="Download Report"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
              </button>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Emergency Banner ── */}
      {isEmergency && (
        <div className="flex-shrink-0 bg-red-600 text-white px-5 py-4">
          <div className="flex items-start gap-3">
            <PhoneCall className="w-6 h-6 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold text-base">🚨 EMERGENCY DETECTED: Please seek immediate medical help.</p>
              <p className="text-red-100 text-sm mt-0.5">Do not wait — call your local emergency number (e.g. 112 / 911) right now.</p>
            </div>
            <button
              onClick={() => setIsEmergency(false)}
              className="text-red-200 hover:text-white transition-colors p-1 flex-shrink-0"
              aria-label="Dismiss"
            >✕</button>
          </div>
          <a
            href="https://www.google.com/maps/search/hospitals+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-red-700 font-semibold text-sm rounded-full hover:bg-red-50 transition-colors shadow-sm"
          >
            🏥 Find Nearby Hospitals
          </a>
        </div>
      )}

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

        {/* Quick Suggestion Chips — only shown before first user message */}
        {messages.length === 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              '\uD83E\uDD15 I\'ve been having headaches recently',
              '\uD83D\uDCA4 Can you analyse my sleep health?',
              '\uD83D\uDE14 I feel constantly fatigued',
              '\uD83E\uDDEA What does my BMI mean?',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  const text = chip.replace(/^[\u{1F300}-\u{1FAD6}\s]+/u, '').trim();
                  setInput(text);
                  // auto-send via synthetic event
                  setTimeout(() => {
                    document.getElementById('chat-submit-btn')?.click();
                  }, 50);
                }}
                className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full hover:bg-teal-100 hover:border-teal-300 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening… speak now' : 'Type how you are feeling here...'}
            disabled={isLoading}
            className={`flex-1 px-6 py-4 border rounded-full text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:border-teal-500 transition-all disabled:opacity-60 shadow-inner ${
              isListening
                ? 'bg-red-50 border-red-300 focus:ring-red-300/40 placeholder:text-red-400'
                : 'bg-stone-50 border-stone-200 focus:ring-teal-500/40'
            }`}
          />

          {/* Mic button — hidden on unsupported browsers */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-500'
              }`}
            >
              {isListening
                ? <MicOff className="w-5 h-5" />
                : <Mic    className="w-5 h-5" />}
            </button>
          )}

          <button
            type="submit"
            id="chat-submit-btn"
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
