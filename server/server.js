import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { brandStyleGuide } from "./data/styleGuide.js";
import { trendBriefs } from "./data/trends.js";



dotenv.config();

const app = express();  //create a service
const PORT = 5001;

app.use(cors());
app.use(express.json());

const client = new OpenAI({  //connection to AI
    apiKey: process.env.OPENAI_API_KEY,
});

const industryStyles = {
    "B2B SaaS": "Focus on efficiency, scalability, and business impact. Use clear, structured thinking.",
    "Investment Banking": "Use analytical, strategic, and data-driven language. Sound precise and high-level.",
    "Computer Science": "Use practical, technical, builder-focused language. Focus on how things work.",
    "Healthcare": "Focus on outcomes, patient impact, and operational efficiency.",
    "Marketing": "Use engaging, persuasive language. Focus on growth and user behavior."
};

const postAngles = [
    "strategic insight",
    "operational lesson",
    "contrarian observation"
];

app.get("/", (req, res) => {  //test route
    res.send("Server is running");
});

app.post("/generate-post", async (req, res) => {
    try {
        const { industry, topic, tone, audience } = req.body;
        const style = industryStyles[industry] || "Use a professional and practical tone.";
        const trends = trendBriefs[industry] || [];
        const finalPosts = [];

        for (const angle of postAngles) {
            const prompt = `
You are writing a high-quality LinkedIn post for a professional B2B audience.

Style guide:
${brandStyleGuide}

Relevant trends:
- ${trends.join("\n- ")}

Write a LinkedIn post for the ${industry} industry about ${topic}.
Target audience: ${audience || "business professionals"}.
Tone: ${tone || "thoughtful and practical"}.

Industry style:
${style}

Post angle:
${angle}

Requirements:
- sound thoughtful, sharp, and professional
- avoid robotic, generic, or overly motivational language
- avoid clichés like "game-changer", "revolutionary", "in today's fast-paced world"
- start with a strong hook
- focus on one clear insight
- include one practical takeaway
- keep it easy to read
- use short paragraphs
- end with a natural closing line, not a fake inspirational ending

Structure:
1. Hook
2. Main insight
3. Practical takeaway
4. Closing thought

The post should feel like it was written by a smart professional, not by AI.
`;

            const response = await client.responses.create({
                model: "gpt-4o-mini",
                input: prompt,
            });

            const initialPost = response.output_text;

            const improvePrompt = `
Improve the following LinkedIn post.

Make it:
- more natural and human
- less robotic
- more specific and sharp
- more engaging but not cheesy
- concise and easy to read
- faithful to the original meaning

Post:
${initialPost}
`;

            const improvedResponse = await client.responses.create({
                model: "gpt-4o-mini",
                input: improvePrompt,
            });

            const finalPost = improvedResponse.output_text;

            finalPosts.push(finalPost || initialPost || "No response generated");
        }

        res.json({ posts: finalPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate posts" });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});