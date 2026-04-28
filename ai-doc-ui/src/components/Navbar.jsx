import { Stethoscope } from 'lucide-react';

const TABS = [
  { id: 'chat',    label: 'Chat',       emoji: '💬' },
  { id: 'analyze', label: 'Skin Check', emoji: '🔍' },
  { id: 'health',  label: 'My Health',  emoji: '❤️' },
  { id: 'doctors', label: 'Doctors',    emoji: '🩺' },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-stone-50/80 border-b border-stone-200 shadow-sm transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer flex-shrink-0"
            onClick={() => setActiveTab('chat')}
          >
            <div className="bg-teal-500 p-2.5 rounded-2xl text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-stone-800">AI Doc</span>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-1 bg-white p-1.5 rounded-full shadow-sm border border-stone-100">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                <span className="mr-1.5 text-base">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
}
