# Changelog

All notable changes to Prompt Engine are documented here.

---

## [Unreleased]

### Added
- **Full UI overhaul** — new design system inspired by Linear/Vercel: warm stone palette, emerald accent, Inter + JetBrains Mono typography
- Sticky topbar with wordmark + dark mode toggle replacing the old centered floating-button header
- Hero tagline below topbar replacing the generic `<h1>` block
- Improvements rendered as inline pill tags inside the output card (collapsible `<details>`) — no more separate section below
- Import button moved into the output card action toolbar (alongside Share, Copy, Save, Export)
- GitHub link added to footer social links
- `CONTRIBUTING.md` with local dev setup, architecture overview, how to add prompt types/rules, and PR checklist
- `LICENSE` file (MIT)
- `.gitignore` with standard exclusions
- `.github/PULL_REQUEST_TEMPLATE.md` with lightweight PR checklist
- Open Graph and Twitter Card meta tags in `index.html` for better link previews
- `js/ui.js` — extracted UI helpers (notifications, dialogs, formatting, dark mode sync) from `main.js`
- `js/share.js` — extracted share/clipboard logic from `main.js`
- `js/storage.js` — extracted save/load/export/import prompt logic from `main.js`
- Before/after demo table in `README.md` showing raw vs. enhanced prompts
- Mermaid architecture diagram in `README.md` replacing ASCII art
- Capsule-render animated header and footer waves in `README.md`
- Star History chart embed in `README.md`
- Tech stack badges (HTML5, CSS3, JavaScript, ES Modules, PWA) in `README.md`
- `for-the-badge` style shields replacing `flat-square` in `README.md`

### Fixed
- **`enhance()` return value bug** — `main.js` was passing the entire result object to `formatEnhancedPrompt` instead of `result.enhancedPrompt`, causing `[object Object]` to appear in the output card
- **`promptEnhancer.js` version scoping** — `version` variable was declared inside a conditional block but referenced outside it, causing a potential `ReferenceError`
- **Share dialog click delegation** — click handler was only attached to the first `.share-platforms` section, making Messaging and Other sections unresponsive; now delegates from the dialog root
- **Share link missing medium** — `generateShareLink` in `shareFeatures.js` did not include `medium` in the base64 payload, causing shared image prompts to load as text
- **Placeholder string mismatch** — HTML used Unicode `…` but JS checked for ASCII `...`, causing "no prompt to share/save" guards to potentially fail
- **Service worker missing module files** — `ui.js`, `share.js`, `storage.js` were not in the `ASSETS` cache list, breaking offline use for those imports
- **Manifest `theme_color` mismatch** — `manifest.webmanifest` had `#f8fafc` while `index.html` had `#fafaf9`; aligned to `#fafaf9`
- **CSS share-platforms grid breakpoint** — `grid-template-columns` was set without `display: grid` in the `@media (max-width: 600px)` rule
- **`uiFeatures.js` cleanup methods** — referenced non-existent properties (`systemThemeQuery`, `handleSystemThemeChange`, `hideViewer`); simplified to no-ops
- **`storage.js` import result handling** — `importPrompts` returns `{ importedCount, skippedCount }` but was treated as a number
- **`storageManager.deletePrompt` mass-delete bug** — calling `deletePrompt(undefined)` removed all prompts without IDs; added `null`/`undefined` guard
- **`savePrompt` missing ID** — prompts saved via the UI were not assigned an `id`, now get `Date.now()` at creation
- **`loadPrompt` XSS vulnerability** — `innerHTML` used with user-stored text replaced with `textContent`; added medium/type fallbacks for missing fields
- **Share platform routing ignored** — `shareFeatures.sharePrompt` ignored the `platform` parameter; now routes to correct share URLs (Twitter, LinkedIn, Facebook, WhatsApp, Telegram, Email, copy link)
- Invalid regex `/[<>{}|\]/g` in `promptValidator.js` causing a `SyntaxError` that blocked app initialization — fixed escape sequence to `/[<>{}|\\]/g`
- `aiPromptHelper` was imported as `storageManager` in `main.js`, causing a `ReferenceError` on every enhance and type-detect action — corrected both imports
- Live demo URL in `README.md`, `robots.txt`, and `sitemap.xml` was pointing to the wrong org (`tmhs-digital.github.io/prompt-engine`) — updated to `tmhsdigital.github.io/prompt-generator`
- Duplicate `.loading` CSS rule removed
- Instagram gradient `background-clip: text` hack in footer removed (was visually broken in dark mode)
- Three separate `@media (max-width: 768px)` blocks consolidated

