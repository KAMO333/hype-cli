import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePost(gitDiff) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "\n❌ GEMINI_API_KEY is missing. Please add it to your .env file.",
    );
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
  You are a Senior Developer Advocate. Analyze the following git diff and generate a LinkedIn post and a code snippet.
  
  Output MUST be a valid JSON object with exactly two keys:
  1. "post_text": A highly engaging, professional LinkedIn post. Structure it exactly like this:
      - A hook about the overarching problem or context.
      - The Problem.
      - The Solution.
      - The technical challenge faced.
      - The Fix.
      - "What I learned:" takeaway.
      Do NOT use cringe hashtags. Use a confident, analytical tone.
  2. "hero_snippet": Extract the single most impressive contiguous block of code (max 30 lines) that demonstrates the core logic. Return just the raw code, no markdown wrappers.

  Here is the Git Diff data:
  ${gitDiff}
  `;

  // The Fallback Array: If one is busy, instantly try the next
  const fallbackModels = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
  ];

  console.log("🧠 Sending code to Gemini AI for analysis...");

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // Strip markdown just in case
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(text);
    } catch (error) {
      // If it's a 503 overload, log a warning and let the loop try the next model
      if (
        error.message.includes("503") ||
        error.message.includes("high demand")
      ) {
        console.log(
          `⚠️ ${modelName} is busy. Falling back to the next model...`,
        );
        continue;
      } else {
        // If it's a real error (like a bad API key), crash immediately
        console.error(
          `\n❌ AI Generation failed on ${modelName}:`,
          error.message,
        );
        process.exit(1);
      }
    }
  }

  // If it loops through every model and they all fail
  console.error(
    "\n❌ All models are currently overloaded. Please try again later.",
  );
  process.exit(1);
}
