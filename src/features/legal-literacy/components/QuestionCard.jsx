// QuestionCard.jsx - Displays an individual legal scenario question
// Handles validation, green pulse on correct, styled explanation with slide-down
// FEATURE 1: AI Case Advisor — shown after user answers

import React, { useState } from 'react';
import { askClaude } from '../utils/aiService';

const css = `
  @keyframes lexPulseGreen {
    0%   { box-shadow: 0 0 0 0 rgba(168,230,61,0.7); }
    100% { box-shadow: 0 0 0 14px transparent; }
  }
  @keyframes lexSlideDown {
    from { max-height:0; opacity:0; }
    to   { max-height:800px; opacity:1; }
  }
  @keyframes lexAIPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes lexAIFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion:reduce){ * { animation:none!important; } }

  .lex-opt-btn {
    display:block; width:100%; padding:16px 18px; margin-bottom:12px;
    border-radius:12px; border:1px solid #1a3a2a20;
    background:#fff; color:#1a3a2a; cursor:pointer;
    text-align:left; font-size:1rem; font-family:'DM Sans', sans-serif;
    transition: all 0.2s ease;
  }
  .lex-opt-btn:not(:disabled):hover {
    background:#f0fdf4; border-color:#a8e63d; transform:translateX(4px);
  }
`;

const CAT_COLORS = {
  'Consumer Rights': '#a8e63d',
  'Workplace Rights': '#6366f1',
  'Tenant Rights': '#f59e0b',
  'Right to Information': '#10b981',
  'Cyber Law': '#ec4899',
  'Women\'s Rights': '#8b5cf6',
  'Traffic Law': '#f97316',
};

