import { mediumTypes, getFactors } from './promptTypes.js';

export class PromptValidator {
    constructor() {
        this.errors = [];
    }

    validate(prompt, medium, type, options = {}) {
        this.errors = [];
        
        // Basic validation
        if (!this.validateBasics(prompt)) {
            return false;
        }

        // Medium-specific validation
        if (!this.validateMedium(prompt, medium)) {
            return false;
        }

        // Type-specific validation
        if (!this.validateType(prompt, medium, type)) {
            return false;
        }

        // Factor validation
        if (!this.validateFactors(prompt, medium, type, options)) {
            return false;
        }

        return this.errors.length === 0;
    }

    validateBasics(prompt) {
        if (!prompt || typeof prompt !== 'string') {
            this.errors.push('Prompt must be a non-empty string');
            return false;
        }

        if (prompt.length < 3) {
            this.errors.push('Prompt is too short');
            return false;
        }

        if (prompt.length > 2000) {
            this.errors.push('Prompt exceeds maximum length of 2000 characters');
            return false;
        }

        // Check for common issues
        if (/[<>{}]/g.test(prompt)) {
            this.errors.push('Prompt contains invalid characters');
            return false;
        }

        return true;
    }

    validateMedium(prompt, medium) {
        if (!mediumTypes[medium]) {
            this.errors.push(`Invalid medium: ${medium}`);
            return false;
        }

        // Medium-specific checks
        switch (medium) {
            case 'text':
                if (!this.validateTextPrompt(prompt)) {
                    return false;
                }
                break;
            case 'image':
                if (!this.validateImagePrompt(prompt)) {
                    return false;
                }
                break;
        }

        return true;
    }

    validateTextPrompt(prompt) {
        // Check for clear sentence structure
        if (!/[.!?]$/.test(prompt.trim())) {
            this.errors.push('Text prompt should end with proper punctuation');
            return false;
        }

        // Check for minimum word count
        const wordCount = prompt.split(/\s+/).length;
        if (wordCount < 3) {
            this.errors.push('Text prompt should contain at least 3 words');
            return false;
        }

        return true;
    }

    validateImagePrompt(prompt) {
        // Check for descriptive elements
        const hasDescriptiveElements = /(color|style|lighting|composition|mood|atmosphere|quality)/i.test(prompt);
        if (!hasDescriptiveElements) {
            this.errors.push('Image prompt should include descriptive elements');
            return false;
        }

        // Check for subject clarity
        const hasSubject = /\b(a|an|the)\s+\w+/i.test(prompt);
        if (!hasSubject) {
            this.errors.push('Image prompt should clearly specify the subject');
            return false;
        }

        return true;
    }

    validateType(prompt, medium, type) {
        const mediumInfo = mediumTypes[medium];
        if (!mediumInfo?.types[type]) {
            this.errors.push(`Invalid type: ${type} for medium: ${medium}`);
            return false;
        }

        // Type-specific validation
        switch (type) {
            case 'code':
                if (!this.validateCodePrompt(prompt)) {
                    return false;
                }
                break;
            case 'chat':
                if (!this.validateChatPrompt(prompt)) {
                    return false;
                }
                break;
        }

        return true;
    }

    validateCodePrompt(prompt) {
        // Check for language specification
        const hasLanguage = /(in|using|with)\s+(javascript|python|java|c\+\+|ruby|php|html|css|sql)/i.test(prompt);
        if (!hasLanguage) {
            this.errors.push('Code prompt should specify programming language');
            return false;
        }

        return true;
    }

    validateChatPrompt(prompt) {
        // Check for conversational elements
        const hasConversationalElements = /(ask|tell|say|respond|answer|explain)/i.test(prompt);
        if (!hasConversationalElements) {
            this.errors.push('Chat prompt should include conversational elements');
            return false;
        }

        return true;
    }

    validateFactors(prompt, medium, type, options) {
        const factors = getFactors(medium, type);
        let isValid = true;

        factors.forEach(factor => {
            if (!this.hasFactor(prompt, factor, options)) {
                this.errors.push(`Missing factor: ${factor}`);
                isValid = false;
            }
        });

        return isValid;
    }

    hasFactor(prompt, factor, options) {
        const factorPatterns = {
            objective: /(goal|objective|purpose|task|aim):|^(i want|i need|please|could you)/im,
            context: /(context|background|situation):|given that|assuming/i,
            role: /(you are|act as|behave like|take on the role)/i,
            tone: /(tone|style|manner|voice):|professional|casual|formal/i,
            format: /(format|structure|organize|layout):|step[- ]by[- ]step/i,
            language: /(using|in|with)\s+\w+(\s+programming)?(\s+language)?/i,
            documentation: /comments|documentation|explain|describe/i,
            tests: /test cases?|unit tests?|testing/i,
            quality: /(quality|resolution|detailed|professional)/i,
            style: /(style|artistic|aesthetic|visual)/i,
            composition: /(composition|layout|arrangement|positioning)/i,
            lighting: /(lighting|illumination|shadows|brightness)/i,
            mood: /(mood|atmosphere|feeling|emotion|tone)/i,
            constraints: /(constraints?|limitations?|restrictions?|requirements?)/i,
            examples: /(examples?|instances?|cases?|scenarios?)/i
        };

        // Check if the factor is present in the prompt or options
        return factorPatterns[factor]?.test(prompt) || options[factor];
    }

    getErrors() {
        return this.errors;
    }
} 