# Changelog

All notable changes to Prompt Engine are documented here.

---

## [Unreleased]

### Added
- **Full UI overhaul** — new design system inspired by Linear/Vercel: warm stone palette, indigo accent, Inter + JetBrains Mono typography
- Sticky topbar with wordmark + dark mode toggle replacing the old centered floating-button header
- Hero tagline below topbar replacing the generic `<h1>` block
- Improvements rendered as inline pill tags inside the output card (collapsible `<details>`) — no more separate section below
- Import button moved into the output card action toolbar (alongside Share, Copy, Save, Export)
- GitHub link added to footer social links
- `CONTRIBUTING.md` with local dev setup, how to add prompt types/rules, and PR checklist
- Open Graph and Twitter Card meta tags in `index.html` for better link previews
- `js/ui.js` — extracted UI helpers (notifications, dialogs, formatting, dark mode sync) from `main.js`
- `js/share.js` — extracted share/clipboard logic from `main.js`
- `js/storage.js` — extracted save/load/export/import prompt logic from `main.js`

### Fixed
- Invalid regex `/[<>{}|\]/g` in `promptValidator.js` causing a `SyntaxError` that blocked app initialization — fixed escape sequence to `/[<>{}|\\]/g`
- `aiPromptHelper` was imported as `storageManager` in `main.js`, causing a `ReferenceError` on every enhance and type-detect action — corrected both imports
- Live demo URL in `README.md`, `robots.txt`, and `sitemap.xml` was pointing to the wrong org (`tmhs-digital.github.io/prompt-engine`) — updated to `tmhsdigital.github.io/prompt-generator`
- Duplicate `.loading` CSS rule removed
- Instagram gradient `background-clip: text` hack in footer removed (was visually broken in dark mode)
- Three separate `@media (max-width: 768px)` blocks consolidated

### Changed
- `css/styles.css` completely rewritten with a structured design-token system (CSS custom properties for surface, border, text, accent, spacing, radius, shadow, transition layers)
- Dark mode now uses warm near-black (`#0c0a09`) instead of cold slate — significantly better contrast and more distinctive from light mode
- Notifications redesigned: white card with colored left-border accent instead of solid colored pills — readable in both modes
- All button hover effects changed from `transform: translateY` to background/border-color transitions (feels less cheap)
- `Courier New` replaced with `JetBrains Mono` for prompt input and output areas
- Share dialog platform buttons redesigned as inline pill-style buttons instead of tall icon cards
- `README.md` rewritten with one-liner hook, badges, side-by-side screenshots, use cases table, deploy-your-own section, and updated project structure
- `main.js` refactored from a monolithic 36KB class to a slim entry point delegating to extracted modules
- `light-preview.png` and `dark-preview.png` replaced with fresh screenshots of the new UI

---

## [v0.3.0] — 2025-03-28

### Changed
- Refactored dark mode initialization and storage management for more reliable behaviour across sessions
- Improved `promptEnhancer.js` suggestion quality and `promptValidator.js` validation coverage
- Enhanced prompt factor addition to check for duplicate content before appending
- Updated service worker caching strategy to include more asset types

### Fixed
- AI Suggestions Module refactored for correctness; UI accessibility attributes updated

---

## [v0.2.0] — 2025-03-09

### Added
- PWA support: `manifest.webmanifest`, service worker (`sw.js`), icon generation scripts (`create-icons.sh`, `generate-icons.js`)
- `example-prompts.json` — sample prompts for testing the import feature
- Export / import prompt history as JSON

### Changed
- UI responsiveness improvements and CDN preconnect for faster font-awesome loading

---

## [v0.1.0] — 2024-12-23

### Added
- Initial release
- Text and image medium support with type-specific enhancement rules
- `promptEnhancer.js` with weighted components and quality specifications
- `promptTypes.js` with full type and factor definitions
- Dark / light mode with system preference detection
- Share dialog supporting Twitter, LinkedIn, WhatsApp, Telegram, Email, QR code, and copy link
- Save and load prompt history via localStorage
- Social media links in footer
- GitHub issue templates (bug report, feature request)
- Light and dark mode UI screenshots
