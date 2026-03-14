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

## Project Layout

```
js/
├── main.js                 # Entry point — wires modules together
├── ui.js                   # UI helpers (notifications, dialogs, formatting)
├── share.js                # Share/clipboard logic
├── storage.js              # Save/load/export/import prompts
└── features/
    ├── promptEnhancer.js   # Core enhancement engine
    ├── enhancementRules.js # Enhancement rule definitions  ← add new rules here
    ├── promptTypes.js      # Medium/type definitions       ← add new types here
    ├── promptValidator.js  # Input validation
    ├── aiSuggestions.js    # Rule-based suggestion system
    ├── shareFeatures.js    # Platform-specific share logic
    ├── storageManager.js   # LocalStorage CRUD
    ├── darkMode.js         # Theme management
    ├── savedPrompts.js     # Saved prompts UI
    └── uiFeatures.js       # UI feature aggregator
```

---

## Adding a New Prompt Type

1. Open [`js/features/promptTypes.js`](js/features/promptTypes.js)
2. Find the `mediumTypes` object for the relevant medium (`text` or `image`)
3. Add your type under `types`:

```js
myType: {
    name: 'My Type',
    description: 'What this type does',
    factors: ['objective', 'tone', 'format'],   // factors to enhance
}
```

4. Open [`js/features/enhancementRules.js`](js/features/enhancementRules.js) and add any type-specific enhancement rules under your new key.

---

## Adding a New Enhancement Rule

Enhancement rules live in [`js/features/enhancementRules.js`](js/features/enhancementRules.js).

Each rule receives the prompt text and returns an enhanced version (or appended guidance). Follow the existing pattern — keep rules composable and side-effect free.

If the rule is type-specific, gate it on the `medium`/`type` arguments passed to the enhancer.

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
