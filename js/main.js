import { PromptEnhancer } from './features/promptEnhancer.js';
import { promptTypes } from './features/promptTypes.js';

class PromptUI {
    constructor() {
        this.enhancer = new PromptEnhancer();
        this.initializeElements();
        this.attachEventListeners();
        this.loadSavedPrompts();
    }

    initializeElements() {
        this.elements = {
            originalPrompt: document.getElementById('originalPrompt'),
            promptType: document.getElementById('promptType'),
            generateBtn: document.getElementById('generateBtn'),
            enhancedPrompt: document.getElementById('enhancedPrompt'),
            copyBtn: document.getElementById('copyBtn'),
            saveBtn: document.getElementById('saveBtn'),
            improvementsList: document.getElementById('improvementsList')
        };

        // Initialize type selector
        this.elements.promptType.innerHTML = Object.entries(promptTypes)
            .map(([value, type]) => `<option value="${value}">${type.name}</option>`)
            .join('');
    }

    attachEventListeners() {
        // Generate enhanced prompt
        this.elements.generateBtn.addEventListener('click', () => this.generateEnhancedPrompt());

        // Copy enhanced prompt
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());

        // Save prompt
        this.elements.saveBtn.addEventListener('click', () => this.savePrompt());

        // Handle textarea auto-resize
        this.elements.originalPrompt.addEventListener('input', (e) => this.autoResizeTextarea(e.target));

        // Handle prompt type change
        this.elements.promptType.addEventListener('change', () => this.handleTypeChange());
    }

    async generateEnhancedPrompt() {
        const prompt = this.elements.originalPrompt.value.trim();
        if (!prompt) {
            this.showMessage('Please enter a prompt first.', 'error');
            return;
        }

        const type = this.elements.promptType.value;
        const options = this.getOptionsForType(type);

        try {
            const { enhancedPrompt, improvements, wasModified } = this.enhancer.enhance(prompt, type, options);

            // Update UI
            this.elements.enhancedPrompt.innerHTML = `<pre>${enhancedPrompt}</pre>`;
            this.elements.improvementsList.innerHTML = improvements
                .map(improvement => `<li>${improvement}</li>`)
                .join('');

            // Show success message
            this.updateButtonState(this.elements.generateBtn, 'Enhanced!', 'fa-check');
        } catch (error) {
            console.error('Enhancement error:', error);
            this.showMessage('Failed to enhance prompt.', 'error');
        }
    }

    getOptionsForType(type) {
        const typeConfig = promptTypes[type];
        const options = {};

        // Add type-specific options
        if (type === 'image') {
            options.quality = true;
            options.style = true;
        } else if (type === 'chat') {
            options.tone = true;
        }

        return options;
    }

    async copyToClipboard() {
        const promptText = this.elements.enhancedPrompt.textContent;
        try {
            await navigator.clipboard.writeText(promptText);
            this.updateButtonState(this.elements.copyBtn, 'Copied!', 'fa-check');
        } catch (error) {
            this.showMessage('Failed to copy to clipboard.', 'error');
        }
    }

    savePrompt() {
        const originalText = this.elements.originalPrompt.value;
        const enhancedText = this.elements.enhancedPrompt.textContent;
        const type = this.elements.promptType.value;

        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            this.showMessage('Please generate an enhanced prompt first.', 'error');
            return;
        }

        const promptData = {
            original: originalText,
            enhanced: enhancedText,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.saveToLocalStorage(promptData);
        this.updateButtonState(this.elements.saveBtn, 'Saved!', 'fa-check');
    }

    saveToLocalStorage(promptData) {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        savedPrompts.unshift(promptData);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.slice(0, 10))); // Keep last 10
    }

    loadSavedPrompts() {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        // Implement saved prompts UI if needed
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

    updateButtonState(button, text, icon, duration = 2000) {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, duration);
    }

    showMessage(message, type = 'info') {
        // Implement message/notification system
        console.log(`${type}: ${message}`);
    }
}

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.promptUI = new PromptUI();
}); 