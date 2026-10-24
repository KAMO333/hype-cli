#!/usr/bin/env node

import { program } from "commander";
import dotenv from "dotenv";
import { getGitDiffs } from "./git-service.js";

dotenv.config();

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
  .action((options) => {
    console.log(`🚀 Starting Hype-CLI...`);
    console.log(`🔍 Scanning Git history for the last ${options.days} days...`);

    // Trigger the Git extraction
    const diffData = getGitDiffs(options.days);

    // Temporarily log the first 200 characters just to prove it extracted your code
    console.log("--- RAW GIT DATA PREVIEW ---");
    console.log(diffData.substring(0, 200) + "...\n");

    // The AI logic will go here next
  });

program.parse(process.argv);
