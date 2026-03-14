# Prompt Engine ⚡

> Instantly improve any AI prompt — paste in, enhance, copy out.

[![Stars](https://img.shields.io/github/stars/TMHSDigital/prompt-generator?style=flat-square)](https://github.com/TMHSDigital/prompt-generator/stargazers)
[![Forks](https://img.shields.io/github/forks/TMHSDigital/prompt-generator?style=flat-square)](https://github.com/TMHSDigital/prompt-generator/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/TMHSDigital/prompt-generator?style=flat-square)](https://github.com/TMHSDigital/prompt-generator/commits/main)
[![License](https://img.shields.io/github/license/TMHSDigital/prompt-generator?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-square)](https://tmhsdigital.github.io/prompt-generator)

**[→ Try the live demo](https://tmhsdigital.github.io/prompt-generator)**

![Prompt Engine dark mode screenshot](dark-preview.png)

---

## What it does

- **Transforms vague prompts into structured, high-quality instructions** ready for any AI model
- **Applies prompt-engineering best practices automatically** — chain-of-thought, temperature hints, format specs, context grounding
- **Works for text and image models** — ChatGPT, Claude, Gemini, Midjourney, Stable Diffusion, and more

---

## Use Cases

| Goal | How Prompt Engine helps |
|------|------------------------|
| **ChatGPT / Claude** | Adds role, format, tone, and constraints so the model gives precise answers |
| **Midjourney / DALL·E** | Expands sparse image ideas with style, lighting, composition, and mood parameters |
| **Coding assistants** | Structures your request with language, paradigm, error-handling, and test requirements |
| **Content creation** | Specifies audience, tone, length, and structure so drafts need less editing |
| **Research & summarization** | Frames depth, perspective, and output format for more useful responses |

---

## Features

**Smart Enhancement**
- Medium-aware processing (Text vs. Image)
- Type-specific rules (chat, code, completion, generation, editing, variation)
- Chain-of-thought and temperature hints applied automatically
- AI-powered prompt type auto-detection

**Prompt Management**
- Save, search, and reload prompt history (localStorage)
- Export / import history as JSON
- Load shared prompts from URL parameters

**Sharing**
- Copy to clipboard
- Share via Twitter, LinkedIn, WhatsApp, Telegram, Email
- QR code generation
- Direct shareable link

**Quality of Life**
- Dark / light mode with system preference detection
- PWA — installable as a desktop or mobile app
- Fully offline after first load
- No login, no backend, no data leaves your browser

---

## Quick Start

**Use online (no setup):**

```
https://tmhsdigital.github.io/prompt-generator
```

**Run locally:**

```bash
git clone https://github.com/TMHSDigital/prompt-generator.git
cd prompt-generator
python -m http.server 8000
# open http://localhost:8000
```

> ES modules require a real server — opening `index.html` directly via `file://` won't work in most browsers.

---

## How It Works

```
Your rough prompt
      ↓
Select medium (Text / Image) + type (chat, code, generation…)
      ↓
Prompt Engine applies enhancement rules + best practices
      ↓
Structured, AI-ready prompt — copy, save, or share
```

Enhancement rules live in [`js/features/enhancementRules.js`](js/features/enhancementRules.js). Prompt types and their factors are defined in [`js/features/promptTypes.js`](js/features/promptTypes.js).

---

## Deploy Your Own

1. Fork this repo
2. Go to **Settings → Pages → Source**: `main` branch / root
3. Your instance is live at `https://yourusername.github.io/prompt-generator`

No build step, no CI, no config — pure static files.

---

## Project Structure

```
prompt-generator/
├── index.html              # App shell
├── css/
│   └── styles.css
├── js/
│   ├── main.js             # Entry point — wires everything together
│   ├── ui.js               # Formatting, notifications, dialogs, dark mode
│   ├── share.js            # Clipboard, platform dialog, share dispatch
│   ├── storage.js          # Save/load/search/export/import prompts
│   └── features/
│       ├── promptEnhancer.js   # Core enhancement engine
│       ├── enhancementRules.js # Enhancement rule definitions
│       ├── promptTypes.js      # Medium and type definitions
│       ├── promptValidator.js  # Input validation
│       ├── aiSuggestions.js    # Rule-based suggestion system
│       ├── shareFeatures.js    # Platform-specific share logic
│       ├── storageManager.js   # LocalStorage CRUD + export/import
│       ├── darkMode.js         # Theme management
│       ├── savedPrompts.js     # Saved prompts UI
│       └── uiFeatures.js       # UI feature aggregator
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker (offline support)
└── example-prompts.json    # Sample prompts for import
```

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to:
- Run the project locally
- Add a new prompt type or enhancement rule
- Submit a pull request

Browse [open issues](https://github.com/TMHSDigital/prompt-generator/issues) for ideas.

---

## Topics

Add these in **Settings → Topics** to improve discoverability:

`prompt-engineering` `ai-tools` `chatgpt` `llm` `claude-ai` `midjourney` `javascript` `pwa` `productivity` `open-source`

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built by [TMHS Digital](https://github.com/TMHSDigital)*
