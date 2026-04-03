// server.js - Express server for Legal Literacy Engine feature
// Runs on port 5000 and provides in-memory state for scenarios and progress

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'users.json');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ─── AI PROVIDER CONFIG ───
const getProviders = () => ({
  OLLAMA: {
    url: "https://ollama.com/v1/chat/completions",
    model: "ministral-3:8b", // Efficient cloud model
    key: process.env.OLLAMA_API_KEY
  },
  ANTHROPIC: {
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-3-haiku-20240307",
    key: process.env.ANTHROPIC_API_KEY
  },
  OPENAI: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    key: process.env.OPENAI_API_KEY
  }
});

// Load users from disk or init empty
let users = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(users).length} users from disk.`);
  }
} catch (e) {
  console.error("Failed to load users.json:", e.message);
  users = {};
}

// Helper to save users to disk
const saveToDisk = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Failed to save users.json:", e.message);
  }
};

// Static mock categories and scenarios
let scenarios = [
  {
    id: 1,
    category: "Consumer Rights",
    situation: "You ordered a smartphone online, but received a box containing a bar of soap. The seller refuses to issue a refund, claiming you received the correct item.",
    question: "What is your best immediate legal recourse?",
    options: [
      "A. Accept the loss as terms were agreed.",
      "B. File a complaint on the National Consumer Helpline.",
      "C. Directly sue the delivery boy.",
      "D. Post strongly worded comments on their social media."
    ],
    correctOption: "B",
    explanation: "Under the Consumer Protection Act, consumers have the right to seek redressal against unfair trade practices. The National Consumer Helpline provides immediate mediation and formal grievance filing support.",
    difficulty: "beginner"
  },
  {
    id: 2,
    category: "Workplace Rights",
    situation: "You have resigned from your company serving full notice period. Your employer is now withholding your final month's salary and full & final settlement without giving any formal reason.",
    question: "What is the correct formal step to take first?",
    options: [
      "A. Send a formal legal notice demanding payment under the Payment of Wages Act.",
      "B. Steal company property equivalent to the salary amount.",
      "C. Threaten the HR manager on WhatsApp.",
      "D. Wait indefinitely for the company's grace."
    ],
    correctOption: "A",
    explanation: "Withholding wages after normal exits is illegal. A formal legal notice gives the employer a timeline to clear dues, failing which you can approach the Labour Commissioner under the Payment of Wages Act.",
    difficulty: "intermediate"
  },
  {
    id: 3,
    category: "Tenant Rights",
    situation: "Your landlord suddenly tells you to vacate the apartment within 2 days, changing the locks while you were out, even though you have a valid 11-month rent agreement and no payment defaults.",
    question: "Is the landlord's action legal?",
    options: [
      "A. Yes, since it's their property, they can do as they please.",
      "B. No, illegal eviction without a court order or proper notice is a criminal offense.",
      "C. Yes, if they reimburse your deposit immediately.",
      "D. Only if their relatives need the house urgently."
    ],
    correctOption: "B",
    explanation: "Even owners cannot evict tenants arbitrarily without due process. Changing locks and illegal eviction is punishable. You can file an FIR for trespass and illegal eviction.",
    difficulty: "intermediate"
  },
  {
    id: 4,
    category: "Right to Information",
    situation: "You noticed the road in your colony was built only last month but has completely broken down. You want to know the contractor's details and the budget allocated.",
    question: "How can you formally acquire this information?",
    options: [
      "A. Ask the local politician during a rally.",
      "B. Bribe a municipal clerk for the files.",
      "C. File an RTI (Right to Information) application.",
      "D. Guess the amount and complain in a newspaper."
    ],
    correctOption: "C",
    explanation: "The RTI Act empowers citizens to request data from public authorities. You can formally file an RTI application online or offline to retrieve copies of contracts and budgets.",
    difficulty: "beginner"
  }
];

// Helper to init user
const initUser = (userId) => {
  if (!users[userId]) {
    users[userId] = {
      totalPoints: 0,
      completedScenarios: [],
      correctAnswers: 0,
      totalAnswers: 0,
      badges: []
    };
    saveToDisk();
  }
};

// ─── SMART AI DISPATCHER ───

async function callOllama(prompt, maxTokens, config) {
  const resp = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.key}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      stream: false
    })
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`Ollama Response Error (${resp.status}):`, errorText);
    throw new Error(`Ollama Error: ${errorText}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt, maxTokens, config) {
  const resp = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`Anthropic Response Error (${resp.status}):`, errorText);
    throw new Error(`Anthropic Error: ${errorText}`);
  }
  const data = await resp.json();
  return data.content[0].text;
}

