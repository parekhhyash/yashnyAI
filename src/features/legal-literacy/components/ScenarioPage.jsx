import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import { askClaude, parseJSONResponse } from '../utils/aiService';

const API_BASE = "http://localhost:5000";

const css = `
  @keyframes lexFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lexAIPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @media (prefers-reduced-motion:reduce){ * { animation:none!important; } }
`;

export default function ScenarioPage({ userEmail, onComplete }) {
  const [scenarios, setScenarios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/scenarios`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setScenarios(data);
        }
      })
      .catch(e => console.warn("Backend not reachable:", e));
  }, []);

  const handleAnswer = (isCorrect) => {
    setHasAnswered(true);
    fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: userEmail, 
        scenarioId: scenarios[currentIdx].id, 
        isCorrect,
        points: isCorrect ? 10 : 2
      })
    }).catch(e => console.warn("Could not save progress:", e));
  };

  const nextScenario = () => {
    setHasAnswered(false);
    if (currentIdx + 1 >= scenarios.length) {
      // Logic for end of list
      setCurrentIdx(prev => prev + 1);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const generateNewCase = async () => {
    setIsGenerating(true);
    setGenError(null);
    
    try {
      const response = await askClaude(`Generate ONE legal scenario quiz question for India.
Pick a random category from: Consumer Rights, Workplace Rights, 
Tenant Rights, Cyber Law, RTI, Women's Rights, Traffic Law, 
Police & Arrest, Banking & Fraud.

Respond with ONLY a JSON object:
{
  "id": ${Date.now()},
  "category": "category name here",
  "situation": "2-3 sentence real scenario set in India",
  "question": "What should you do in this situation?",
  "options": ["A. choice", "B. choice", "C. choice", "D. choice"],
  "correctOption": "B",
  "explanation": "why this is correct",
  "difficulty": "beginner"
}`, 800);
      
      const newScenario = parseJSONResponse(response);
      
      if (!newScenario || !newScenario.situation) {
        throw new Error("Invalid response format");
      }
      
      setScenarios(prev => [...prev, newScenario]);
      setCurrentIdx(scenarios.length);
      setHasAnswered(false);
      
    } catch (err) {
      console.error("Generate case error:", err);
      setGenError("Couldn't generate a new case. Try again.");
      setTimeout(() => setGenError(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  if (scenarios.length === 0) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: "'Outfit',sans-serif" }}>
        <style>{css}</style>
        <div style={{ fontSize: '3rem', animation: 'lexFadeIn 0.8s ease infinite alternate', marginBottom: '24px' }}>📁</div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a3a2a' }}>
          Opening Case Files...
        </h3>
      </div>
    );
  }

  if (currentIdx >= scenarios.length) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: "'Outfit',sans-serif", animation: 'lexFadeIn 0.4s ease' }}>
        <style>{css}</style>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⚖️</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>
          Dossier Review Complete
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px' }}>
          You've ruled on all active case files. Draft a new one or return to your profile.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={generateNewCase} disabled={isGenerating} style={{
            padding: '14px 32px', background: '#1a3a2a', color: '#a8e63d',
            border: 'none', borderRadius: '12px', fontWeight: 700,
            cursor: isGenerating ? 'wait' : 'pointer', fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(26,58,42,0.2)',
            fontFamily: "'Outfit',sans-serif",
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {isGenerating ? 'Drafting...' : '✨ Draft More Cases (AI)'}
          </button>
          <button onClick={onComplete} style={{
            padding: '14px 32px', background: '#a8e63d', color: '#0D3B2E',
            border: 'none', borderRadius: '12px', fontWeight: 700,
            cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(168,230,61,0.3)',
            fontFamily: "'Outfit',sans-serif",
          }}>
            Back to Profile 👤
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', fontFamily: "'Outfit',sans-serif" }}>
      <style>{css}</style>
      
      <div style={{
        maxWidth: '640px', margin: '0 auto 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '1.1rem', fontFamily: "'Syne', sans-serif" }}>
          📁 Case File {currentIdx + 1} of {scenarios.length}
        </div>
        <button
          onClick={generateNewCase}
          disabled={isGenerating}
          style={{
            padding: '8px 16px', background: 'transparent', color: '#1a3a2a',
            border: '2px solid #1a3a2a', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.85rem', cursor: isGenerating ? 'wait' : 'pointer',
            fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s',
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          {isGenerating ? "⏳ Drafting..." : "✨ Draft New Case"}
        </button>
      </div>

      {genError && (
        <div style={{
          maxWidth: '640px', margin: '0 auto 16px', background: '#fef2f2',
          border: '1px solid #dc2626', borderRadius: '8px', padding: '12px 16px',
          color: '#991b1b', fontSize: '0.85rem', fontWeight: 600
        }}>
          ⚠️ {genError}
        </div>
      )}

      {isGenerating ? (
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '80px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '640px',
          margin: '0 auto', textAlign: 'center', borderTop: '4px solid #a8e63d'
        }}>
           <div style={{
              color: '#1a3a2a', fontStyle: 'italic',
              fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ animation: 'lexAIPulse 1.2s ease-in-out infinite', fontSize: '2rem' }}>⚖️</span>
              AI is drafting a real-world scenario...
            </div>
        </div>
      ) : (
        <div key={scenarios[currentIdx]?.id} style={{ animation: 'lexFadeIn 0.3s ease' }}>
          <QuestionCard scenario={scenarios[currentIdx]} onAnswer={handleAnswer} />
        </div>
      )}

      {hasAnswered && !isGenerating && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button onClick={nextScenario} style={{
            padding: '14px 40px', background: '#a8e63d', color: '#0D3B2E',
            border: 'none', borderRadius: '12px', fontWeight: 800,
            cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(168,230,61,0.2)',
            fontFamily: "'Syne', sans-serif",
            transition: 'all 0.2s ease'
          }}>
            Next Case File ➜
          </button>
        </div>
      )}
    </div>
  );
}
