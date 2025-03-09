# Prompt Engine

Transform your AI prompts with best practices and smart enhancements.

## Features

- 🚀 **Smart Prompt Enhancement**
  - Content medium selection (Text/Image)
  - Type-specific enhancements
  - Real-time processing and feedback
  - Comprehensive improvement suggestions
  - Temperature recommendations
  - Chain-of-thought prompting
  - Version control support

- 🎨 **Beautiful Interface**
  - Intuitive medium and type selection
  - Dark/Light mode with system preference detection
  - Responsive design for all devices
  - Clean, modern UI with smooth animations
  - Enhanced visual feedback
  - Improved accessibility
  - Tooltips for better guidance

- 💾 **Prompt Management**
  - Save your favorite prompts
  - View and manage prompt history
  - Quick load of previous prompts
  - Categorized prompt organization
  - Version tracking
  - Export/Import capabilities

- 🔗 **Easy Sharing**
  - Share enhanced prompts across platforms
  - Multiple sharing options:
    - Social media (LinkedIn, Instagram)
    - Messaging apps (WhatsApp, Telegram)
    - Email and direct links
    - QR code generation

## Preview

### Light Mode
![Light Mode Preview](light-preview.png)

### Dark Mode
![Dark Mode Preview](dark-preview.png)

## Getting Started

1. Visit [Prompt Engine](https://tmhs-digital.github.io/prompt-engine)
2. Select your content medium (Text/Image)
3. Choose the appropriate prompt type
4. Enter your prompt in the input area
5. Click "Enhance Prompt" to see the improved version
6. Use the share, copy, or save buttons to manage your prompt

### Using Import/Export Feature

The app allows you to import and export prompts for backup or sharing:

- **Export**: Click the "Export" button to download your saved prompts as a JSON file
- **Import**: Click "Import Prompts" to upload a previously exported file

Download our [example-prompts.json](example-prompts.json) file to see the format and try importing sample prompts. You can also use this as a template to create your own collection.

## Deployment Instructions

### Setting Up Icons for PWA

Before deploying to GitHub Pages, you need to generate the PWA icons:

1. Create a high-resolution square image (at least 512x512 pixels) to use as your app icon
2. Name this file `icon-source.png` and place it in the project root

#### Option 1: Using the Shell Script (Recommended)
If you have ImageMagick installed (available on most systems):

```bash
# Make the script executable
chmod +x create-icons.sh

# Run the script
./create-icons.sh
```

#### Option 2: Using Node.js
If you prefer using Node.js:

```bash
npm install sharp
node generate-icons.js
```

#### Option 3: Manual Creation
Alternatively, you can:
- Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Manually create the icons and place them in `images/icons/` directory with the correct filenames

### Deploying to GitHub Pages

1. Update the GitHub Pages URL in these files:
   - `robots.txt`
   - `sitemap.xml`
   Replace `tmhs-digital.github.io/prompt-engine` with your GitHub username or organization.

2. Push your changes to GitHub:
```bash
git add .
git commit -m "Deploy Prompt Engine with PWA support"
git push origin main
```

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select the main branch as the source
   - Click Save

4. Your app will be available at `https://your-username.github.io/prompt-engine/`

## Prompt Types

### Text Medium
- **General**: General purpose text generation
- **Completion**: Continue or complete existing text
- **Chat**: Conversational interactions
- **Code**: Generate or modify code

### Image Medium
- **Generation**: Create new images
- **Editing**: Modify existing images
- **Variation**: Create variations of images

## Enhancement Factors

### Text Factors
- Objective
- Tone
- Format
- Constraints
- Examples
- Creativity
- Continuity
- Memory
- Documentation
- Tests

### Image Factors
- Subject
- Style
- Composition
- Lighting
- Color
- Mood
- Detail
- Perspective
- Modification
- Strength
- Preservation
- Blend

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/prompt-engine.git
   ```

2. Open the project folder:
   ```bash
   cd prompt-engine
   ```

3. Start a local server (e.g., using Python):
   ```bash
   python -m http.server 8000
   ```

4. Visit `http://localhost:8000` in your browser

## Project Structure

```
prompt-engine/
├── css/
│   └── styles.css
├── js/
│   ├── features/
│   │   ├── darkMode.js
│   │   ├── savedPrompts.js
│   │   ├── shareFeatures.js
│   │   ├── uiFeatures.js
│   │   ├── promptTypes.js
│   │   ├── enhancementRules.js
│   │   └── promptValidator.js
│   ├── bestPractices.js
│   ├── promptEnhancer.js
│   └── main.js
├── index.html
└── footer.html
```

## Technical Details

- Pure JavaScript (ES6+)
- No external dependencies
- Local storage for data persistence
- Modular design for easy maintenance
- Responsive CSS with Flexbox/Grid
- Progressive enhancement approach
- Semantic HTML structure
- Accessibility features
- Cross-browser compatibility

## Best Practices

### Code Organization
- Modular file structure
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive error handling
- JSDoc documentation

### Performance
- Minimal DOM manipulation
- Efficient event handling
- Optimized animations
- Lazy loading where appropriate

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### User Experience
- Intuitive navigation
- Clear feedback
- Responsive design
- Progressive enhancement
- Tooltips and guidance

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by best practices in prompt engineering
- Built with modern web technologies
- Created by TMHS Digital 