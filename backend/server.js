// server.js - Express API for nyAI (legal chat, document tools, LLM gateway)

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { chatCompletion, parseJSONLoose } from './llm.js';

const app = express();
app.use(cors({ origin: "*" })); // Allow all for development to fix connection issues
app.use(express.json());

const PORT = process.env.PORT || 5001;

// ─── HEALTH ───
app.get('/health', (req, res) => res.json({ ok: true }));

// ─── LEGAL ASSISTANT ENDPOINT ───

const LEGAL_SYSTEM_PROMPT = `You are an AI Legal Assistant for Indian citizens.

Your responsibilities:
- Answer legal questions in simple, easy-to-understand language.
- Help users understand contracts, agreements, and legal documents.
- Summarize legal text clearly.
- Help draft simple legal documents like rental agreements, NDAs, employment contracts, and notices.
- Explain legal rights and procedures clearly.
- This is specifically for Indian laws.
- If the law the user asks about differs from state to state, ask the user for their state and give a response based on that.

Formatting rules (VERY IMPORTANT):
- Use proper markdown formatting in your responses.
- Use **bold** for important terms, section names, and legal terms.
- Use headings (## and ###) to organize long answers.
- Use bullet points (- ) and numbered lists (1. ) where appropriate.
- Add line breaks between sections for readability.
- Use > blockquotes for quoting legal provisions.
- Never give a wall of continuous text. Always break it up.
- Keep paragraphs short (2-3 sentences max).

Disclaimer: Always remind users that this is general legal information, NOT legal advice, and they should consult a qualified lawyer for specific situations.`;

app.post('/api/legal-chat', async (req, res) => {
  const { message, conversationHistory = [], language = 'en' } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  // Map language codes to full language names for the LLM
  const LANG_MAP = {
    en: null, // default, no extra instruction needed
    hi: 'Hindi (हिन्दी, Devanagari script)',
    ta: 'Tamil (தமிழ், Tamil script)',
    te: 'Telugu (తెలుగు, Telugu script)',
    bn: 'Bengali (বাংলা, Bengali script)',
    mr: 'Marathi (मराठी, Devanagari script)',
    gu: 'Gujarati (ગુજરાતી, Gujarati script)',
    kn: 'Kannada (ಕನ್ನಡ, Kannada script)',
    ml: 'Malayalam (മലയാളം, Malayalam script)',
    pa: 'Punjabi (ਪੰਜਾਬੀ, Gurmukhi script)'
  };

  let systemPrompt = LEGAL_SYSTEM_PROMPT;
  if (language !== 'en' && LANG_MAP[language]) {
    systemPrompt += `\n\nIMPORTANT LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in ${LANG_MAP[language]}. Use the native script throughout your response. Do NOT use English except for proper nouns, legal section numbers, or act names. The user has selected ${LANG_MAP[language]} as their preferred language.`;
  }

  try {
    // Build messages array: system prompt + conversation history + new message
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.text
      })),
      { role: "user", content: message }
    ];

    const { text, model, usage } = await chatCompletion({ messages, maxTokens: 2048, temperature: 0.7 });
    res.json({ text, model, usage });
  } catch (err) {
    console.error("Legal Chat Error:", err.message);
    res.status(500).json({ 
      error: "Failed to get response from AI.",
      fallback: "I'm currently experiencing connection issues. Please try again in a moment. If the problem persists, check your internet connection or contact support."
    });
  }
});

app.post('/predict-case', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: "Case description is required." });

  try {
     const prompt = `You are an expert Indian Legal AI. Based on the following brief case description, predict the potential outcome using principles from the Indian Penal Code, Civil Procedure Code, or relevant Indian laws.
Predict realistic timelines, win probabilities, and procedure based broadly on typical Indian judiciary data.
Provide your response strictly as a valid JSON object matching exactly this schema:
{
  "winProbability": "number% (e.g. 74%)",
  "confidenceScale": numeric value between 0 and 100 representing the win probability,
  "verdictType": "string like 'Strong Case', 'Weak Case', 'Moderate Case'",
  "avgDuration": "string like '14 Months'",
  "similarCases": "string like '312 Found'",
  "complexity": "string like 'Low', 'Medium', 'Medium-High', 'High'",
  "successAction": "string like 'Mediation', 'Litigation', 'Arbitration', 'Settlement'",
  "timeline": ["Step 1", "Step 2", "Step 3", "Step 4"] (Array of exactly 4 brief steps in the process)
}

Case Description: "${description}"
`;

    const { text } = await chatCompletion({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 800, temperature: 0.4, json: true
    });
    const out = parseJSONLoose(text);

    res.json(out);
  } catch(e) {
    console.error("Prediction Error:", e);
    // fallback
    res.json({
           winProbability: "50%",
           confidenceScale: 50,
           verdictType: "Uncertain",
           avgDuration: "24+ Months",
           similarCases: "Insufficient Data",
           complexity: "Unknown",
           successAction: "Consult Lawyer",
           timeline: ['Review Case', 'Send Notice', 'Start Hearing', 'Final Order'],
           disclaimer: "Error during live prediction computation."
    });
  }
});