### Changed
- **Enhancement engine rewritten** — removed boilerplate (generic `context`, `constraints`, `examples` factors are now no-ops); `role` only applied for chat type; smarter `objective` wrapping that respects existing action verbs
- **Chain-of-thought restructured** — only triggers on multi-step prompts (80+ chars, multiple action sentences); skipped for completion type; appends structured steps instead of prepending redundant scaffolding
- **Type auto-detection expanded** — `aiSuggestions.js` classifier now recognizes 20+ programming languages, image-specific verbs (draw, paint, render), editing/variation patterns, and phrase combinations; returns `{ medium, type }` directly instead of a bare string
- **Missing factor implementations added** — creativity, continuity, memory, color, detail, perspective, modification, preservation, blend, diversity, consistency, purpose, elements, focus, strength now produce meaningful guidance instead of silently skipping
- **Type-specific expansion hints** — short prompts for blog posts, code, and images now get targeted guidance (e.g., "Specify: target audience, approximate word count, and key sections to cover")
- **Improvement labels cleaned up** — deduplication removes subsumed labels; empty/redundant additions (default temperature, no-op factors) no longer listed
- **`promptTypes.js` factor lists trimmed** — removed `constraints`, `examples`, `context` from type factor arrays since these no longer produce output
- **Accent color swapped from indigo to emerald** — all CSS design tokens, README capsule-render banners, badges, and Mermaid diagram styles updated from `#6366f1`/`#818cf8` to `#059669`/`#10b981`
- **`storageManager.js` rewritten** — from 729-line IndexedDB/localStorage hybrid to ~120-line pure localStorage wrapper with standardized field names (`original`, `enhanced`, `medium`, `type`, `timestamp`)
- `css/styles.css` completely rewritten with a structured design-token system (CSS custom properties for surface, border, text, accent, spacing, radius, shadow, transition layers)
- Dark mode now uses warm near-black (`#0c0a09`) instead of cold slate — significantly better contrast and more distinctive from light mode
- Notifications redesigned: white card with colored left-border accent instead of solid colored pills — readable in both modes
- All button hover effects changed from `transform: translateY` to background/border-color transitions (feels less cheap)
- `Courier New` replaced with `JetBrains Mono` for prompt input and output areas
- Share dialog platform buttons redesigned as inline pill-style buttons instead of tall icon cards
- `README.md` rewritten with capsule-render banner, `for-the-badge` shields, before/after demo, mermaid diagram, star-history chart, and updated project structure
- `CONTRIBUTING.md` updated with architecture overview, good-first-issues callout, and cleaned-up project tree
- `main.js` refactored from a monolithic 36KB class to a slim entry point delegating to extracted modules
- `light-preview.png` and `dark-preview.png` replaced with fresh screenshots of the new UI
- Service worker cache bumped to `prompt-engine-v5` with Google Fonts URLs added
- `sitemap.xml` lastmod updated to `2026-03-14`
- `example-prompts.json` `date` field renamed to `timestamp` for consistency
- Redundant `<script>` tags for transitive modules removed from `index.html` — only `main.js` entry point remains
- Duplicate `.icon-btn` and `.share-dialog-content h3` CSS rules merged
- Confirm dialog gets `aria-labelledby` / `aria-describedby` attributes
- Null guards added in `main.js`, `storage.js`, and `savedPrompts.js` to prevent runtime errors when elements are missing

### Removed
- `js/bestPractices.js` — dead code, never imported by any module
- `js/features/enhancementRules.js` — orphan module, never imported at runtime
- `project-overview.md` — severely outdated internal doc
- `ENHANCEMENTS.md` — outdated internal doc
- Instagram link from footer
- Production `console.log` from `aiSuggestions.js`
- Non-existent PWA icon references from `manifest.webmanifest`
- Unused `getOptionsForType()` method from `main.js`
- Unused `getTypeInfo`, `getMediumInfo` imports from `main.js`
- Unused `getFactors` import from `promptValidator.js`

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