async function callOpenAI(prompt, maxTokens, config) {
  const resp = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.key}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens
    })
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`OpenAI Response Error (${resp.status}):`, errorText);
    throw new Error(`OpenAI Error: ${errorText}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

// ─── SMART AI DISPATCHER HELPER ───

async function handleAIRequest(prompt, maxTokens = 1000) {
  const PROVIDERS = getProviders();
  let result = null;
  let engine = "None";

  // 1. Try Ollama (Primary Free)
  if (PROVIDERS.OLLAMA.key) {
    try {
      result = await callOllama(prompt, maxTokens, PROVIDERS.OLLAMA);
      engine = "Ollama Cloud";
    } catch (e) { console.warn("Ollama fallback triggered:", e.message); }
  }

  // 2. Try Anthropic (Legal Premium)
  if (!result && PROVIDERS.ANTHROPIC.key) {
    try {
      result = await callAnthropic(prompt, maxTokens, PROVIDERS.ANTHROPIC);
      engine = "Anthropic Claude";
    } catch (e) { console.warn("Anthropic fallback triggered:", e.message); }
  }

  // 3. Try OpenAI (Fast Alternative)
  if (!result && PROVIDERS.OPENAI.key) {
    try {
      result = await callOpenAI(prompt, maxTokens, PROVIDERS.OPENAI);
      engine = "OpenAI GPT-4";
    } catch (e) { console.warn("Final fallback failed:", e.message); }
  }

  if (!result) throw new Error("No AI provider keys available or services down.");
  return { text: result, engine };
}

app.post('/ai/ask', async (req, res) => {
  const { prompt, maxTokens = 1000 } = req.body;
  try {
    const { text, engine } = await handleAIRequest(prompt, maxTokens);
    res.json({ content: [{ text }], engine });
  } catch (err) {
    console.error("Dispatcher Error:", err);
    res.status(500).json({ error: "Failed to communicate with AI engines." });
  }
});

app.post('/ai/generate-scenarios', async (req, res) => {
  const prompt = `Generate 3 unique legal scenarios for India. Return ONLY a valid JSON array. 
Fields: id (starting from ${scenarios.length + 1}), category, situation, question, options, correctOption, explanation, difficulty.`;

  try {
    const { text, engine } = await handleAIRequest(prompt, 2000);
    const cleaned = text.replace(/```json|```/g, "").trim();
    const newScenarios = JSON.parse(cleaned);
    scenarios = [...scenarios, ...newScenarios];
    res.json({ message: `Success. Created ${newScenarios.length} cases.`, engine, total: scenarios.length });
  } catch (err) {
    console.error("Generation Error:", err);
    res.status(500).json({ error: "Failed to generate or parse AI scenarios." });
  }
});

// ─── DATA ROUTES ───

app.get('/scenarios', (req, res) => {
  res.json(scenarios);
});

app.post('/progress', (req, res) => {
  const { userId = 'guest', scenarioId, isCorrect } = req.body;
  initUser(userId);
  const user = users[userId];

  if (!user.completedScenarios.includes(scenarioId)) {
    user.completedScenarios.push(scenarioId);
    user.totalAnswers += 1;
    if (isCorrect) {
      user.correctAnswers += 1;
      user.totalPoints += 10;
    }
    if (user.completedScenarios.length === 1 && !user.badges.includes("First Step")) {
      user.badges.push("First Step");
    }
    if (user.correctAnswers >= 5 && !user.badges.includes("Sharp Mind")) {
      user.badges.push("Sharp Mind");
    }
    if (user.completedScenarios.length >= 10 && !user.badges.includes("Legal Eagle")) {
      user.badges.push("Legal Eagle");
    }
    saveToDisk();
  }

  let level = "Beginner";
  if (user.totalPoints >= 51 && user.totalPoints <= 150) level = "Aware";
  if (user.totalPoints > 150) level = "Advanced";

  const providers = getProviders();
  const engine = providers.OLLAMA.key ? "Ollama Cloud" : (providers.OPENAI.key ? "OpenAI" : "None");

  res.json({
    totalPoints: user.totalPoints,
    level,
    badges: user.badges,
    completedScenarios: user.completedScenarios,
    accuracy: user.totalAnswers > 0 ? Math.round((user.correctAnswers / user.totalAnswers) * 100) : 0,
    totalCasesClosed: user.completedScenarios.length,
    activeEngine: engine
  });
});

app.get('/progress/:userId', (req, res) => {
  const { userId } = req.params;
  initUser(userId);
  const user = users[userId];
  let level = "Beginner";
  if (user.totalPoints >= 51 && user.totalPoints <= 150) level = "Aware";
  if (user.totalPoints > 150) level = "Advanced";

  const providers = getProviders();
  const engine = providers.OLLAMA.key ? "Ollama Cloud" : (providers.OPENAI.key ? "OpenAI" : "None");

  res.json({
    totalPoints: user.totalPoints,
    level,
    badges: user.badges,
    completedScenarios: user.completedScenarios,
    accuracy: user.totalAnswers > 0 ? Math.round((user.correctAnswers / user.totalAnswers) * 100) : 0,
    totalCasesClosed: user.completedScenarios.length,
    activeEngine: engine
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
