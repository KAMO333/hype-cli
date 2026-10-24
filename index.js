#!/usr/bin/env node

import { program } from "commander";
import dotenv from "dotenv";
import clipboardy from "clipboardy";
import open from "open";
import { fileURLToPath } from "url";
import path from "path";
import { getGitDiffs } from "./git-service.js";
import { generatePost } from "./ai-service.js";

// Resolve the absolute path to the CLI's installation folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force dotenv to ONLY load the .env file located inside the hype-cli folder
dotenv.config({ path: path.join(__dirname, ".env") });

program
  .name("hype-cli")
  .description(
    "Automates LinkedIn technical posts by analyzing your local Git diffs",
  )
  .version("1.0.0");

program
  .command("generate")
  .description("Extract local Git history and generate a LinkedIn post")
  .option(
    "-d, --days <number>",
    "Number of days to look back in Git history",
    "3",
  )
  .action(async (options) => {
    console.log(`🚀 Starting Hype-CLI...`);
    console.log(`🔍 Scanning Git history for the last ${options.days} days...`);

    const diffData = await getGitDiffs(options.days);
    const aiResponse = await generatePost(diffData);

    // FIX 1: Print the post to the terminal so you can actually read it
    console.log("\n" + "=".repeat(40));
    console.log("📝 YOUR LINKEDIN POST:");
    console.log("=".repeat(40) + "\n");
    console.log(aiResponse.post_text);
    console.log("\n" + "=".repeat(40));

    // Copy to clipboard
    clipboardy.writeSync(aiResponse.post_text);
    console.log("\n✅ LinkedIn post copied to your clipboard!");

    // FIX 2: Generate the code image using Carbon
    if (aiResponse.hero_snippet) {
      console.log("📸 Opening Carbon to generate your code snippet image...");

      // Carbon uses standard URL encoding
      const encodedCode = encodeURIComponent(aiResponse.hero_snippet);

      // Pass the encoded string to Carbon (using the VSCode theme and auto-detecting language)
      const carbonUrl = `https://carbon.now.sh/?t=vscode&l=auto&code=${encodedCode}`;

      await open(carbonUrl);
    }

    console.log("🎉 Done! Hit Ctrl+V on LinkedIn.");
  });

program.parse(process.argv);
