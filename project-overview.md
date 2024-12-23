# Prompt Engine Project Overview

## Architecture

The project follows a modular architecture with clear separation of concerns:

### Core Modules
- `promptEnhancer.js`: Core prompt enhancement logic
- `promptTypes.js`: Defines different prompt types and their configurations
- `enhancementRules.js`: Rules for enhancing different types of prompts
- `promptValidator.js`: Validates prompts against defined rules

### Feature Modules
- `darkMode.js`: Handles dark mode functionality and preferences
- `savedPrompts.js`: Manages saving, loading, and deleting prompts
- `shareFeatures.js`: Handles sharing functionality with multiple platforms
- `uiFeatures.js`: Core UI utilities and feature aggregation

### Main Application
- `main.js`: Main application logic and UI interactions
- `index.html`: Main application interface
- `styles.css`: Application styling

## Features

1. **Prompt Enhancement**
   - Smart prompt improvement based on type
   - Real-time processing
   - Multiple prompt types support

2. **User Interface**
   - Dark/Light mode with system preference detection
   - Character counter with limits
   - Loading states for better UX
   - Responsive notifications
   - Mobile-friendly design

3. **Sharing Capabilities**
   - Multiple sharing platforms
   - Native share API support
   - Clipboard fallback
   - QR code generation
   - Direct links

4. **Prompt Management**
   - Save prompts locally
   - View saved prompt history
   - Delete saved prompts
   - Load previous prompts

## Technical Details

- Pure JavaScript (ES6+)
- No external dependencies
- Local storage for data persistence
- Modular design for easy maintenance
- Responsive CSS with Flexbox/Grid
- Progressive enhancement approach
