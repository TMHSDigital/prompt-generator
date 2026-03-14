# Contributing to Prompt Engine

Thanks for taking the time to contribute. This is a pure vanilla JS / HTML / CSS project — no build step, no dependencies, no framework.

---

## Running Locally

ES modules require a server (browsers block `file://` imports). The simplest options:

```bash
# Python (built in)
python -m http.server 8000

# Node (if you have npx)
npx serve .

# VS Code
# Install the "Live Server" extension, then right-click index.html → Open with Live Server
```

Open `http://localhost:8000` in your browser. That's it.

---

## Architecture Overview

```
index.html
  └─ js/main.js  (entry point — PromptUI class)
       ├─ js/ui.js              UI helpers (notifications, dialogs, formatting)
       ├─ js/share.js           Share/clipboard logic
       ├─ js/storage.js         Save/load/export/import prompts (UI layer)
       └─ js/features/
            ├─ promptEnhancer.js Core enhancement engine
            ├─ promptTypes.js    Medium/type definitions + factors
            ├─ promptValidator.js Input validation + factor detection
            ├─ enhancementRules.js Rule definitions (add new rules here)
            ├─ aiSuggestions.js  Rule-based suggestion system
            ├─ shareFeatures.js  Platform-specific share + link generation
            ├─ storageManager.js localStorage CRUD wrapper
            ├─ darkMode.js       Theme management (uses storageManager)
            ├─ savedPrompts.js   Saved prompts UI
            └─ uiFeatures.js    Aggregates UI feature modules
```

`main.js` is the only script loaded by `index.html` (as a `type="module"`). It imports everything else. The `features/` directory contains domain-specific logic; the top-level `js/` files contain UI coordination extracted from `main.js`.

---

## Adding a New Prompt Type

1. Open [`js/features/promptTypes.js`](js/features/promptTypes.js)
2. Find the `mediumTypes` object for the relevant medium (`text` or `image`)
3. Add your type under `types`:

```js
myType: {
    name: 'My Type',
    description: 'What this type does',
    factors: ['objective', 'tone', 'format'],
}
```

4. Open [`js/features/enhancementRules.js`](js/features/enhancementRules.js) and add any type-specific enhancement rules under your new key.

---

## Adding a New Enhancement Rule

Enhancement rules live in [`js/features/enhancementRules.js`](js/features/enhancementRules.js).

Each rule receives the prompt text and returns an enhanced version (or appended guidance). Follow the existing pattern — keep rules composable and side-effect free.

If the rule is type-specific, gate it on the `medium`/`type` arguments passed to the enhancer.

---

## Good First Issues

Look for issues labeled [`good first issue`](https://github.com/TMHSDigital/prompt-generator/labels/good%20first%20issue) — these are scoped, well-described tasks ideal for a first contribution.

---

## PR Checklist

Before opening a pull request:

- [ ] The app still loads and the Enhance button works
- [ ] Dark mode and light mode both look correct
- [ ] No new `console.error` calls on a clean run
- [ ] Code follows the existing style (no framework, no bundler, ES modules)
- [ ] If you added a prompt type, include at least one example in `example-prompts.json`
- [ ] PR description explains *what* changed and *why*

---

## Open Issues

Browse [open issues](https://github.com/TMHSDigital/prompt-generator/issues) for ideas or to claim something before starting.

For bugs, include:
- Browser + OS
- Steps to reproduce
- What you expected vs. what happened
