import { mediumTypes, getFactors } from './promptTypes.js';
import { PromptValidator } from './promptValidator.js';

export class PromptEnhancer {
    constructor() {
        this.validator = new PromptValidator();
        this.improvements = [];
    }

    enhance(prompt, medium, type, options = {}) {
        try {
            this.improvements = [];
            let enhancedPrompt = this.sanitizeInput(prompt);

            // Validate prompt
            if (!this.validator.validate(enhancedPrompt, medium, type, options)) {
                const errors = this.validator.getErrors();
                console.warn('Validation warnings:', errors);
            }

            // Get type configuration
            const typeInfo = mediumTypes[medium]?.types[type];
            if (!typeInfo) {
                throw new Error('Invalid prompt type');
            }

            // Apply factors based on medium and type
            enhancedPrompt = this.applyFactors(enhancedPrompt, medium, type, options);

            // Apply medium-specific enhancements
            enhancedPrompt = this.applyMediumSpecificEnhancements(enhancedPrompt, medium, type);

            // Ensure prompt doesn't exceed max length
            const maxLength = medium === 'text' ? 2000 : 1000;
            enhancedPrompt = this.truncateIfNeeded(enhancedPrompt, maxLength);

            return {
                enhancedPrompt,
                improvements: this.improvements,
                wasModified: enhancedPrompt !== prompt
            };
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            return {
                enhancedPrompt: prompt,
                improvements: ['Error: Could not enhance prompt'],
                wasModified: false
            };
        }
    }

    sanitizeInput(prompt) {
        return prompt.trim()
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[\r\n]+/g, '\n'); // Normalize line endings
    }

    applyFactors(prompt, medium, type, options) {
        let enhanced = prompt;
        const factors = getFactors(medium, type);
        
        factors.forEach(factor => {
            if (!this.validator.hasFactor(enhanced, factor, options)) {
                const original = enhanced;
                enhanced = this.addFactor(enhanced, factor, medium, type);
                if (original !== enhanced) {
                    this.improvements.push(`Added ${factor}`);
                }
            }
        });

        return enhanced;
    }

    addFactor(prompt, factor, medium, type) {
        switch (factor) {
            case 'objective':
                return `I want you to ${prompt}`;
            case 'context':
                return `Context: This is a ${type} prompt for ${medium} generation.\n${prompt}`;
            case 'role':
                return `You are an AI assistant specialized in ${type} ${medium} generation. ${prompt}`;
            case 'tone':
                return `Please respond in a professional and clear tone.\n${prompt}`;
            case 'format':
                return `Please format the output clearly and logically.\n${prompt}`;
            case 'style':
                if (medium === 'image') {
                    return `${prompt}\nStyle: High-quality, professional, detailed`;
                }
                return prompt;
            case 'quality':
                if (medium === 'image') {
                    return `${prompt}\nQuality: 4K, highly detailed, professional quality`;
                }
                return prompt;
            default:
                return prompt;
        }
    }

    applyMediumSpecificEnhancements(prompt, medium, type) {
        let enhanced = prompt;

        switch (medium) {
            case 'image':
                if (type === 'generation') {
                    if (!/(resolution|quality|detailed)/i.test(enhanced)) {
                        enhanced += '\nHigh resolution, professional quality, highly detailed';
                        this.improvements.push('Added quality specifications');
                    }
                }
                break;

            case 'text':
                if (type === 'chat') {
                    if (!/(tone|style|manner)/i.test(enhanced)) {
                        enhanced = `Please respond in a clear and professional manner.\n${enhanced}`;
                        this.improvements.push('Added tone specification');
                    }
                } else if (type === 'code') {
                    if (!/(comments|documentation)/i.test(enhanced)) {
                        enhanced += '\nPlease include clear comments and documentation.';
                        this.improvements.push('Added documentation requirement');
                    }
                }
                break;
        }

        return enhanced;
    }

    truncateIfNeeded(prompt, maxLength) {
        if (prompt.length > maxLength) {
            this.improvements.push('Truncated to prevent excessive length');
            return prompt.slice(0, maxLength) + '...';
        }
        return prompt;
    }
} 