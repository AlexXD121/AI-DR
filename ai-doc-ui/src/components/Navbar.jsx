import { Stethoscope, MessageSquare, ScanSearch } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="bg-blue-500 p-2 rounded-lg text-white shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              AI Doc
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chatbot</span>
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ScanSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze Skin Disease</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