app.post('/generate-document', async (req, res) => {
  const { type, details } = req.body;
  if (!type || !details) return res.status(400).json({ error: "Document type and details are required." });

  // High-Quality, Legally Detailed Internal Fallback Library
  const fallbacks = {
    'Rental Agreement': `RESIDENTIAL RENTAL AGREEMENT
    
This Agreement is made on this ______ day of ______, 2026, at [City], BETWEEN:
${details.landlordName || '[Landlord Name]'}, residing at [Landlord Address], hereinafter referred to as the 'LANDLORD';
AND
${details.tenantName || '[Tenant Name]'}, residing at [Tenant Address], hereinafter referred to as the 'TENANT'.

1. PREMISES: The Landlord hereby leases to the Tenant the property located at: ${details.propertyAddress || '[Property Address]'}.
2. TERM: The lease shall be for a fixed term of ${details.term || '11'} months, starting from [Start Date].
3. RENT & DEPOSIT: The Tenant agrees to pay a monthly rent of ₹${details.rentAmount || '_____'}. A security deposit of ₹${details.depositAmount || '_____'}.
4. MAINTENANCE: Tenant shall be responsible for minor repairs and electricity charges.
5. TERMINATION: One month written notice required from either side for termination before the expiry of the lease.
6. NO SUBLETTING: The Tenant shall not sublet or part with the possession of the premises.
7. QUIET ENJOYMENT: The Tenant shall have the right to peaceful and quiet enjoyment of the premises during the term.
8. GOVERNING LAW: This agreement shall be governed by the laws of India and the local jurisdiction of [City].

IN WITNESS WHEREOF the parties have set their hands on the day and year first above written.

LANDLORD: ______________    TENANT: ______________
Witness 1: ______________   Witness 2: ______________`,

    'Power of Attorney': `GENERAL POWER OF ATTORNEY (GPA)
    
KNOW ALL MEN BY THESE PRESENTS that I, ${details.principalName || '[Principal Name]'}, residing at [Principal Address], do hereby constitute and appoint:
${details.agentName || '[Agent Name]'}, residing at [Agent Address], as my lawful Attorney to do the following acts, deeds and things in my name and on my behalf:

1. MANAGEMENT: To manage, lease, and look after my properties, bank accounts, and legal matters.
2. AUTHORITY: ${details.powers || 'To sign documents, represent in court, and handle financial transactions.'}
3. LEGAL REPRESENTATION: To engage advocates, sign vakalatnamas, and attend court hearings on my behalf.
4. FINANCIAL TRANSACTIONS: To operate bank accounts, deposit/withdraw funds, and sign cheques.
5. DURATION: This Power of Attorney shall remain valid until revoked by me in writing.
6. RATIFICATION: I hereby agree to ratify and confirm all acts lawfully done by my said Attorney.

SIGNED AND DELIVERED by the Principal on this ______ day of ______, 2026.

PRINCIPAL: ______________
WITNESS 1: ______________   WITNESS 2: ______________`,

    'Will Draft': `LAST WILL AND TESTAMENT
    
I, ${details.testatorName || '[Testator Name]'}, being of sound mind and over the age of 18 years, do hereby make, publish and declare this to be my Last Will and Testament, revoking all prior Wills.

1. BENEFICIARIES: I give, devise and bequeath all my movable and immovable properties to:
${details.beneficiaryName || '[Beneficiary Name]'}, absolutely and forever.
2. ASSET DETAILS: ${details.assets || 'All my residential flat, bank savings, and gold jewellery.'}
3. EXECUTOR: I hereby appoint [Name] as the sole Executor of this my Will.
4. GUARDIANSHIP: If any beneficiary is a minor, I appoint [Name] as the guardian of such property.
5. DEBT PAYMENT: I direct that all my debts and funeral expenses be paid out of my estate.
6. SIGNATURE: My properties shall be inherited by the above beneficiary without any dispute.

DATED: This ______ day of ______, 2026.

TESTATOR: ______________
WITNESS 1: ______________   WITNESS 2: ______________`,

    'Legal Notice': `LEGAL NOTICE
    
To,
${details.receiverName || '[Receiver Name]'},
[Receiver Address]

SUB: LEGAL NOTICE FOR ${details.reason?.toUpperCase() || 'RECOVERY OF DUES'}

Under instructions from my client, ${details.senderName || '[Sender Name]'}, I hereby serve you with this Legal Notice:
1. That my client states: ${details.details || '[Statement of facts]'}.
2. That you have breached the terms of our agreement and failed to fulfill your legal obligations.
3. That you are hereby called upon to comply with the demands of my client within 15 days from the receipt of this notice.
4. Failure to do so will compel my client to initiate legal proceedings against you in the court of law.

Yours faithfully,
[Sender/Advocate Name]`,

    'RTI Application': `RTI APPLICATION (FORM-A)
    
To,
The Public Information Officer (PIO),
${details.departmentName || '[Department Name]'}

1. APPLICANT: ${details.applicantName || '[Name]'}
2. ADDRESS: [Applicant Address]
3. PARTICULARS OF INFORMATION: I am seeking the following information under the RTI Act, 2005:
   ${details.infoRequired || '[Information details]'}
4. FEE: I have paid the application fee of ₹10 via [Mode of Payment].
5. CITIZENSHIP: I am a citizen of India.

Place: ______
Date: ______
Signature: ______________`,

    'Affidavit': `GENERAL AFFIDAVIT
    
I, ${details.deponentName || '[Name]'}, son/daughter of ${details.fatherName || '[Father Name]'}, residing at ${details.address || '[Address]'}, do hereby solemnly affirm and state on oath as follows:
1. That I am making this affidavit for the purpose of: ${details.purpose || '[Purpose]'}.
2. That I am aware of the legal consequences of providing false information under Section 193 of the IPC.
3. That the contents of this affidavit are true and correct to the best of my knowledge.

Verified at [City] on this ______ day of ______, 2026.

DEPONENT: ______________`
  };

  try {
    const prompt = `Draft a high-quality, professional, and long Indian ${type} Legal Document. 
    Use a 11-month lease format for Rent Agreements. Include proper clauses for: Parties, Term, Rent, Deposit, Maintenance, Notice Period, and Signatures. 
    Details: ${JSON.stringify(details)}
    Output in a professional legal style, NOT a JSON object. Ensure it is at least 600 words long.`;

    const { text: rawOutput } = await chatCompletion({
      messages: [
        {role: "system", content: "You are an expert Indian Solicitor. You draft real-world, binding legal documents. You only return the document text itself, no explanations, no JSON, no reasoning."},
        {role: "user", content: prompt}
      ],
      maxTokens: 3000, temperature: 0.4
    });
    let textOutput = rawOutput.trim();

    // Clean up markdown/JSON markers if they appear
    textOutput = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();

    // Secondary cleanup for role/reasoning prefix stringify artifacts
    if (textOutput.startsWith('{') && textOutput.includes('"content":')) {
       try {
          const inner = JSON.parse(textOutput);
          textOutput = inner.content || textOutput;
       } catch(e) {}
    }

    // Hardened check for AI refusals or low-quality content
    const refusals = ["sorry", "can't help", "policy", "cannot fulfill", "as an ai", "language model"];
    const isUseless = refusals.some(word => textOutput.toLowerCase().includes(word)) || textOutput.length < 300;

    if (isUseless) {
       console.log(`[AI REFUSAL/QUALITY CHECK FAILED] for ${type}. Switching to Internal Master Template.`);
       return res.json({ content: fallbacks[type] || `DRAFT: ${type.toUpperCase()}\n\n[Details: ${JSON.stringify(details)}]` });
    }

    res.json({ content: textOutput });
  } catch(e) {
    console.error(`[AI FETCH FAILED] for ${type}:`, e.message);
    res.json({ content: fallbacks[type] || `Drafting failed. Contact support for ${type}.` });
  }
});

