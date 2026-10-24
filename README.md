# hype-cli 🚀

An interactive Node.js CLI tool that transforms your local Git commits into highly engaging, recruiter-ready LinkedIn posts using Google's Gemini AI.

Built to automate the "Build in Public" workflow, `hype-cli` analyzes your code changes, extracts the business value, and formats the output according to the [Crushing Digital](https://www.youtube.com/@CrushingDigital) developer marketing framework, all without leaving the terminal.

## ✨ Features

- **🤖 AI-Powered Analysis:** Leverages the `gemini-3.5-flash` model (with automatic failover fallbacks) to read raw Git diffs and understand the architectural intent behind the code.
- **🎯 Recruiter-Optimized Formatting:** Enforces a strict output schema (The Hook, What I Did, The Evidence, The Impact) tailored for tech recruiters and engineering managers.
- **🕹️ Interactive Commit Selection:** Uses `@inquirer/prompts` to let you scroll through your recent commit history and select exactly which feature you want to post about.
- **📸 Automated Code Snippets:** Automatically finds the most impressive block of code (the "Hero Snippet"), Base64 encodes it, and launches [Carbon.now.sh](https://carbon.now.sh/) in your browser for a beautiful, shareable image.
- **📋 Frictionless DX:** Automatically copies the generated LinkedIn text directly to your OS clipboard. Just hit `Ctrl+V`.
- **🛡️ Multi-Repo/Multi-Account Safe:** Dynamically reads your local `git config user.name` at runtime. It only extracts _your_ code contributions, ensuring you never accidentally share team members' code or proprietary company secrets.

## 🛠️ Tech Stack

- **Engine:** Node.js
- **CLI Framework:** [Commander.js](https://www.npmjs.com/package/commander)
- **Interactive UI:** [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts)
- **AI SDK:** [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **System Integrations:** `child_process` (Git execution), `clipboardy` (OS clipboard), `open` (Browser automation)

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git installed and configured locally
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## 🚀 Installation

Because `hype-cli` is a global developer tool, you can clone it anywhere on your machine and link it globally to use it inside any of your other project directories.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KAMO333/hype-cli.git
   cd hype-cli
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure the environment:**

   Create a `.env` file in the root of the `hype-cli` directory and add your API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Link the CLI globally:**

   ```bash
   npm link
   ```

   > **Note:** If you encounter an `EACCES` permission error on Linux/macOS, configure your global npm prefix to your home directory (`npm config set prefix '~/.npm-global'`) and add it to your `PATH`, then retry `npm link` without `sudo`.

## 💻 Usage

Navigate to any local Git repository on your machine where you have recently committed code.

Run the CLI:

```bash
hype-cli generate --days 5
```

**Workflow:**

1. The CLI scans the repo for your commits over the last X days.
2. Select the specific commit you want to highlight using your arrow keys.
3. The AI processes the diff and prints the drafted post to your terminal.
4. The text is automatically copied to your clipboard.
5. Your browser opens Carbon with your highlighted code snippet ready to export.
6. Paste on LinkedIn and post.

## 📄 License

This project is licensed under the ISC License.
