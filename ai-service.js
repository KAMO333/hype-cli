import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

export async function generatePost(gitDiff) {
  // Read the key from the home directory config file
  const configPath = path.join(os.homedir(), ".hype-cli.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const apiKey = config.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "\n❌ GEMINI_API_KEY is missing from your config. Run 'hype-cli auth <key>' again.",
    );
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
  You are a Senior Developer Advocate following the 'Crushing Digital' strategy for developer marketing. 
  Analyze the following git diff and generate a LinkedIn post and a code snippet.
  
  Output MUST be a valid JSON object with exactly two keys:
  1. "post_text": A highly engaging LinkedIn post tailored for tech recruiters and hiring managers. Structure it exactly in this order:
      - Technical Tags: Start the post with 3 to 5 hyper-specific hashtags. Do NOT use generic tags like #coding, #developer, or #tech. Instead, look at the code snippet and hashtag the exact syntax, methods, or architectural patterns used (e.g., #AsyncAwait, #ChildProcess, #ErrorHandling, #NodeJS).
      - The Hook: A punchy opening line focused on a real-world problem or business value.
      - What I Did: Describe the feature or architecture clearly (describe what was built, not just the tools used).
      - The Evidence (Technical Details): A concise breakdown of the specific challenge and the code written to overcome it.
      - The Impact: Why this matters (e.g., performance, UX, code maintainability, or business value).
      Keep formatting clean with line breaks between each section. Write in a confident, professional tone.
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
