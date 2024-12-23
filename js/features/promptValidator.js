import { promptTypes } from './promptTypes.js';

export class PromptValidator {
    constructor() {
        this.errors = [];
    }

    validate(prompt, type, options = {}) {
        this.errors = [];
        const typeConfig = promptTypes[type];

        if (!typeConfig) {
            this.errors.push('Invalid prompt type');
            return false;
        }

        // Check length
        if (prompt.length > typeConfig.maxLength) {
            this.errors.push(`Prompt exceeds maximum length of ${typeConfig.maxLength} characters`);
        }

        // Check required components
        typeConfig.requiredComponents.forEach(component => {
            if (!this.hasComponent(prompt, component, options)) {
                this.errors.push(`Missing required component: ${component}`);
            }
        });

        // Validate format
        if (!this.isValidFormat(prompt, typeConfig.defaultFormat)) {
            this.errors.push('Invalid prompt format');
        }

        return this.errors.length === 0;
    }

    hasComponent(prompt, component, options) {
        switch (component) {
            case 'objective':
                return /(^i want|^i need|^please|^could you|^help me)/i.test(prompt);
            case 'context':
                return /(context|background|situation):/i.test(prompt);
            case 'format':
                return true; // Format will be added if missing
            case 'subject':
                return prompt.length > 3; // Basic check for image subject
            case 'style':
                return options.style || /(style|looking like|similar to)/i.test(prompt);
            case 'quality':
                return options.quality || /(quality|resolution|detailed)/i.test(prompt);
            case 'persona':
                return options.persona || /(you are|act as|behave like)/i.test(prompt);
            case 'tone':
                return options.tone || /(formal|informal|professional|casual|friendly)/i.test(prompt);
            default:
                return true;
        }
    }

    isValidFormat(prompt, format) {
        switch (format) {
            case 'text':
                return prompt.length > 0 && prompt.trim().length > 0;
            case 'conversation':
                return !/(```|<|>)/g.test(prompt); // No code blocks or HTML
            case 'detailed':
                return prompt.length >= 3; // Minimum length for detailed prompts
            default:
                return true;
        }
    }

    getErrors() {
        return this.errors;
    }
} 