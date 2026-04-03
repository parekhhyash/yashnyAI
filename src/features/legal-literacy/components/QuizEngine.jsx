// QuizEngine.jsx - Wraps scenarios into a quiz session with progress bar
// Final Verdict end screen with courtroom styling

import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import { askClaude, parseJSONResponse } from '../utils/aiService';

const API_BASE = "http://localhost:5001";

const css = `
  @keyframes lexFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lexGoldGlow {
    0%,100% { box-shadow: 0 0 20px rgba(234,179,8,0.3); }
    50%     { box-shadow: 0 0 40px rgba(234,179,8,0.6); }
  }
  @keyframes lexAIPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @media (prefers-reduced-motion:reduce){ * { animation:none!important; } }

  .topic-pill {
    border: 2px solid #1a3a2a; background: transparent; 
    color: #1a3a2a; border-radius: 999px; padding: 8px 16px;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: all 0.2s ease;
    font-weight: 500;
  }
  .topic-pill-active {
    background: #1a3a2a; color: #a8e63d; border: 2px solid #1a3a2a;
  }
  .topic-pill:hover:not(.topic-pill-active) {
    background: rgba(26, 58, 42, 0.05);
  }
`;

const TOPICS = [
  "🛒 Consumer Rights", "💼 Workplace Rights", "🏠 Tenant Rights",
  "💻 Cyber Law", "📋 RTI", "👩 Women's Rights", "🚦 Traffic Law",
  "👮 Police & Arrest", "🏦 Banking & Fraud", "🌿 Environment Law"
];

