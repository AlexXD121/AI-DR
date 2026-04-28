import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Chatbot from './components/Chatbot';
import SkinAnalyzer from './components/SkinAnalyzer';
import HealthProfile from './components/HealthProfile';
import DoctorDirectory from './components/DoctorDirectory';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero only shows on the chat landing tab */}
        {activeTab === 'chat' && <Hero />}

        {/* Page title for non-chat tabs */}
        {activeTab === 'analyze' && (
          <div className="py-10 text-center">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Skin Check-up</h1>
            <p className="text-stone-500">Upload a photo and we'll help guide you.</p>
          </div>
        )}
        {activeTab === 'health' && (
          <div className="py-10 text-center">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Your Health Profile</h1>
            <p className="text-stone-500">Track your wellness and see your personalised score.</p>
          </div>
        )}
        {activeTab === 'doctors' && (
          <div className="py-10 text-center">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Doctor Directory</h1>
            <p className="text-stone-500">Find specialists and book a mock consultation.</p>
          </div>
        )}

        <div className="mt-4 transition-all duration-300 ease-in-out">
          {activeTab === 'chat'    && <Chatbot />}
          {activeTab === 'analyze' && <SkinAnalyzer />}
          {activeTab === 'health'  && <HealthProfile />}
          {activeTab === 'doctors' && <DoctorDirectory />}
        </div>
      </main>
    </div>
  );
}
