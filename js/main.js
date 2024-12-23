import { PromptEnhancer } from './features/promptEnhancer.js';
import { promptTypes } from './features/promptTypes.js';
import { uiFeatures } from './features/uiFeatures.js';

class PromptUI {
    constructor() {
        this.enhancer = new PromptEnhancer();
        this.initializeElements();
        this.initializeFeatures();
        this.attachEventListeners();
        this.loadSavedPrompts();
        this.checkForSharedPrompt();
    }

    initializeElements() {
        this.elements = {
            originalPrompt: document.getElementById('originalPrompt'),
            promptType: document.getElementById('promptType'),
            generateBtn: document.getElementById('generateBtn'),
            enhancedPrompt: document.getElementById('enhancedPrompt'),
            copyBtn: document.getElementById('copyBtn'),
            saveBtn: document.getElementById('saveBtn'),
            shareBtn: document.getElementById('shareBtn'),
            improvementsList: document.getElementById('improvementsList'),
            charCounter: document.getElementById('charCounter'),
            darkModeBtn: document.getElementById('darkModeBtn')
        };

        // Initialize type selector
        this.elements.promptType.innerHTML = Object.entries(promptTypes)
            .map(([value, type]) => `<option value="${value}">${type.name}</option>`)
            .join('');
    }

    initializeFeatures() {
        // Initialize dark mode
        uiFeatures.darkMode.initialize();

        // Initialize character counter
        uiFeatures.characterCounter.initialize(
            this.elements.originalPrompt,
            this.elements.charCounter
        );
    }

    attachEventListeners() {
        // Generate enhanced prompt
        this.elements.generateBtn.addEventListener('click', () => this.generateEnhancedPrompt());

        // Copy enhanced prompt
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());

        // Share prompt
        this.elements.shareBtn.addEventListener('click', () => this.sharePrompt());

        // Save prompt
        this.elements.saveBtn.addEventListener('click', () => this.savePrompt());

        // Dark mode toggle
        this.elements.darkModeBtn.addEventListener('click', () => {
            uiFeatures.darkMode.toggle();
            this.updateDarkModeButton();
        });

        // Handle textarea auto-resize
        this.elements.originalPrompt.addEventListener('input', (e) => this.autoResizeTextarea(e.target));

        // Handle prompt type change
        this.elements.promptType.addEventListener('change', () => this.handleTypeChange());
    }

    async generateEnhancedPrompt() {
        const prompt = this.elements.originalPrompt.value.trim();
        if (!prompt) {
            uiFeatures.notifications.show('Please enter a prompt first.', 'error');
            return;
        }

        const type = this.elements.promptType.value;
        const options = this.getOptionsForType(type);

        // Show loading state
        const hideLoading = uiFeatures.loadingState.show(this.elements.generateBtn);

        try {
            const { enhancedPrompt, improvements, wasModified } = this.enhancer.enhance(prompt, type, options);

            // Update UI
            this.elements.enhancedPrompt.innerHTML = `<pre>${enhancedPrompt}</pre>`;
            this.elements.improvementsList.innerHTML = improvements
                .map(improvement => `<li>${improvement}</li>`)
                .join('');

            // Show success message
            uiFeatures.notifications.show('Prompt enhanced successfully!', 'success');
        } catch (error) {
            console.error('Enhancement error:', error);
            uiFeatures.notifications.show('Failed to enhance prompt.', 'error');
        } finally {
            hideLoading();
        }
    }

    async sharePrompt() {
        const enhancedText = this.elements.enhancedPrompt.textContent;
        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
            return;
        }

        const promptData = {
            original: this.elements.originalPrompt.value,
            enhanced: enhancedText,
            type: this.elements.promptType.value
        };

        const result = await uiFeatures.sharing.sharePrompt(promptData);
        uiFeatures.notifications.show(
            result.message || (result.success ? 'Shared successfully!' : 'Failed to share.'),
            result.success ? 'success' : 'error'
        );
    }

    async copyToClipboard() {
        const promptText = this.elements.enhancedPrompt.textContent;
        try {
            await navigator.clipboard.writeText(promptText);
            uiFeatures.notifications.show('Copied to clipboard!', 'success');
        } catch (error) {
            uiFeatures.notifications.show('Failed to copy to clipboard.', 'error');
        }
    }

    savePrompt() {
        const originalText = this.elements.originalPrompt.value;
        const enhancedText = this.elements.enhancedPrompt.textContent;
        const type = this.elements.promptType.value;

        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
            return;
        }

        const promptData = {
            original: originalText,
            enhanced: enhancedText,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.saveToLocalStorage(promptData);
        uiFeatures.notifications.show('Prompt saved successfully!', 'success');
    }

    getOptionsForType(type) {
        const typeConfig = promptTypes[type];
        const options = {};

        if (type === 'image') {
            options.quality = true;
            options.style = true;
        } else if (type === 'chat') {
            options.tone = true;
        }

        return options;
    }

    saveToLocalStorage(promptData) {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        savedPrompts.unshift(promptData);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.slice(0, 10)));
    }

    loadSavedPrompts() {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        // Implement saved prompts UI if needed
    }

    checkForSharedPrompt() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('share');
        
        if (sharedData) {
            try {
                const promptData = JSON.parse(atob(sharedData));
                this.elements.originalPrompt.value = promptData.original;
                this.elements.promptType.value = promptData.type;
                this.generateEnhancedPrompt();
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Failed to load shared prompt:', error);
            }
        }
    }

    handleTypeChange() {
        if (this.elements.originalPrompt.value && !this.elements.enhancedPrompt.textContent.includes('Your enhanced prompt will appear here...')) {
            this.generateEnhancedPrompt();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    updateDarkModeButton() {
        const icon = this.elements.darkModeBtn.querySelector('i');
        icon.className = uiFeatures.darkMode.isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.promptUI = new PromptUI();
}); 