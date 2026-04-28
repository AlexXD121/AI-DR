import { Stethoscope } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-stone-50/80 border-b border-stone-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="bg-teal-500 p-2.5 rounded-2xl text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-stone-800">
              AI Doc
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-2 sm:gap-4 bg-white p-1.5 rounded-full shadow-sm border border-stone-100">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center px-5 py-2.5 rounded-full text-base font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'chat'
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <span className="mr-2 text-lg">💬</span>
              Chat
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center px-5 py-2.5 rounded-full text-base font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'analyze'
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <span className="mr-2 text-lg">🔍</span>
              Skin Check
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
