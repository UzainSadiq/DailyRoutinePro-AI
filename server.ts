import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes

// Weather Proxy
app.get("/api/weather", async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || "757440c426f0ab122446f245d62dda8f";

  if (!apiKey) {
    return res.status(400).json({ error: "Weather API key missing. Please add 'OPENWEATHER_API_KEY' to your environment variables." });
  }

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Weather provider error";
      try {
        const errJson = JSON.parse(errorText);
        errorMessage = errJson.message || errorMessage;
      } catch (e) {}
      console.error("OpenWeather Error:", errorText);
      return res.status(response.status).json({ error: errorMessage });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Weather Proxy Error:", error);
    res.status(500).json({ error: "Failed to connect to weather service" });
  }
});

// AI Assistant Endpoint
app.post("/api/ai/suggest", async (req, res) => {
  const { userData, recentLogs, tasks } = req.body;

  try {
    const prompt = `
      As an AI Productivity and Health Assistant, analyze the following user data and provide actionable suggestions specifically focused on improving habits and behavioral patterns.
      User Profile: ${JSON.stringify(userData)}
      Recent Health Logs (Water, Sleep, Steps): ${JSON.stringify(recentLogs)}
      Rules: 1. Provide exactly 3 suggestions. 2. Focus on health, hydration, sleep hygiene, or physical activity. 3. Format as JSON array of objects with type and content.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              content: { type: Type.STRING }
            }
          }
        }
      }
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.status === 429 || (error.message && error.message.includes("quota"))) {
      return res.status(429).json({ error: "AI quota exceeded. Please try again later." });
    }
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// AI Chatbot Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an encouraging and smart Daily Routine, Productivity, and Health coach. Answer the user's questions about optimizing physical activity, improving sleep schedules, hydration goals, maintaining consistency with daily habits, reducing procrastination, and daily routine design. Offer actionable advice, use helpful bullet points where relevant, and keep answers friendly and motivating.",
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    if (error.status === 429 || (error.message && error.message.includes("quota"))) {
      return res.status(429).json({ error: "The AI Coach is taking a short break (quota exceeded). Please try again soon." });
    }
    res.status(500).json({ error: "AI Assistant is currently unavailable." });
  }
});

async function startServer() {
  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
