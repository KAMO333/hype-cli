#!/usr/bin/env node

import { program } from "commander";
import clipboardy from "clipboardy";
import open from "open";
import fs from "fs";
import path from "path";
import os from "os";
import { getGitDiffs } from "./git-service.js";
import { generatePost, generateMultimodalPost } from "./ai-service.js";
import { captureEnvironment } from "./capture-service.js";

const configPath = path.join(os.homedir(), ".hype-cli.json");

program
  .name("hype-cli")
  .description(
    "Automates LinkedIn technical posts by analyzing your local Git diffs",
  )
  .version("1.0.0");

program
  .command("auth <key>")
  .description("Securely save your Gemini API key to your machine")
  .action((key) => {
    const config = { GEMINI_API_KEY: key };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ API Key saved successfully to ${configPath}\n`);
  });

program
  .command("generate")
  .description("Extract local Git history and generate a LinkedIn post")
  .option(
    "-d, --days <number>",
    "Number of days to look back in Git history",
    "3",
  )
  .action(async (options) => {
    if (!fs.existsSync(configPath)) {
      console.error(
        "\n❌ No API key found. Please run 'hype-cli auth <your-gemini-api-key>' first.\n",
      );
      process.exit(1);
    }

    console.log(`🚀 Starting Hype-CLI...`);
    console.log(`🔍 Scanning Git history for the last ${options.days} days...`);

    const diffData = await getGitDiffs(options.days);
    const aiResponse = await generatePost(diffData);

    console.log("\n" + "=".repeat(40));
    console.log("📝 YOUR LINKEDIN POST:");
    console.log("=".repeat(40) + "\n");
    console.log(aiResponse.post_text);
    console.log("\n" + "=".repeat(40));

    clipboardy.writeSync(aiResponse.post_text);
    console.log("\n✅ LinkedIn post copied to your clipboard!");

    if (aiResponse.hero_snippet) {
      console.log("📸 Opening Carbon to generate your code snippet image...");
      const encodedCode = encodeURIComponent(aiResponse.hero_snippet);
      const carbonUrl = `https://carbon.now.sh/?t=vscode&l=auto&code=${encodedCode}`;
      await open(carbonUrl);
    }

    console.log("🎉 Done! Hit Ctrl+V on LinkedIn.");
  });

program
  .command("capture")
  .description(
    "Capture the active screen and programmatic logs for multimodal AI analysis",
  )
  .option("-t, --terminal", "Read piped terminal output via stdin")
  .action(async (options) => {
    if (!fs.existsSync(configPath)) {
      console.error(
        "\n❌ No API key found. Please run 'hype-cli auth <your-gemini-api-key>' first.\n",
      );
      process.exit(1);
    }

    console.log(`🚀 Starting Hype-CLI Capture Engine...`);

    // 1. Capture the text AND the screenshot
    const captureData = await captureEnvironment(options);

    // 2. Send both to Gemini
    const aiResponse = await generateMultimodalPost(captureData);

    // 3. Save the raw screenshot asset locally
    const assetsDir = path.join(os.homedir(), "hype-assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir);
    }
    const imagePath = path.join(assetsDir, `hype-capture-${Date.now()}.png`);
    fs.writeFileSync(imagePath, captureData.base64Image, "base64");

    // 4. Output and Handoff
    console.log("\n" + "=".repeat(40));
    console.log("📝 YOUR LINKEDIN POST:");
    console.log("=".repeat(40) + "\n");
    console.log(aiResponse.post_text);
    console.log("\n" + "=".repeat(40));

    clipboardy.writeSync(aiResponse.post_text);
    console.log("\n✅ LinkedIn post copied to your clipboard!");
    console.log(`📸 Raw terminal screenshot saved securely to: ${imagePath}`);
    console.log("🎉 Done! Grab your image and hit Ctrl+V on LinkedIn.");
  });

program.parse(process.argv);
