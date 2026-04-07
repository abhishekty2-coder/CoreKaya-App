import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { z } from "zod";

const router = Router();

const MODEL = "gemini-2.0-flash";

async function generateText(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return response.text ?? "";
}

router.post("/ai/wellness-tip", async (req, res) => {
  try {
    const { mood, energy } = z.object({
      mood: z.string(),
      energy: z.string(),
    }).parse(req.body);

    const prompt = `You are a CoreKaya Pilates Labs wellness coach. A client reports their current mood as "${mood}" and energy level as "${energy}". Give them a short, personalized wellness tip (2-3 sentences) that is uplifting, practical, and grounded in Pilates/movement philosophy. Keep it warm and motivating. Do not use asterisks or markdown formatting.`;
    const text = await generateText(prompt);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate wellness tip" });
  }
});

router.post("/ai/ask", async (req, res) => {
  try {
    const { question } = z.object({ question: z.string() }).parse(req.body);

    const prompt = `You are the CoreKaya AI Coach — a knowledgeable, supportive Pilates and movement specialist. Answer the following question concisely and helpfully. If the question is not related to Pilates, movement, wellness, or CoreKaya equipment, gently redirect the conversation. Do not use asterisks or markdown formatting.\n\nQuestion: ${question}`;
    const text = await generateText(prompt);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

router.post("/ai/session-plan", async (req, res) => {
  try {
    const { equipment, mood, issues, customNote } = z.object({
      equipment: z.array(z.string()),
      mood: z.string(),
      issues: z.array(z.string()),
      customNote: z.string().optional(),
    }).parse(req.body);

    const equipmentList = equipment.length > 0 ? equipment.join(", ") : "mat only";
    const issuesList = issues.length > 0 ? issues.join(", ") : "none";
    const noteSection = customNote ? `\nAdditional notes from the client: ${customNote}` : "";

    const prompt = `You are a CoreKaya Pilates Labs AI instructor. Create a personalized 45-minute Pilates session plan for a client with the following profile:
- Available equipment: ${equipmentList}
- Current mood/energy: ${mood}
- Physical considerations or focus areas: ${issuesList}${noteSection}

Format the session plan clearly with:
1. Warm-up (5 minutes)
2. Main sequence (30 minutes) — list 5-7 exercises with reps/sets and brief cues
3. Cool-down (10 minutes)

Be specific, practical, and encouraging. Tailor exercises to the available equipment. Do not use asterisks or markdown bold/italic formatting — use plain text with numbered lists only.`;
    const text = await generateText(prompt);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate session plan" });
  }
});

export default router;
