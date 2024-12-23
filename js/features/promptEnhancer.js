import { promptTypes } from './promptTypes.js';
import { enhancementRules } from './enhancementRules.js';
import { PromptValidator } from './promptValidator.js';

export class PromptEnhancer {
    constructor() {
        this.validator = new PromptValidator();
        this.improvements = [];
    }

    enhance(prompt, type = 'general', options = {}) {
        try {
            this.improvements = [];
            let enhancedPrompt = this.sanitizeInput(prompt);

            // Validate prompt
            if (!this.validator.validate(enhancedPrompt, type, options)) {
                const errors = this.validator.getErrors();
                console.warn('Validation warnings:', errors);
            }

            // Get type configuration
            const typeConfig = promptTypes[type];
            if (!typeConfig) {
                throw new Error('Invalid prompt type');
            }

            // Apply required components
            enhancedPrompt = this.applyRequiredComponents(enhancedPrompt, typeConfig, type);

            // Apply optional components if specified in options
            enhancedPrompt = this.applyOptionalComponents(enhancedPrompt, typeConfig, options, type);

            // Apply type-specific enhancements
            enhancedPrompt = this.applyTypeSpecificEnhancements(enhancedPrompt, type);

            // Ensure prompt doesn't exceed max length
            enhancedPrompt = this.truncateIfNeeded(enhancedPrompt, typeConfig.maxLength);

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

    applyRequiredComponents(prompt, typeConfig, type) {
        let enhanced = prompt;
        
        typeConfig.requiredComponents.forEach(component => {
            if (enhancementRules[component]) {
                const rule = enhancementRules[component];
                const hasComponent = Object.values(rule.patterns)
                    .some(pattern => pattern.test(enhanced));

                if (!hasComponent) {
                    const original = enhanced;
                    enhanced = rule.enhance(enhanced, type);
                    if (original !== enhanced) {
                        this.improvements.push(`Added ${component}`);
                    }
                }
            }
        });

        return enhanced;
    }

    applyOptionalComponents(prompt, typeConfig, options, type) {
        let enhanced = prompt;

        typeConfig.optionalComponents.forEach(component => {
            if (options[component] && enhancementRules[component]) {
                const rule = enhancementRules[component];
                const hasComponent = Object.values(rule.patterns)
                    .some(pattern => pattern.test(enhanced));

                if (!hasComponent) {
                    const original = enhanced;
                    enhanced = rule.enhance(enhanced, type);
                    if (original !== enhanced) {
                        this.improvements.push(`Added optional ${component}`);
                    }
                }
            }
        });

        return enhanced;
    }

    applyTypeSpecificEnhancements(prompt, type) {
        let enhanced = prompt;

        // Apply type-specific enhancements
        switch (type) {
            case 'image':
                if (!enhancementRules.quality.patterns.hasQuality.test(enhanced)) {
                    enhanced = enhancementRules.quality.enhance(enhanced, type);
                    this.improvements.push('Enhanced image quality specifications');
                }
                break;

            case 'chat':
                if (!enhancementRules.style.patterns.hasStyle.test(enhanced)) {
                    enhanced = enhancementRules.style.enhance(enhanced, type);
                    this.improvements.push('Enhanced conversation style');
                }
                break;

            case 'completion':
                // Add any completion-specific enhancements
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