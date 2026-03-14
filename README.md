<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=059669&height=200&section=header&text=Prompt%20Engine&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Instantly%20enhance%20any%20AI%20prompt&descSize=18&descAlignY=55" alt="Prompt Engine header" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/TMHSDigital/prompt-generator/stargazers"><img src="https://img.shields.io/github/stars/TMHSDigital/prompt-generator?style=for-the-badge&color=059669&labelColor=1c1917" alt="Stars"></a>
  <a href="https://github.com/TMHSDigital/prompt-generator/network/members"><img src="https://img.shields.io/github/forks/TMHSDigital/prompt-generator?style=for-the-badge&color=34d399&labelColor=1c1917" alt="Forks"></a>
  <a href="https://github.com/TMHSDigital/prompt-generator/commits/main"><img src="https://img.shields.io/github/last-commit/TMHSDigital/prompt-generator?style=for-the-badge&color=22c55e&labelColor=1c1917" alt="Last Commit"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/TMHSDigital/prompt-generator?style=for-the-badge&color=f59e0b&labelColor=1c1917" alt="License"></a>
  <a href="https://tmhsdigital.github.io/prompt-generator"><img src="https://img.shields.io/badge/DEMO-LIVE-brightgreen?style=for-the-badge&color=10b981&labelColor=1c1917" alt="Live Demo"></a>
</p>

<p align="center">
  <strong>Paste in a rough prompt → get a structured, AI-ready version out.</strong><br>
  Free, open-source, no login, no backend. Works offline as a PWA.
</p>

<p align="center">
  <a href="https://tmhsdigital.github.io/prompt-generator"><kbd>&nbsp;&nbsp;&nbsp;Try the Live Demo →&nbsp;&nbsp;&nbsp;</kbd></a>
</p>

---

## Screenshots

| Light mode | Dark mode |
|:---:|:---:|
| ![Prompt Engine — light mode interface](light-preview.png) | ![Prompt Engine — dark mode interface](dark-preview.png) |

---

## Before / After

See the difference in one glance:

**Code prompt:**

> **Raw:** *"write me python code for sorting"*
>
> **Enhanced:** [Temperature: 0.3] Write me python code for sorting. Include a brief description of what the code should accomplish. Include clear documentation and inline comments. Provide unit tests covering key scenarios. Follow standard style guidelines for the language.

**Image prompt:**

> **Raw:** *"cat sitting on a cloud"*
>
> **Enhanced:** I want you to cat sitting on a cloud. Focus on the main subject with clear composition. Specify an artistic style (e.g., photorealistic, illustration, watercolor). Ensure balanced composition and visual hierarchy. Optimize lighting for clarity and atmosphere. Convey appropriate mood and atmosphere.

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/ES_Modules-333?style=flat-square&logo=javascript&logoColor=F7DF1E" alt="ES Modules">
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA">
</p>

Zero dependencies. No build step. No framework. Just vanilla JS with ES modules.

---

## What It Does

- **Transforms vague prompts into structured, high-quality instructions** ready for any AI model
- **Applies prompt-engineering best practices automatically** — chain-of-thought breakdown, temperature hints, format specs, type-specific expansion
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
- Direct shareable link (includes medium + type)

**Interface**
- Dark-first developer tool aesthetic — Inter + JetBrains Mono typography
- Warm stone/emerald design system with CSS custom properties
- Compact sticky topbar with inline dark/light toggle
- Improvements shown as collapsible pill tags in the output card
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

## Deploy Your Own

1. Fork this repo
2. Go to **Settings → Pages → Source**: `main` branch / root
3. Your instance is live at `https://yourusername.github.io/prompt-generator`

No build step, no CI, no config — pure static files.

---

## How It Works

```mermaid
flowchart LR
    A["Your prompt"] --> B["Type detection"]
    B --> C["Chain-of-thought"]
    C --> D["Factor application"]
    D --> E["Expansion hints"]
    E --> F["Structured output"]

    style A fill:#fafaf9,stroke:#d6d3d1,color:#1c1917
    style B fill:#ecfdf5,stroke:#059669,color:#1c1917
    style C fill:#ecfdf5,stroke:#059669,color:#1c1917
    style D fill:#ecfdf5,stroke:#059669,color:#1c1917
    style E fill:#ecfdf5,stroke:#059669,color:#1c1917
    style F fill:#ecfdf5,stroke:#10b981,color:#1c1917
```

Enhancement rules are embedded in [`js/features/promptEnhancer.js`](js/features/promptEnhancer.js). Prompt types and their factors are defined in [`js/features/promptTypes.js`](js/features/promptTypes.js).

---

## Project Structure

```
prompt-generator/
├── index.html                  # App shell
├── css/
│   └── styles.css              # Design system (CSS custom properties)
├── js/
│   ├── main.js                 # Entry point — wires everything together
│   ├── ui.js                   # Formatting, notifications, dialogs, dark mode
│   ├── share.js                # Clipboard, platform dialog, share dispatch
│   ├── storage.js              # Save/load/search/export/import prompts
│   └── features/
│       ├── promptEnhancer.js   # Core enhancement engine
│       ├── promptTypes.js      # Medium and type definitions
│       ├── promptValidator.js  # Input validation
│       ├── aiSuggestions.js    # Rule-based suggestion system
│       ├── shareFeatures.js    # Platform-specific share logic
│       ├── storageManager.js   # localStorage CRUD wrapper
│       ├── darkMode.js         # Theme management
│       ├── savedPrompts.js     # Saved prompts UI
│       └── uiFeatures.js      # UI feature aggregator
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # Service worker (offline support)
└── example-prompts.json        # Sample prompts for import
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

## Star History

<p align="center">
  <a href="https://star-history.com/#TMHSDigital/prompt-generator&Date">
    <img src="https://api.star-history.com/svg?repos=TMHSDigital/prompt-generator&type=Date" alt="Star History Chart" width="600"/>
  </a>
</p>

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  <em>Built by <a href="https://github.com/TMHSDigital">TMHS Digital</a></em>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=059669&height=100&section=footer" alt="" width="100%"/>
