#!/usr/bin/env node

import { program } from "commander";
import dotenv from "dotenv";

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

    // Git extraction and AI logic goes here
  });

program.parse(process.argv);
