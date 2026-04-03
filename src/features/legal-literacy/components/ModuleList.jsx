// ModuleList.jsx - Renders Law Scrolls as sealed letters that unfold
// Each module is a sealed envelope that opens with an unfolding animation on click

import React, { useState } from 'react';
import { modules as staticModules } from '../data/modules';
import { askClaude, parseJSONResponse } from '../utils/aiService';

const css = `
  @keyframes lexFadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lexPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes lexAIPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }

  .lex-letter {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .lex-letter:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
  }

  /* Sealed envelope flap */
  .lex-flap {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(135deg, #1a3a2a 0%, #2d5a42 100%);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    transition: transform 0.5s ease, opacity 0.3s ease;
    transform-origin: top center;
    z-index: 2;
  }
  .lex-letter-open .lex-flap {
    transform: rotateX(180deg);
    opacity: 0;
  }

  /* Wax seal - using text instead of emoji */
  .lex-seal {
    position: absolute;
    top: 36px; left: 50%;
    transform: translateX(-50%);
    width: 44px; height: 44px;
    border-radius: 50%;
    background: radial-gradient(circle, #c8f570 30%, #7cb518 100%);
    border: 3px solid #5a9a1f;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem;
    font-weight: 800;
    color: #1a3a2a;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.5s ease, opacity 0.4s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .lex-letter-open .lex-seal {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }

  /* Letter content slides up */
  .lex-letter-body {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.5s ease, opacity 0.4s ease 0.1s, padding 0.4s ease;
    padding: 0 24px;
  }
  .lex-letter-open .lex-letter-body {
    max-height: 800px;
    opacity: 1;
    padding: 20px 24px 28px;
  }

  .lex-skeleton {
    background: white; border-radius: 12px; 
    padding: 24px; margin-bottom: 24px;
    border-left: 4px solid #e5e7eb;
    animation: lexFadeIn 0.3s ease;
    width: 100%; grid-column: 1 / -1;
  }
  .lex-skeleton-bar {
    background: #f3f4f6; border-radius: 6px; 
    animation: lexPulse 1.5s ease-in-out infinite;
  }
`;

