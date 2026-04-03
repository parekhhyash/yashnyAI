// useProgress.js - Custom React Hook for managing user integration with backend
// Fetches local user data and provides utility function for POSTs

import { useState, useEffect } from 'react';

const API_BASE = "http://localhost:5001";

export const useProgress = (userId = 'guest') => {
  const [data, setData] = useState({
    points: 0,
    level: "Beginner",
    badges: [],
    accuracy: 0,
    completedScenarios: []
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/progress/${userId}`);
      if (!resp.ok) throw new Error("Failed to fetch");
      const result = await resp.json();
      setData({
        points: result.totalPoints,
        level: result.level,
        badges: result.badges,
        accuracy: result.accuracy,
        completedScenarios: result.completedScenarios
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const updateProgress = async (scenarioId, isCorrect) => {
    try {
      await fetch(`${API_BASE}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, scenarioId, isCorrect })
      });
      fetchProgress(); // Reload local state
    } catch (e) {
      console.error("Failed to update progress:", e);
    }
  };

  return { ...data, loading, updateProgress, refetch: fetchProgress };
};