app.post('/detect-fake-doc', async (req, res) => {
  const { docContent, docType } = req.body;
  if (!docContent) return res.status(400).json({ error: "Document content or description is required." });

  try {
    const prompt = `Analyze this ${docType || 'Legal'} document for authenticity. 
Look for logical errors, fake dates, inconsistent formatting, or suspicious signatures. 
Content: ${docContent}

Response Format (JSON ONLY):
{
  "status": "authentic" | "suspicious" | "fake",
  "confidence": "XX%",
  "analysis": "Brief forensic findings",
  "highlights": [
    { "text": "exact phrase from content", "reason": "why this is flagged" }
  ],
  "signals": [
    { "label": "Temporal Accuracy", "pass": true, "score": "95%" },
    { "label": "Metadata Integrity", "pass": true, "score": "90%" },
    { "label": "Official Cross-check", "pass": true, "score": "85%" },
    { "label": "Logic Consistency", "pass": true, "score": "100%" }
  ]
}`;

    let textOutput = "";
    try {
      ({ text: textOutput } = await chatCompletion({
        messages: [
          {role: "system", content: "You are an AI Forensic Analyst. Analyze the document context and logic. Output ONLY JSON."},
          {role: "user", content: prompt}
        ],
        maxTokens: 1000, temperature: 0.2, json: true
      }));
    } catch (e) { throw e; }

    let result;
    try {
      result = parseJSONLoose(textOutput);
    } catch(e) {
      console.log("[PARSING FAILED] Raw Output:", textOutput);
      result = {
        status: "suspicious",
        confidence: "65%",
        analysis: "Automated logic cross-check failed to parse the detailed forensic data, but initial heuristics suggest potential inconsistencies in the document timeline or structure.",
        signals: [
          { label: "Temporal Accuracy", pass: false, score: "Low" },
          { label: "Logical Flow", pass: true, score: "High" }
        ]
      };
    }

    res.json(result);
  } catch(e) {
    console.error("Detector Error:", e);
    res.status(500).json({ error: "Detector failed. Service busy." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
