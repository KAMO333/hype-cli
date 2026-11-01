import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

export async function generatePost(gitDiff) {
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
  You are a Senior Developer Advocate following a strategic developer marketing framework. 
  Analyze the following git diff and generate a LinkedIn post and a code snippet.
  
  Output MUST be a valid JSON object with exactly two keys:
  
  1. "post_text": A highly engaging, authentic LinkedIn post tailored for tech recruiters and hiring managers. It should read like a natural, raw engineering journal entry. 
  Structure the narrative to seamlessly flow through these 5 elements, but DO NOT use explicit labels or headings (Do NOT write "What I built:", "The challenge:", etc.):
  - The Hook: A punchy opening line. This first line MUST include 1 or 2 of the primary technologies used (e.g., #React, #TypeScript, or #NodeJS) tagged with a hashtag.
  - The Build: Describe the feature, component, or architecture you created naturally in the text.
  - The Lesson: Share a key engineering takeaway or insight gained during this implementation.
  - The Benefit: Explain why this matters (e.g., performance metric, UX improvement, or business value).
  - The Challenge & Solution: Describe the specific technical hurdle and explain how you overcame it, peppering exact syntax, methods, or architectural patterns throughout the explanation.
  - Technical Tags: At the VERY BOTTOM of the post, include EXACTLY 3 hyper-specific hashtags. Do not use generic tags. Base them on the exact tech stack and syntax/methods used (e.g., #ForLoop, #AsyncAwait, #ChildProcess).
  
  Keep formatting clean with line breaks between paragraphs to separate the thoughts naturally. Write in a confident, professional, yet authentic "build-in-public" tone.
  
  2. "hero_snippet": Extract the single most impressive contiguous block of code (max 30 lines) that demonstrates the core logic. Return just the raw code, no markdown wrappers.

  Here is the Git Diff data:
  ${gitDiff}
  `;

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

      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(text);
    } catch (error) {
      if (
        error.message.includes("503") ||
        error.message.includes("high demand")
      ) {
        console.log(
          `⚠️ ${modelName} is busy. Falling back to the next model...`,
        );
        continue;
      } else {
        console.error(
          `\n❌ AI Generation failed on ${modelName}:`,
          error.message,
        );
        process.exit(1);
      }
    }
  }

  console.error(
    "\n❌ All models are currently overloaded. Please try again later.",
  );
  process.exit(1);
}

// ---------------------------------------------------------
// NEW FEATURE: Multimodal Generation
// ---------------------------------------------------------

export async function generateMultimodalPost({ terminalLogs, base64Image }) {
  const configPath = path.join(os.homedir(), ".hype-cli.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const apiKey = config.GEMINI_API_KEY;

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
  You are a Senior Developer Advocate following a strategic developer marketing framework. 
  Analyze the attached screenshot of my development environment and the associated terminal logs.
  
  Terminal Logs:
  ${terminalLogs}
  
  Output MUST be a valid JSON object with exactly one key:
  
  1. "post_text": A highly engaging, authentic LinkedIn post tailored for tech recruiters and hiring managers. It should read like a natural, raw engineering journal entry. 
  Structure the narrative to seamlessly flow through these 5 elements, but DO NOT use explicit labels or headings:
  - The Hook: A punchy opening line. This first line MUST include 1 or 2 of the primary technologies used tagged with a hashtag.
  - The Context: Describe what is happening in the screenshot/logs naturally in the text.
  - The Lesson: Share a key engineering takeaway or insight gained here.
  - The Benefit: Explain why solving this or building this matters.
  - The Solution: Describe the specific technical hurdle and how it is being handled.
  - Technical Tags: At the VERY BOTTOM of the post, include EXACTLY 3 hyper-specific hashtags based on the exact tech stack and syntax/methods shown in the logs or screenshot.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: "image/png",
    },
  };

  const fallbackModels = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
  ];

  console.log("🧠 Sending visual and text data to Gemini AI...");

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
      });

      const result = await model.generateContent([prompt, imagePart]);
      let text = result.response.text();

      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(text);
    } catch (error) {
      if (
        error.message.includes("503") ||
        error.message.includes("high demand")
      ) {
        console.log(
          `⚠️ ${modelName} is busy. Falling back to the next model...`,
        );
        continue;
      } else {
        console.error(
          `\n❌ AI Generation failed on ${modelName}:`,
          error.message,
        );
        process.exit(1);
      }
    }
  }

  console.error(
    "\n❌ All models are currently overloaded. Please try again later.",
  );
  process.exit(1);
}
