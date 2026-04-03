// aiService.js — Shared AI utility for LexArena
// Centralizes all AI calls by proxying through the backend server
// This fixes CORS and API Key exposure issues

const BACKEND_AI_URL = "http://localhost:5000/ai/ask";

/**
 * Send a prompt to the backend AI proxy and return the text response.
 * @param {string} prompt - The user/system prompt to send
 * @param {number} maxTokens - Max tokens for the response (default 1000)
 * @returns {Promise<string>} The AI-generated text
 */
export async function askClaude(prompt, maxTokens = 1000) {
  const response = await fetch(BACKEND_AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      maxTokens,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errBody.error || `API error ${response.status}`);
  }

  const data = await response.json();
  // The backend returns { content: [...] } mirroring Anthropic's structure
  return data.content[0].text;
}

/**
 * Parse a JSON response from Claude, handling markdown code fences.
 */
export function parseJSONResponse(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error on content:", clean);
    throw e;
  }
}
