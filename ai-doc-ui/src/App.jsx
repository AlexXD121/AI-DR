import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Chatbot from './components/Chatbot';
import SkinAnalyzer from './components/SkinAnalyzer';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        
        <div className="mt-12 transition-all duration-300 ease-in-out">
          {activeTab === 'chat' ? <Chatbot /> : <SkinAnalyzer />}
        </div>
      </main>
    </div>
  );
}
