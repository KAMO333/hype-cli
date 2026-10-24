import { execSync } from "child_process";
import { select } from "@inquirer/prompts";

export async function getGitDiffs(days) {
  try {
    const localAuthor = execSync("git config user.name").toString().trim();
    console.log(`👤 Extracting commits for: ${localAuthor}\n`);

    // 1. Get a clean list of commits (Hash ||| Date ||| Message)
    const logCommand = `git log --author="${localAuthor}" --since="${days} days ago" --no-merges --format="%H|||%cd|||%s" --date=short`;

    let rawLogs;
    try {
      rawLogs = execSync(logCommand).toString().trim();
    } catch (e) {
      console.log(
        `⚠️ No commits found for ${localAuthor} in the last ${days} days.`,
      );
      process.exit(0);
    }

    if (!rawLogs) {
      console.log(
        `⚠️ No commits found for ${localAuthor} in the last ${days} days.`,
      );
      process.exit(0);
    }

    // 2. Parse the logs into an array formatted for the interactive menu
    const commits = rawLogs.split("\n").map((line) => {
      const [hash, date, message] = line.split("|||");
      return {
        name: `[${date}] ${message}`,
        value: hash,
        description: `Commit Hash: ${hash}`,
      };
    });

    // 3. Trigger the interactive terminal menu
    const selectedHash = await select({
      message: "Select the commit you want to write a post about:",
      choices: commits,
    });

    // 4. Fetch the specific diff ONLY for the chosen commit
    console.log(`\n🔍 Fetching code changes for selected commit...`);
    const diffCommand = `git show --patch ${selectedHash}`;
    const diffData = execSync(diffCommand).toString().trim();

    return diffData;
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("\n❌ CLI cancelled by user.");
      process.exit(0);
    }
    console.error("\n❌ Error reading Git history:", error.message);
    process.exit(1);
  }
}