export default function QuestionCard({ scenario, onAnswer }) {
  const [selected, setSelected] = useState(null);

  // AI Case Advisor state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option.charAt(0) === scenario.correctOption.charAt(0);
    if (onAnswer) onAnswer(isCorrect);
  };

  const isCorrectAnswer = selected && selected.charAt(0) === scenario.correctOption.charAt(0);
  const topColor = CAT_COLORS[scenario.category] || '#a8e63d';

  const getBtnStyle = (opt) => {
    if (!selected) return {};
    const isThisCorrect = opt.charAt(0) === scenario.correctOption.charAt(0);
    const isThisSelected = opt === selected;
    if (isThisCorrect)                    return { background: '#dcfce7', borderColor: '#16a34a', color: '#15803d', fontWeight: 600 };
    if (isThisSelected && !isThisCorrect) return { background: '#fee2e2', borderColor: '#dc2626', color: '#991b1b', fontWeight: 600 };
    return { opacity: 0.45, cursor: 'not-allowed' };
  };

  const getStatusText = (opt) => {
    if (!selected) return null;
    const isThisCorrect = opt.charAt(0) === scenario.correctOption.charAt(0);
    const isThisSelected = opt === selected;
    if (isThisCorrect) return '[CORRECT] ';
    if (isThisSelected && !isThisCorrect) return '[INCORRECT] ';
    return null;
  };

  // ─── AI Case Advisor handler ───
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResponse('');

    // AI HOOK: This call can be replaced with any LLM provider later
    const prompt = `You are a legal education assistant helping a user in India understand their rights. The user just answered a quiz question about this scenario:

Situation: ${scenario.situation}
Question: ${scenario.question}
User selected: ${selected}
Correct answer: ${scenario.correctOption}

The user is now asking: "${aiQuestion}"

Answer in plain, simple English. Keep it under 100 words. Be empathetic, educational, and practical. End with one actionable tip they can use in real life.`;

    try {
      const text = await askClaude(prompt, 500);
      setAiResponse(text);
    } catch (err) {
      console.error('AI Case Advisor error:', err);
      setAiError('Couldn\'t reach the AI Advisor right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '640px',
        margin: '0 auto', fontFamily: "'DM Sans', sans-serif",
        borderTop: `4px solid ${topColor}`,
        animation: isCorrectAnswer ? 'lexPulseGreen 0.4s ease' : 'none',
      }}>
        {/* Category pill */}
        <span style={{
          display: 'inline-block', background: '#1a3a2a', color: '#fff',
          padding: '4px 14px', borderRadius: '4px', fontSize: '0.7rem',
          fontWeight: 700, marginBottom: '14px', letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>{scenario.category}</span>

        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#475569', margin: '0 0 18px' }}>
          {scenario.situation}
        </p>
        <div style={{ fontSize: '1.4rem', fontWeight: 500, marginBottom: '24px', color: '#1a3a2a', fontFamily: "'Instrument Serif', serif" }}>
          {scenario.question}
        </div>

        {/* Options */}
        <div>
          {scenario.options.map((opt, i) => (
            <button
              key={i}
              className="lex-opt-btn"
              style={getBtnStyle(opt)}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
            >
              {getStatusText(opt)}{opt}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {selected && (
          <div style={{
            marginTop: '20px', padding: '18px', background: '#fafff5',
            borderLeft: '4px solid #a8e63d', borderRadius: '8px',
            animation: 'lexSlideDown 0.4s ease', overflow: 'hidden',
            fontFamily: "'DM Sans', sans-serif", color: '#475569', lineHeight: 1.7,
          }}>
            <strong style={{ color: isCorrectAnswer ? '#16a34a' : '#dc2626', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              {isCorrectAnswer ? 'Correct Judgement ' : 'Incorrect Judgement '}
            </strong>
            <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700 }}>Legal Reasoning: </span>
              {scenario.explanation}
            </div>
          </div>
        )}

        {/* ═══ FEATURE 1: AI Case Advisor ═══ */}
        {selected && (
          <div style={{
            marginTop: '20px', padding: '20px', background: '#fafff5',
            borderRadius: '12px', border: '1px solid #e5e7eb',
            animation: 'lexAIFadeIn 0.4s ease',
          }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: '1.05rem', color: '#1a3a2a', marginBottom: '4px',
            }}>
              🤖 AI Case Advisor
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '14px' }}>
              Ask anything about this legal situation
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                placeholder="Ask the AI lawyer..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid #d1d5db', fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#a8e63d'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                disabled={aiLoading}
              />
              <button
                onClick={handleAskAI}
                disabled={aiLoading || !aiQuestion.trim()}
                style={{
                  padding: '10px 20px', background: aiLoading ? '#86efac' : '#a8e63d',
                  color: '#0D3B2E', border: 'none', borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.85rem', cursor: aiLoading ? 'wait' : 'pointer',
                  fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap',
                  transition: 'background 0.2s, transform 0.2s',
                }}
              >
                Ask ⚖️
              </button>
            </div>

            {/* Loading state */}
            {aiLoading && (
              <div style={{
                color: '#4a9e6b', fontStyle: 'italic', fontFamily: "'Outfit'",
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ animation: 'lexAIPulse 1.2s ease-in-out infinite' }}>⚖️</span>
                Consulting the AI Advisor...
              </div>
            )}

            {/* AI Response */}
            {aiResponse && (
              <div style={{
                background: '#f0fdf4', borderLeft: '4px solid #a8e63d',
                borderRadius: '8px', padding: '16px', marginTop: '12px',
                fontFamily: "'Outfit'", fontSize: '0.95rem', lineHeight: 1.6,
                color: '#1a3a2a', animation: 'lexAIFadeIn 0.3s ease',
                whiteSpace: 'pre-wrap',
              }}>
                {aiResponse}
                <div style={{
                  marginTop: '10px', fontSize: '0.72rem', color: '#9ca3af',
                  fontStyle: 'italic',
                }}>
                  🤖 AI-Generated · For awareness only. Consult a lawyer for legal advice.
                </div>
              </div>
            )}

            {/* Error state */}
            {aiError && (
              <div style={{
                background: '#fef2f2', borderLeft: '4px solid #dc2626',
                borderRadius: '8px', padding: '12px', color: '#991b1b',
                fontSize: '0.85rem', fontFamily: "'Outfit'", marginTop: '8px',
              }}>
                ⚠️ {aiError}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
