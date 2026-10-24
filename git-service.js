import { execSync } from "child_process";

export function getGitDiffs(days) {
  try {
    // Dynamically grab the Git author configured for the current folder
    const localAuthor = execSync("git config user.name").toString().trim();
    console.log(`👤 Extracting commits for: ${localAuthor}`);

    // Build the Git command to pull only this author's code changes
    const gitCommand = `git log --author="${localAuthor}" --since="${days} days ago" --no-merges --patch`;

    const rawDiff = execSync(gitCommand).toString().trim();

    if (!rawDiff) {
      console.log(
        `\n⚠️ No commits found for ${localAuthor} in the last ${days} days.`,
      );
      process.exit(0);
    }

    // Count how many commits were found by splitting the string
    const commitCount = (rawDiff.match(/^commit /gm) || []).length;
    console.log(`✅ Successfully extracted ${commitCount} commit(s).\n`);

    return rawDiff;
  } catch (error) {
    console.error(
      "\n❌ Error reading Git history. Are you sure you are inside a Git repository?",
    );
    process.exit(1);
  }
}
