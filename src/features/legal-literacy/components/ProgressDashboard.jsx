// ProgressDashboard.jsx - LexArena structured profile page
// Hero greeting → compact stat row → quick actions → quick quote → badges

import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../hooks/useProgress';

const css = `
  @keyframes lexCardIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lexShine {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`;

function useCountUp(target, dur = 700) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const steps = Math.ceil(dur / 16);
    let step = 0;
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      step++;
      setVal(Math.round((step / steps) * target));
      if (step >= steps) clearInterval(ref.current);
    }, 16);
    return () => clearInterval(ref.current);
  }, [target, dur]);
  return val;
}

const LEVEL_COLORS = {
  'Beginner': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  'Aware':    { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  'Advanced': { bg: '#fefce8', text: '#ca8a04', border: '#fde68a' },
};

const BADGE_META = {
  'First Step':  { desc: 'Complete your first case',  rank: 'I',   color: '#10b981', icon: 'START' },
  'Sharp Mind':  { desc: '5 correct answers',         rank: 'II',  color: '#6366f1', icon: 'MIND' },
  'Legal Eagle': { desc: 'Ace all scenarios',          rank: 'III', color: '#f59e0b', icon: 'EAGLE' },
};
const ALL_BADGES = Object.keys(BADGE_META);

export default function ProgressDashboard({ userEmail, onGoQuiz }) {
  const { points, level, badges, accuracy, completedScenarios, loading, refetch } = useProgress(userEmail);
  const animPts = useCountUp(points);
  const animAcc = useCountUp(accuracy);

  // Ensure stats are fresh when returning to dashboard
  useEffect(() => {
    refetch();
  }, []);

  if (loading) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}>
      Loading your profile…
    </div>
  );

  const lc = LEVEL_COLORS[level] || LEVEL_COLORS['Beginner'];

  return (
    <>
      <style>{css}</style>
      <div style={{ padding: '0 20px 48px', fontFamily: "'DM Sans', sans-serif", maxWidth: '1000px', margin: '0 auto' }}>

        {/* ═══ HERO GREETING ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', marginBottom: '32px',
          paddingTop: '24px',
          animation: 'lexCardIn 0.4s ease both',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif", fontSize: '2.8rem',
              fontWeight: 500, color: '#1a3a2a', margin: '0 0 6px'
            }}>Your Battle Profile</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem', opacity: 0.8 }}>
              Track your progress. Earn your honours. Know your rights.
            </p>
          </div>
          {/* Level badge pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: lc.bg, border: `1.5px solid ${lc.border}`,
            color: lc.text, padding: '10px 24px', borderRadius: '999px',
            fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Rank: {level}
          </div>
        </div>

        {/* ═══ STAT CARDS — compact 2×2 grid ═══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px', marginBottom: '32px', alignItems: 'start',
        }}>
          <StatCard delay={0} borderColor="#a8e63d" label="Total Points"
            value={animPts} />
          <StatCard delay={80} borderColor="#f59e0b" label="Accuracy"
            value={animAcc + '%'} />
          <StatCard delay={160} borderColor="#10b981" label="Cases Closed"
            value={completedScenarios.length}
            empty={completedScenarios.length === 0 ? 'None yet' : null} />
          <StatCard delay={240} borderColor="#6366f1" label="Scenarios Seen"
            value={completedScenarios.length}
            empty={completedScenarios.length === 0 ? '—' : null} />
        </div>

        {/* ═══ QUICK ACTIONS ═══ */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a2a 0%, #2d5a42 100%)',
          borderRadius: '20px', padding: '32px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '24px', marginBottom: '32px',
          animation: 'lexCardIn 0.4s ease 300ms both',
          boxShadow: '0 12px 30px rgba(26, 58, 42, 0.15)'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ color: '#a8e63d', fontWeight: 600, fontSize: '1.5rem', marginBottom: '6px', fontFamily: "'Instrument Serif', serif" }}>
              {completedScenarios.length === 0 ? 'Ready to begin?' : 'Continue Training'}
            </div>
            <div style={{ color: 'rgba(245,240,232,0.8)', fontSize: '0.95rem', maxWidth: '480px' }}>
              {completedScenarios.length === 0 
                ? 'Enter the Arena to test your legal knowledge and earn your first badge.'
                : 'Re-enter the Arena to sharpen your legal skills and earn more points.'}
            </div>
          </div>
          <button onClick={onGoQuiz} style={{
            background: '#a8e63d', color: '#0D3B2E', padding: '14px 32px',
            borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s ease-in-out',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(168,230,61,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {completedScenarios.length === 0 ? 'Start Quiz' : 'Re-enter Arena'}
          </button>
        </div>


        {/* ═══ LEGAL OATH ═══ */}
        <div style={{
          position: 'relative', background: '#fff', borderRadius: '16px',
          padding: '32px 40px 32px 56px', marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          borderLeft: '5px solid #a8e63d',
          animation: 'lexCardIn 0.4s ease 350ms both',
        }}>
          <span style={{
            position: 'absolute', top: '12px', left: '16px',
            fontSize: '3rem', color: '#a8e63d30', fontFamily: 'Georgia, serif',
            lineHeight: 1, pointerEvents: 'none',
          }}>"</span>
          <p style={{
            fontStyle: 'italic', color: '#475569', margin: '0 0 12px',
            lineHeight: 1.7, fontSize: '1.05rem',
          }}>
            Justice cannot be for one side alone, but must be for both.
          </p>
          <div style={{
            textAlign: 'right', fontWeight: 700, fontSize: '0.85rem',
            color: '#1a3a2a', fontStyle: 'normal',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>— Eleanor Roosevelt</div>
        </div>

        {/* ═══ HONOURS ═══ */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          animation: 'lexCardIn 0.4s ease 400ms both',
        }}>
          <div style={{
            fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#94a3b8', fontWeight: 700, marginBottom: '32px', textAlign: 'center',
          }}>Courtroom Honours</div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {ALL_BADGES.map(b => {
              const has = badges.includes(b);
              const meta = BADGE_META[b];
              return (
                <div key={b} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 24px', borderRadius: '16px',
                  background: has ? `${meta.color}08` : '#fafafa',
                  border: has ? `2px solid ${meta.color}40` : '2px solid #f1f5f9',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}>
                  {/* Badge icon text */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                    background: has ? `${meta.color}20` : '#f3f4f6',
                    color: has ? meta.color : '#94a3b8',
                    border: has ? `2px solid ${meta.color}40` : '2px solid #e2e8f0',
                    marginBottom: '16px',
                    opacity: has ? 1 : 0.5,
                  }}>
                    {meta.icon}
                  </div>

                  <div style={{
                    fontWeight: 700, fontSize: '1rem',
                    color: has ? '#1a3a2a' : '#94a3b8',
                    marginBottom: '6px',
                    textAlign: 'center',
                  }}>{b}</div>
                  <div style={{
                    fontSize: '0.8rem', color: '#94a3b8',
                    textAlign: 'center', lineHeight: 1.5,
                  }}>{meta.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ PROGRESS BAR ═══ */}
        <div style={{
          marginTop: '32px', background: '#fff', borderRadius: '20px',
          padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          animation: 'lexCardIn 0.4s ease 450ms both',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a3a2a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Legal Proficiency
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {completedScenarios.length} / 4 cases
            </span>
          </div>
          <div style={{
            height: '10px', background: '#f1f5f9', borderRadius: '5px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '5px',
              background: 'linear-gradient(90deg, #a8e63d, #4a9e6b)',
              width: `${(completedScenarios.length / 4) * 100}%`,
              transition: 'width 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
            }} />
          </div>
        </div>

      </div>
    </>
  );
}

/* ── Compact Stat Card component ── */
function StatCard({ delay, borderColor, label, value, empty }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '24px',
      borderLeft: `5px solid ${borderColor}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      animation: `lexCardIn 0.4s ease ${delay}ms both`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px',
      }}>
        <span style={{
          fontSize: '0.7rem', textTransform: 'uppercase',
          letterSpacing: '0.15em', color: '#94a3b8', fontWeight: 700,
        }}>{label}</span>
      </div>
      {empty ? (
        <div style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600, fontStyle: 'italic' }}>{empty}</div>
      ) : (
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem',
          fontWeight: 500, color: '#1a3a2a', lineHeight: 1,
        }}>{value}</div>
      )}
    </div>
  );
}
