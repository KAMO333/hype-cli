import dotenv from "dotenv";
dotenv.config();

async function checkModels() {
  console.log("🔍 Querying Google's servers for your available models...\n");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();

    // Filter for models that actually support text generation
    const generateModels = data.models.filter(
      (m) =>
        m.supportedGenerationMethods.includes("generateContent") &&
        m.name.includes("gemini"),
    );

    console.log("✅ YOU CAN USE THESE EXACT STRINGS:");
    console.log("-----------------------------------");
    generateModels.forEach((m) => console.log(m.name.replace("models/", "")));
    console.log("-----------------------------------\n");
  } catch (error) {
    console.error("❌ Failed to fetch:", error.message);
  }
}

checkModels();
