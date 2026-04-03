// index.jsx - Root entry point for LexArena
// Provides sidebar navigation and content switching with fade animation

import React, { useState } from 'react';
import { 
  Users, Zap, FileText, Database, Plus, History, Settings
} from 'lucide-react';
import ProgressDashboard from './components/ProgressDashboard';
import QuizEngine from './components/QuizEngine';
import ScenarioPage from './components/ScenarioPage';
import ModuleList from './components/ModuleList';

const cssBlock = `
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

  @keyframes lexFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lex-sidebar {
    width: 288px;
    background: #0D3B2E;
    height: calc(100vh - 64px);
    position: sticky;
    top: 64px;
    border-right: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    z-index: 40;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .lex-sidebar-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
    transition: all 0.3s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .lex-sidebar-btn:hover { 
    color: #fff; 
    background: rgba(255, 255, 255, 0.05);
  }

  .lex-sidebar-active {
    background: rgba(168, 230, 61, 0.1) !important;
    border: 1px solid rgba(168, 230, 61, 0.3) !important;
    color: #A8E63D !important;
  }

  .lex-sidebar-btn span {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .lex-content-fade { animation: lexFadeIn 0.3s ease forwards; }

  /* Custom scrollbar for sidebar */
  .lex-sidebar-nav::-webkit-scrollbar { display: none; }
  .lex-sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }

  @media (max-width: 768px) {
    .lex-sidebar {
      width: 100%;
      height: auto;
      position: relative;
      top: 0;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .lex-layout {
      flex-direction: column !important;
    }
  }
`;

export default function LegalLiteracyApp({ userEmail = 'guest' }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrolled, setScrolled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const hasSeen = localStorage.getItem('lexarena_onboarded');
    if (!hasSeen) {
      setTimeout(() => setShowOnboarding(true), 1200);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('lexarena_onboarded', 'true');
  };

  const nextStep = () => {
    if (onboardStep < 3) setOnboardStep(s => s + 1);
    else finishOnboarding();
  };

  const restartOnboarding = () => {
    setOnboardStep(0);
    setShowOnboarding(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'My Profile', icon: Users },
    { id: 'quiz',      label: 'Enter the Arena', icon: Zap },
    { id: 'scenarios', label: 'Case Files', icon: FileText },
    { id: 'modules',   label: 'Law Scrolls', icon: Database }
  ];

  const onboardingData = [
    { target: 'dashboard', title: '🪪 Your Dossier', text: 'Track your legal literacy points and professional badges here.' },
    { target: 'quiz',      title: '🎯 The Arena',   text: 'Generate custom AI quizzes based on your favorite legal topics.' },
    { target: 'scenarios', title: '📁 Case Files',  text: 'Examine real-world legal scenarios or draft new ones with AI.' },
    { target: 'modules',   title: '📜 Law Scrolls', text: 'Search any legal concept to generate a custom Law Scroll.' }
  ];

  return (
    <>
      <style>{cssBlock}</style>
      
      {/* ─── ONBOARDING OVERLAY ─── */}
      {showOnboarding && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(13, 59, 46, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'lexFadeIn 0.4s ease'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '24px',
            maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            borderTop: '6px solid #a8e63d', position: 'relative'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              {onboardingData[onboardStep].target === 'dashboard' && '🛡️'}
              {onboardingData[onboardStep].target === 'quiz' && '⚔️'}
              {onboardingData[onboardStep].target === 'scenarios' && '⚖️'}
              {onboardingData[onboardStep].target === 'modules' && '📜'}
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#1a3a2a', marginBottom: '12px' }}>
              {onboardingData[onboardStep].title}
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>
              {onboardingData[onboardStep].text}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width: i === onboardStep ? '20px' : '8px', height: '8px', background: i === onboardStep ? '#a8e63d' : '#e5e7eb', borderRadius: '4px', transition: 'all 0.3s' }} />
                ))}
              </div>
              <button 
                onClick={nextStep}
                style={{
                  background: '#1a3a2a', color: '#a8e63d', border: 'none',
                  padding: '10px 24px', borderRadius: '10px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                {onboardStep === 3 ? 'Get Started →' : 'Next Tip'}
              </button>
            </div>
            
            <button 
              onClick={finishOnboarding}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
            >✕</button>
          </div>
          
          <div style={{ marginTop: '20px', color: 'white', fontWeight: 600, fontSize: '0.9rem', opacity: 0.8 }}>
            Step {onboardStep + 1} of 4 • Welcome to LexArena
          </div>
        </div>
      )}

      {/* ─── HELP BUTTON (BOTTOM LEFT) ─── */}
      <button
        onClick={restartOnboarding}
        title="Help & Tutorial"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 80,
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#1a3a2a', color: '#a8e63d', border: '2px solid #a8e63d',
          fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
          fontFamily: "'Syne', sans-serif"
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ?
      </button>

      <div className="lex-layout" style={{ display: 'flex', minHeight: '100vh', paddingTop: '64px', background: '#F5F0E8' }}>

        {/* Sidebar Nav */}
        <aside className="lex-sidebar">
          {/* Noise overlay */}
          <div className="absolute inset-0 noise-overlay opacity-20 pointer-events-none"></div>
          
          <nav className="lex-sidebar-nav flex-1 px-4 py-8 space-y-2 relative z-10 overflow-y-auto">
            <p style={{
              fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.3em',
              paddingLeft: '16px', marginBottom: '24px'
            }}>
              Learning Path
            </p>
            
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`lex-sidebar-btn ${activeTab === tab.id ? 'lex-sidebar-active' : ''}`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Legal Arena v1.0.4
            </div>
          </div>
        </aside>

        {/* Scrollable Content */}
        <main key={activeTab} className="lex-content-fade" style={{ flex: 1, padding: '20px', background: '#F5F0E8' }}>
          {activeTab === 'dashboard' && <ProgressDashboard userEmail={userEmail} onGoQuiz={() => setActiveTab('quiz')} />}
          {activeTab === 'quiz' && <QuizEngine userEmail={userEmail} onGoDashboard={() => setActiveTab('dashboard')} />}
          {activeTab === 'scenarios' && <ScenarioPage userEmail={userEmail} onComplete={() => setActiveTab('dashboard')} />}
          {activeTab === 'modules' && <ModuleList userEmail={userEmail} />}
        </main>
      </div>
    </>
  );
}