export default function ModuleList({ userEmail }) {
  const [openIds, setOpenIds] = useState(new Set());
  
  // New AI Module Generation State
  const [aiModules, setAiModules] = useState([]);
  const [userTopic, setUserTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Rights Explainer State (Bottom Explainer)
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiExLoading, setAiExLoading] = useState(false);
  const [aiExError, setAiExError] = useState('');

  const generateAIModule = async () => {
    if (!userTopic.trim()) return;
    setIsGenerating(true);
    
    try {
      const prompt = `You are a legal education content writer for India.
  
Create a short micro-learning module about: "${userTopic}"

Write for a general audience aged 18-35 with no legal background.
Use simple, conversational language. Set all examples in India.

Respond ONLY with a JSON object:
{
  "id": ${Date.now()},
  "title": "clear title for this module",
  "category": "relevant category",
  "readTime": "X min",
  "content": "6-8 sentences explaining the right, application, violation, and an Indian example.",
  "keyTakeaway": "one sentence summary"
}`;

      const response = await askClaude(prompt, 1000);
      const newModule = parseJSONResponse(response);
      
      if (newModule) {
        newModule.isAI = true;
        setAiModules(prev => [newModule, ...prev]);
        setUserTopic('');
      }
    } catch (err) {
      console.error('AI Module Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplainAI = async () => {
    if (!aiQuery.trim()) return;
    setAiExLoading(true);
    setAiExError('');
    setAiResponse('');

    try {
      const prompt = `Explain "${aiQuery}" for an Indian audience in plain English.
1. What it is
2. When it applies
3. Violation steps
4. Real example from India
Under 150 words.`;
      
      const text = await askClaude(prompt, 600);
      setAiResponse(text);
    } catch (err) {
      console.error('AI Rights Explainer error:', err);
      setAiExError('Could not unpack this legal scroll right now.');
    } finally {
      setAiExLoading(false);
    }
  };

  const toggleOpen = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const combinedModules = [...aiModules, ...staticModules];

  return (
    <div style={{ padding: '48px 20px', fontFamily: "'Outfit', sans-serif" }}>
      <style>{css}</style>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: '2.8rem',
          fontWeight: 800, color: '#1a3a2a', margin: '0 0 8px'
        }}>Law Scrolls</h2>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Sealed legal knowledge. Tap to break the seal.
        </p>
      </div>

      {/* AI Module Generator Bar */}
      <div style={{
        maxWidth: '1000px', margin: '0 auto 40px',
        display: 'flex', gap: '12px', flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={userTopic}
          onChange={e => setUserTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateAIModule()}
          placeholder="What legal topic do you want to learn about? e.g. 'Workplace rights'"
          style={{
            flex: 1, padding: '16px 24px', borderRadius: '14px',
            border: '2px solid #e5e7eb', fontFamily: "'Outfit', sans-serif",
            fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
          }}
          disabled={isGenerating}
        />
        <button
          onClick={generateAIModule}
          disabled={isGenerating || !userTopic.trim()}
          style={{
            background: '#1a3a2a', color: '#a8e63d', border: 'none',
            borderRadius: '14px', padding: '10px 28px', fontWeight: 700,
            fontFamily: "'Syne', sans-serif", cursor: isGenerating ? 'wait' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isGenerating ? "📜 Drafting..." : "📜 Draft Scroll"}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px', maxWidth: '1000px', margin: '0 auto',
        alignItems: 'start'
      }}>
        {isGenerating && (
          <div className="lex-skeleton">
            <div className="lex-skeleton-bar" style={{ height: '12px', width: '60%', marginBottom: '12px' }} />
            <div className="lex-skeleton-bar" style={{ height: '8px', width: '90%', marginBottom: '8px' }} />
            <div className="lex-skeleton-bar" style={{ height: '8px', width: '75%' }} />
          </div>
        )}

        {combinedModules.map((mod, i) => {
          const isOpen = openIds.has(mod.id);
          return (
            <div
              key={mod.id}
              className={`lex-letter ${isOpen ? 'lex-letter-open' : ''}`}
              onClick={() => toggleOpen(mod.id)}
              style={{
                background: '#fdfcf8',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid #e5e0d5',
                overflow: 'hidden',
                paddingTop: isOpen ? '16px' : '72px',
                paddingBottom: isOpen ? '0' : '24px',
                paddingLeft: '24px',
                paddingRight: '24px',
                minHeight: isOpen ? 'auto' : '220px',
                transition: 'all 0.4s ease',
                animation: `lexFadeIn 0.3s ease ${mod.isAI ? 0 : (i * 100)}ms both`,
                ...(mod.isAI ? { borderLeft: '4px solid #a8e63d' } : {})
              }}
            >
              {mod.isAI && !isOpen && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px', zIndex: 5,
                  background: '#a8e63d', color: '#1a3a2a', fontSize: '0.7rem',
                  padding: '4px 10px', borderRadius: '999px', fontWeight: 800
                }}>✨ AI DRAFTED</div>
              )}
              <div className="lex-flap" />
              <div className="lex-seal">NYAI</div>

              {!isOpen && (
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{
                      background: '#1a3a2a', color: '#fff',
                      padding: '4px 12px', borderRadius: '6px',
                      fontSize: '0.7rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{mod.category}</span>
                    <span style={{
                      background: '#f3f4f6', padding: '4px 10px',
                      borderRadius: '6px', fontSize: '0.7rem', color: '#6b7280',
                      fontWeight: 700
                    }}>{mod.readTime}</span>
                  </div>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '1.4rem',
                    fontWeight: 700, color: '#1a3a2a', marginBottom: '14px'
                  }}>{mod.title}</div>
                  <div style={{
                    color: '#a8e63d', fontSize: '0.8rem',
                    fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase'
                  }}>Break the Seal</div>
                </div>
              )}

              <div className="lex-letter-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    background: '#1a3a2a', color: '#fff',
                    padding: '4px 12px', borderRadius: '6px',
                    fontSize: '0.7rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{mod.category}</span>
                  <span style={{
                    background: '#f3f4f6', padding: '4px 10px',
                    borderRadius: '6px', fontSize: '0.7rem', color: '#6b7280',
                    fontWeight: 700
                  }}>{mod.readTime}</span>
                </div>

                <div style={{
                  fontFamily: "'Syne', sans-serif", fontSize: '1.6rem',
                  fontWeight: 800, color: '#1a3a2a', marginBottom: '16px'
                }}>
                  {mod.title}
                  {mod.isAI && <span style={{ marginLeft: '10px', verticalAlign: 'middle', background: '#a8e63d', color: '#1a3a2a', fontSize: '0.65rem', padding: '2px 10px', borderRadius: '999px', fontWeight: 800 }}>AI DRAFTED</span>}
                </div>

                <div style={{
                  borderTop: '1px dashed #d4cfc4', paddingTop: '16px',
                  fontSize: '1rem', color: '#475569', lineHeight: 1.8,
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {mod.content}
                </div>

                {mod.keyTakeaway && (
                  <div style={{
                    background: '#f0fdf4', borderLeft: '4px solid #a8e63d',
                    padding: '12px 16px', marginTop: '20px', fontSize: '0.9rem',
                    color: '#1a3a2a', borderRadius: '0 8px 8px 0', fontWeight: 500
                  }}>
                    💡 Key Takeaway: {mod.keyTakeaway}
                  </div>
                )}

                <div style={{
                  textAlign: 'center', marginTop: '32px',
                  color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>— tap to seal —</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Rights Explainer */}
      <div style={{
        maxWidth: '1000px', margin: '60px auto 0', padding: '40px',
        background: '#fff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        borderTop: '6px solid #a8e63d'
      }}>
        <h3 style={{
          fontFamily: "'Syne', sans-serif", fontSize: '1.6rem',
          fontWeight: 800, color: '#1a3a2a', margin: '0 0 4px'
        }}>⚡ LexRight Explainer</h3>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '24px' }}>
          Simplified legal clarity in seconds.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExplainAI()}
            placeholder="e.g. My rights during a traffic stop"
            style={{
              flex: '1 1 300px', padding: '16px 24px', borderRadius: '14px',
              border: '2px solid #e5e7eb', fontFamily: "'Outfit', sans-serif",
              fontSize: '1rem', outline: 'none'
            }}
            disabled={aiExLoading}
          />
          <button
            onClick={handleExplainAI}
            disabled={aiExLoading || !aiQuery.trim()}
            style={{
              padding: '14px 32px', background: '#a8e63d',
              color: '#1a3a2a', border: 'none', borderRadius: '14px',
              fontWeight: 800, fontSize: '1rem', cursor: aiExLoading ? 'wait' : 'pointer',
              fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap'
            }}
          >
            Explain ⚖️
          </button>
        </div>

        {aiExLoading && (
          <div style={{ color: '#1a3a2a', fontStyle: 'italic', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ animation: 'lexAIPulse 1.2s ease-in-out infinite' }}>📜</span>
            Decoding the legal scrolls...
          </div>
        )}

        {aiExError && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', fontSize: '0.9rem', marginTop: '16px' }}>
            ⚠️ {aiExError}
          </div>
        )}

        {aiResponse && (
          <div style={{
            background: '#f8fafc', borderLeft: '5px solid #1a3a2a',
            borderRadius: '12px', padding: '28px', marginTop: '24px',
            fontSize: '1.05rem', lineHeight: '1.8', color: '#1a3a2a',
            animation: 'lexFadeIn 0.3s ease', whiteSpace: 'pre-wrap',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {aiResponse}
            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', fontWeight: 600 }}>
              🤖 AI INSIGHT: INDIVIDUAL CASE ANALYSIS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