export default function QuizEngine({ userEmail, onGoDashboard }) {
  // Navigation & Preferences State
  const [view, setView] = useState('preferences'); // preferences, loading, quiz, done
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(5);
  const [prefError, setPrefError] = useState('');

  // Quiz State
  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  // AI Verdict State
  const [aiVerdict, setAiVerdict] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const toggleTopic = (topic) => {
    setPrefError('');
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : prev.length < 4 ? [...prev, topic] : prev
    );
  };

  const generateQuiz = async () => {
    if (selectedTopics.length === 0) {
      setPrefError("Please select at least one topic to continue");
      return;
    }

    setView('loading');
    try {
      const topicsList = selectedTopics.join(', ');
      
      const prompt = `You are a legal education quiz creator for India.
  
Create ${questionCount} quiz questions for a ${difficulty} level student.
Topics to cover: ${topicsList}

Distribute questions evenly across the selected topics.
Each question must be a real-world scenario set in India that a 
young adult aged 18-28 would actually face.

Respond ONLY with a valid JSON array. No explanation, no markdown, 
no backticks. Raw JSON only:
[
  {
    "id": 1,
    "category": "topic name",
    "situation": "2-3 sentence real scenario in India",
    "question": "What should you do?",
    "options": ["A. option one", "B. option two", "C. option three", "D. option four"],
    "correctOption": "B",
    "explanation": "2-3 sentence plain English explanation",
    "difficulty": "${difficulty}"
  }
]

Make each scenario genuinely different. 
Do NOT repeat situations across questions.`;

      const response = await askClaude(prompt, 2000);
      const generatedQuestions = parseJSONResponse(response);
      
      setScenarios(generatedQuestions || []);
      setCurrentIdx(0);
      setScore(0);
      setHasAnswered(false);
      setView('quiz');
    } catch (err) {
      console.error('Quiz Generation error:', err);
      setView('error');
    }
  };

  const handleAnswer = (isCorrect) => {
    setHasAnswered(true);
    if (isCorrect) setScore(s => s + 1);
    
    // Track progress on backend for specific user
    fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: userEmail, 
        scenarioId: scenarios[currentIdx].id, 
        isCorrect,
        points: isCorrect ? 10 : 2 // Small bonus for trying
      })
    }).catch(e => console.error("Progress save failed:", e));
  };

  const nextQuestion = () => {
    setHasAnswered(false);
    if (currentIdx + 1 >= scenarios.length) setView('done');
    else setCurrentIdx(idx => idx + 1);
  };

  const resetQuiz = () => {
    setView('preferences');
    setSelectedTopics([]);
    setDifficulty('Beginner');
    setQuestionCount(5);
  };

  /* ── FINAL VERDICT WITH AI FEEDBACK ── */
  useEffect(() => {
    if (view !== 'done' || scenarios.length === 0) return;
    
    let isMounted = true;
    const fetchVerdict = async () => {
      setAiLoading(true);
      setAiError('');
      try {
        const categories = [...new Set(scenarios.map(s => s.category))].join(', ');
        const prompt = `You are a supportive legal education mentor.
A user just completed a legal literacy quiz with these results:
- Score: ${score} out of ${scenarios.length} correct
- Topics attempted: ${categories}
- Difficulty: ${difficulty}

Write a SHORT personalized message (under 80 words) that:
1. Acknowledges their performance warmly (not generically)
2. Points out which legal area they should study next
3. Ends with one encouraging sentence

Tone: like a friendly mentor, not a robot. Speak directly to them as "you".`;
        
        const response = await askClaude(prompt, 300);
        if (isMounted) setAiVerdict(response);
      } catch (err) {
        console.error('AI Verdict error:', err);
        if (isMounted) setAiError('Your AI mentor could not review the case file right now.');
      } finally {
        if (isMounted) setAiLoading(false);
      }
    };
    
    fetchVerdict();
    return () => { isMounted = false; };
  }, [view, score, scenarios, difficulty]);

  if (scenarios.length === 0 && view === 'quiz') return <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>Loading quiz...</div>;

  /* ── VIEW 1: PREFERENCES ── */
  if (view === 'preferences') {
    return (
      <div style={{ padding: '40px 20px', fontFamily: "'Outfit',sans-serif", animation: 'lexFadeIn 0.4s ease' }}>
        <style>{css}</style>
        <div style={{ maxWidth: '640px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #a8e63d' }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '2rem', fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>
            ⚖️ Customise Your Arena
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>Choose what you want to be tested on today</p>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontWeight: 700, color: '#1a3a2a', marginBottom: '16px', fontSize: '1.1rem' }}>Pick your legal topics (up to 4)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`topic-pill ${selectedTopics.includes(topic) ? 'topic-pill-active' : ''}`}
                >
                  {topic}
                </button>
              ))}
            </div>
            {prefError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '12px', fontWeight: 600 }}>{prefError}</div>}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontWeight: 700, color: '#1a3a2a', marginBottom: '16px', fontSize: '1.1rem' }}>Difficulty level</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                const icons = { Beginner: '🟢 ', Intermediate: '🟡 ', Advanced: '🔴 ' };
                return (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`topic-pill ${difficulty === level ? 'topic-pill-active' : ''}`}
                  >
                    {icons[level]}{level}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontWeight: 700, color: '#1a3a2a', marginBottom: '16px', fontSize: '1.1rem' }}>Number of questions</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[3, 5, 8, 10].map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`topic-pill ${questionCount === count ? 'topic-pill-active' : ''}`}
                  style={{ minWidth: '50px', textAlign: 'center' }}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuiz}
            style={{
              width: '100%', padding: '16px', background: '#a8e63d', color: '#1a3a2a',
              border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem',
              fontFamily: "'Syne', sans-serif", cursor: 'pointer', transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(168,230,61,0.3)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Generate My Quiz ✨
          </button>
        </div>
      </div>
    );
  }

  /* ── VIEW 2: LOADING ── */
  if (view === 'loading') {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: "'Outfit',sans-serif" }}>
        <style>{css}</style>
        <div style={{ fontSize: '3rem', animation: 'lexFadeIn 0.8s ease infinite alternate', marginBottom: '24px' }}>🤖</div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a3a2a' }}>
          Building your personalised quiz...
        </h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>Drafting legal scenarios for {selectedTopics.join(', ')}</p>
      </div>
    );
  }

  /* ── VIEW 3: ERROR ── */
  if (view === 'error') {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: "'Outfit',sans-serif" }}>
        <div style={{ fontSize: '3rem', marginBottom: '24px' }}>⚠️</div>
        <h3 style={{ color: '#dc2626', fontWeight: 700 }}>Couldn't generate quiz. Try again.</h3>
        <button onClick={resetQuiz} style={{ marginTop: '20px', padding: '10px 24px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Preferences
        </button>
      </div>
    );
  }

  /* ── VIEW 4: DONE (VERDICT) ── */
  if (view === 'done') {
    const isPerfect = score === scenarios.length;
    return (
      <div style={{ padding: '60px 20px', fontFamily: "'Outfit', sans-serif", animation: 'lexFadeIn 0.4s ease' }}>
        <style>{css}</style>
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '40px',
          textAlign: 'center', maxWidth: '560px', margin: '0 auto',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          borderTop: '6px solid #a8e63d',
          ...(isPerfect ? { animation: 'lexGoldGlow 2s ease infinite' } : {})
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>
            THE VERDICT
          </div>
          {isPerfect && (
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#fff', padding: '8px 24px', borderRadius: '999px',
              fontWeight: 700, fontSize: '0.9rem', margin: '16px 0',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>Perfect Judgement</div>
          )}
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '4rem', fontWeight: 800, color: '#1a3a2a', margin: '24px 0 12px' }}>
            {score} / {scenarios.length}
          </div>
          <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '1.1rem' }}>You ruled on {score} of {scenarios.length} cases correctly</p>
          <p style={{ color: '#1a3a2a', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>+{score * 10} points added to dossier</p>

          <div style={{
            marginTop: '24px', padding: '20px', background: '#f8fafc',
            borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left'
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#1a3a2a', marginBottom: '12px' }}>
              🤖 Your AI Legal Mentor Says:
            </div>

            {aiLoading && (
              <div style={{ color: '#4a9e6b', fontStyle: 'italic', fontFamily: "'Outfit'", fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ animation: 'lexAIPulse 1.2s ease-in-out infinite' }}>⚖️</span>
                Analysing your performance...
              </div>
            )}

            {aiError && (
              <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '12px', color: '#991b1b', fontSize: '0.85rem', fontFamily: "'Outfit'" }}>
                ⚠️ {aiError}
              </div>
            )}

            {aiVerdict && (
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #a8e63d', borderRadius: '8px', padding: '16px', fontFamily: "'Outfit'", fontSize: '0.95rem', lineHeight: 1.6, color: '#1a3a2a', animation: 'lexFadeIn 0.3s ease', whiteSpace: 'pre-wrap' }}>
                {aiVerdict}
                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic' }}>
                  🤖 AI-Generated Feedback 
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={resetQuiz} style={{ padding: '12px 28px', background: '#a8e63d', color: '#0D3B2E', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', fontFamily: "'Outfit'" }}>
              New Quiz
            </button>
            <button onClick={onGoDashboard} style={{ padding: '12px 28px', background: '#1a3a2a', color: '#f5f0e8', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', fontFamily: "'Outfit'" }}>
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── VIEW 5: QUIZ IN PROGRESS ── */
  const progress = ((currentIdx + (hasAnswered ? 1 : 0)) / scenarios.length) * 100;

  return (
    <div style={{ padding: '40px 20px', fontFamily: "'Outfit',sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth: '640px', margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button 
            onClick={resetQuiz}
            style={{
              background: 'transparent', border: '1px solid #6b7280', 
              color: '#6b7280', fontSize: '0.8rem', padding: '4px 10px',
              borderRadius: '6px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
            }}
          >
            ↺ New Quiz
          </button>
          <div style={{ display: 'flex', gap: '16px', fontWeight: 700, color: '#1a3a2a' }}>
            <span>Question {currentIdx + 1} of {scenarios.length}</span>
            <span>Score: {score}</span>
          </div>
        </div>
        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #a8e63d, #4a9e6b)',
            width: `${progress}%`, transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <QuestionCard key={currentIdx} scenario={scenarios[currentIdx]} onAnswer={handleAnswer} />

      {hasAnswered && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button onClick={nextQuestion} style={{
            padding: '14px 40px', background: '#a8e63d', color: '#0D3B2E',
            border: 'none', borderRadius: '12px', fontWeight: 700,
            cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(168,230,61,0.25)',
            fontFamily: "'Syne', sans-serif",
            transition: 'all 0.2s ease'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            {currentIdx + 1 === scenarios.length ? 'See Verdict' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
