import screenshot from "screenshot-desktop";

export async function captureEnvironment(options) {
  let terminalLogs = "";

  if (options.terminal) {
    if (process.stdin.isTTY) {
      console.error(
        "\n❌ No data piped! Usage: npm run test | hype-cli capture --terminal",
      );
      process.exit(1);
    }

    for await (const chunk of process.stdin) {
      const text = chunk.toString();
      terminalLogs += text;
      // Echo the piped data back to the terminal screen so the camera can see it
      process.stdout.write(text);
    }

    if (!terminalLogs.trim()) {
      console.error(
        "\n❌ No text received! If you are piping an error, make sure to pipe stderr using '2>&1 |' (e.g., npm run build 2>&1 | hype-cli capture --terminal)",
      );
      process.exit(1);
    }

    // Brief pause to ensure the terminal UI finishes rendering the text before snapping
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  try {
    const imageBuffer = await screenshot();
    const base64Image = imageBuffer.toString("base64");

    return {
      base64Image,
      terminalLogs,
    };
  } catch (error) {
    console.error("\n❌ Failed to capture screenshot:", error.message);
    process.exit(1);
  }
}
