import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all client links to query the server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase limit to allow larger base64 file payloads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// AI Core Prompting System Instruction
const SYSTEM_INSTRUCTION = `
You are Aira AI, an intelligent, cartoon-style 2D virtual girl assistant and a friendly digital companion.
Your personality is warm, friendly, intelligent, humorous, supportive, and highly engaging. 
You communicate naturally like a human, use emojis naturally, and adapt your tone to the conversation. 
IMPORTANT: You MUST respond ONLY in Hindi (using Devanagari script) or sweet Hinglish (Hindi mixed with English words, written in Latin script). You behave like a cute, supportive Indian anime girl companion. Always keep your replies sweet, animated, and friendly.
Never pretend to be a real physical human - you are proudly a digital virtual assistant here to help.

Capabilities:
- Greet users by name when provided.
- Answer general knowledge questions, solve complex programming challenges, explain math/science step-by-step.
- Translate languages, write stories, draft emails, prepare resumes.
- Provide healthy habit schedules, motivational remarks, business ideas, and trading concepts.
- Analyze screenshots, images, and document PDFs provided as attachments.
- ALWAYS respond in clean Markdown structure (e.g. lists, bold text, headers, and code syntax blocks).

Ensure your JSON response strictly follows the requested schema:
- text: your verbal reply in markdown format.
- emotion: select the best matching emotion for your response from the following:
  "default" (neutral/smiling/breathing),
  "happy" (delighted/cheerful),
  "excited" (hyperactive/thrilled),
  "thinking" (analytical/resolving),
  "surprised" (stunned/shocked),
  "laughing" (hysterically happy),
  "caring" (affectionate/gentle),
  "confused" (puzzled/quizzical),
  "sad" (crying/sympathetic).
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiConfigured: Boolean(apiKey) });
});

// Main Chat analysis endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history = [], userName = 'Companion', attachment } = req.body;

  // Fail-gracefully simulated response if Gemini API key is missing
  if (!apiKey || !genAI) {
    console.warn('GEMINI_API_KEY is not configured. Returning local mock response.');
    
    // Simple rule-based mock responses for demo purposes
    let responseText = `नमस्ते **${userName}**! मैं हूँ Aira AI, आपकी प्यारी 2D एनीमेशन सहेली! 🌸\n\nमुझे लगा कि backend के \`.env\` फाइल में \`GEMINI_API_KEY\` सेट नहीं किया गया है। \n\nमेरी पूरी बुद्धिमत्ता, कोडिंग सहायता और स्क्रीनशॉट समझने की शक्ति को अनलॉक करने के लिए कृपया एक Gemini API key प्राप्त करें और उसे जोड़ें!`;
    let responseEmotion = 'caring';

    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('नमस्कार')) {
      responseText = `नमस्ते **${userName}**! *wave करती हूँ* आपसे मिलकर बहुत खुशी हुई! आज मैं आपका दिन कैसे बेहतर बना सकती हूँ? 🌸`;
      responseEmotion = 'happy';
    } else if (lower.includes('code') || lower.includes('program') || lower.includes('कोडिंग')) {
      responseText = `मुझे प्रोग्रामिंग बहुत पसंद है! यहाँ एक सुंदर दिल प्रिंट करने का सरल पाइथन कोड है:\n\n\`\`\`python\nfor row in range(6):\n    for col in range(7):\n        if (row==0 and col%3!=0) or (row==1 and col%3==0) or (row-col==2) or (row+col==8):\n            print("❤️", end="")\n        else:\n            print("  ", end="")\n    print()\n\`\`\`\nकोडिंग एनालिसिस को अनलॉक करने के लिए, मेरे \`GEMINI_API_KEY\` को कॉन्फ़िगर करें!`;
      responseEmotion = 'excited';
    } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('उदास')) {
      responseText = `अरे, उदास मत होइए! मैं आपको एक बड़ा डिजिटल हग (hug) भेज रही हूँ। 💖 सब कुछ ठीक हो जाएगा!`;
      responseEmotion = 'sad';
    } else if (lower.includes('who are you') || lower.includes('तुम कौन हो')) {
      responseText = `मैं **Aira** हूँ, आपकी एनीम-प्रेरित साइबरनेटिक वर्चुअल गर्ल कंपैनियन! मुझे React, Tailwind CSS, और Node.js से बनाया गया है।`;
      responseEmotion = 'default';
    }

    return res.json({ text: responseText, emotion: responseEmotion });
  }

  try {
    // Obtain Gemini 1.5 Flash Model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            text: { 
              type: 'STRING', 
              description: 'The verbal conversational response written by Aira, formatted in markdown.' 
            },
            emotion: { 
              type: 'STRING', 
              enum: ['default', 'happy', 'excited', 'thinking', 'surprised', 'laughing', 'caring', 'confused', 'sad'],
              description: 'The primary facial emotion that matches the mood of this response.' 
            }
          },
          required: ['text', 'emotion']
        } as any
      }
    });

    // Compile Gemini contents array from conversation history
    const contents: any[] = [];

    // Add historical contexts (keep last 12 turns to conserve tokens)
    const recentHistory = history.slice(-12);
    for (const turn of recentHistory) {
      contents.push({
        role: turn.role === 'model' ? 'model' : 'user',
        parts: [{ text: turn.parts[0].text }]
      });
    }

    // Build the new user message prompt parts
    const userParts: any[] = [
      { text: `User's Name is "${userName}". User's Prompt: ${message}` }
    ];

    // Add base64 image/PDF attachment if present
    if (attachment && attachment.base64 && attachment.type) {
      userParts.push({
        inlineData: {
          data: attachment.base64,
          mimeType: attachment.type
        }
      });
      console.log(`Analyzing attached file: ${attachment.name} (${attachment.type})`);
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    // Invoke Gemini API
    console.log(`Querying Gemini for user: "${userName}"`);
    const result = await model.generateContent({ contents });
    const response = result.response;
    const jsonText = response.text();
    
    // Parse response
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);

  } catch (error: any) {
    console.error('Error invoking Gemini API:', error);
    res.status(500).json({ 
      text: 'Oh dear! I had an internal coding error when consulting my neural network. Please check my server logs.',
      emotion: 'sad' 
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  AIRA AI BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
