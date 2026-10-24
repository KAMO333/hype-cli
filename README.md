# hype-cli 🚀

An interactive Node.js CLI tool that transforms your local Git commits into highly engaging, recruiter-ready LinkedIn posts using Google's Gemini AI.

Built to automate the "Build in Public" workflow, `hype-cli` analyzes your code changes, extracts the business value, and formats the output according to the [Crushing Digital](https://www.youtube.com/@CrushingDigital) developer marketing framework, all without leaving the terminal.

## ✨ Features

- **🤖 AI-Powered Analysis:** Leverages the `gemini-3.5-flash` model (with automatic failover fallbacks) to read raw Git diffs and understand the architectural intent behind the code.
- **🎯 Recruiter-Optimized Formatting:** Enforces a strict output schema (The Hook, What I Did, The Evidence, The Impact) tailored for tech recruiters and engineering managers.
- **🕹️ Interactive Commit Selection:** Uses `@inquirer/prompts` to let you scroll through your recent commit history and select exactly which feature you want to post about.
- **📸 Automated Code Snippets:** Automatically finds the most impressive block of code (the "Hero Snippet"), URL encodes it, and launches [Carbon](https://carbon.now.sh/) in your browser for a beautiful, shareable image.
- **📋 Frictionless DX:** Automatically copies the generated LinkedIn text directly to your OS clipboard. Just hit `Ctrl+V`.
- **🛡️ Secure & Multi-Repo Safe:** Dynamically reads your local `git config user.name` at runtime to extract only _your_ commits. API keys are stored safely in your global home directory (`~/.hype-cli.json`), completely isolated from your corporate or open-source codebases.

## 🛠️ Tech Stack

- **Engine:** Node.js
- **CLI Framework:** [Commander.js](https://www.npmjs.com/package/commander)
- **Interactive UI:** [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts)
- **AI SDK:** [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git installed and configured locally
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## 🚀 Installation

Install the CLI globally via npm:

```bash
npm install -g @kamo333/hype-cli
```

## 🔐 Authentication

Before generating your first post, securely save your Gemini API key to your machine. You only need to do this once.

```bash
hype-cli auth <your_gemini_api_key_here>
```

This saves your key to a hidden file in your home directory, keeping it out of your project folders.

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
