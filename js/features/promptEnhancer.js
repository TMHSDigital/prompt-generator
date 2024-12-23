import { mediumTypes, getFactors, getBestPractices } from './promptTypes.js';
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

            // Get best practices for this medium and type
            const practices = getBestPractices(medium, type);
            
            // Add temperature recommendation if applicable
            if (practices.temperature !== 0.7) { // Only add if different from default
                enhancedPrompt = `[Temperature: ${practices.temperature}]\n${enhancedPrompt}`;
                this.improvements.push(`Set temperature to ${practices.temperature}`);
            }

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

            // Apply chain-of-thought prompting if needed
            if (practices.chainOfThought) {
                enhancedPrompt = this.applyChainOfThought(enhancedPrompt, medium, type);
            }

            // Apply factors based on medium and type
            enhancedPrompt = this.applyFactors(enhancedPrompt, medium, type, options);

            // Add examples if appropriate
            if (practices.useExamples) {
                enhancedPrompt = this.addExamples(enhancedPrompt, medium, type);
            }

            // Apply medium-specific enhancements
            enhancedPrompt = this.applyMediumSpecificEnhancements(enhancedPrompt, medium, type, practices);

            // Add version control comment if enabled
            if (options.versionControl) {
                const version = new Date().toISOString();
                enhancedPrompt = `[Version: ${version}]\n${enhancedPrompt}`;
                this.improvements.push('Added version control information');
            }

            // Ensure prompt doesn't exceed max length
            const maxLength = medium === 'text' ? 2000 : 1000;
            enhancedPrompt = this.truncateIfNeeded(enhancedPrompt, maxLength);

            return {
                enhancedPrompt,
                improvements: this.improvements,
                wasModified: enhancedPrompt !== prompt,
                settings: {
                    temperature: practices.temperature,
                    version: options.versionControl ? version : undefined
                }
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

    applyChainOfThought(prompt, medium, type) {
        const subProblems = this.identifySubProblems(prompt, medium, type);
        if (subProblems.length > 1) {
            let enhanced = 'Let\'s break this down into steps:\n\n';
            subProblems.forEach((problem, index) => {
                enhanced += `${index + 1}. ${problem}\n`;
            });
            enhanced += `\nNow, addressing each point:\n\n${prompt}`;
            this.improvements.push('Applied chain-of-thought structure');
            return enhanced;
        }
        return prompt;
    }

    identifySubProblems(prompt, medium, type) {
        // Split complex prompts into logical sub-tasks
        const problems = [];
        const sentences = prompt.split(/[.!?]+/).filter(s => s.trim());
        
        if (sentences.length > 1) {
            sentences.forEach(sentence => {
                if (this.containsActionVerb(sentence)) {
                    problems.push(sentence.trim());
                }
            });
        }
        
        return problems.length ? problems : [prompt];
    }

    containsActionVerb(text) {
        const actionVerbs = /(create|make|generate|write|develop|implement|design|modify|update|enhance|improve|analyze)/i;
        return actionVerbs.test(text);
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
        const factorMap = {
            objective: (p) => `I want you to ${p}`,
            context: (p) => `Context: This is a ${type} prompt for ${medium} generation.\n${p}`,
            role: (p) => `You are an AI assistant specialized in ${type} ${medium} generation. ${p}`,
            tone: (p) => `Please respond in a professional and clear tone.\n${p}`,
            format: (p) => `Please format the output clearly and logically.\n${p}`,
            style: (p, m) => m === 'image' ? `${p}\nStyle: High-quality, professional, detailed` : p,
            quality: (p, m) => m === 'image' ? `${p}\nQuality: 4K, highly detailed, professional quality` : p,
            language: (p) => `${p}\nUse clear, well-documented code with comments.`,
            documentation: (p) => `${p}\nInclude comprehensive documentation and examples.`,
            tests: (p) => `${p}\nProvide unit tests for the code.`,
            subject: (p) => `${p}\nFocus on the main subject with clear composition.`,
            composition: (p) => `${p}\nEnsure balanced composition and visual hierarchy.`,
            lighting: (p) => `${p}\nOptimize lighting for clarity and atmosphere.`,
            mood: (p) => `${p}\nConvey appropriate mood and atmosphere.`,
            constraints: (p) => `${p}\nConsider the following constraints and limitations.`,
            examples: (p) => `${p}\nHere are some examples to illustrate the desired outcome:`
        };

        return factorMap[factor] ? factorMap[factor](prompt, medium) : prompt;
    }

    addExamples(prompt, medium, type) {
        // Add relevant examples based on medium and type
        const examples = this.getExamplesForType(medium, type);
        if (examples.length) {
            const enhanced = `${prompt}\n\nExamples:\n${examples.join('\n')}`;
            this.improvements.push('Added relevant examples');
            return enhanced;
        }
        return prompt;
    }

    getExamplesForType(medium, type) {
        const exampleMap = {
            text: {
                general: [
                    '- Clear, concise explanation with key points highlighted',
                    '- Step-by-step instructions with examples',
                    '- Structured response with introduction, main points, and conclusion',
                    '- Bullet points for easy readability'
                ],
                completion: [
                    '- Natural continuation maintaining the original style and tone',
                    '- Coherent transition from the existing content',
                    '- Consistent voice and narrative flow'
                ],
                chat: [
                    '- Natural conversational flow with appropriate context',
                    '- Clear response addressing the user\'s query',
                    '- Professional yet friendly tone with relevant information'
                ],
                code: [
                    '- Well-documented function with clear parameters and return values',
                    '- Implementation with comprehensive error handling',
                    '- Clean, maintainable code following best practices',
                    '- Unit tests covering edge cases'
                ]
            },
            image: {
                generation: [
                    '- Professional portrait with soft lighting and natural pose',
                    '- Detailed landscape with atmospheric effects and depth',
                    '- Product shot with clean background and proper lighting',
                    '- Abstract concept with clear visual hierarchy'
                ],
                editing: [
                    '- Color correction maintaining natural appearance',
                    '- Style transfer preserving key elements',
                    '- Background modification with seamless integration'
                ],
                variation: [
                    '- Different perspectives of the same subject',
                    '- Style variations maintaining core elements',
                    '- Mood variations through lighting and color'
                ]
            }
        };

        return exampleMap[medium]?.[type] || [];
    }

    applyMediumSpecificEnhancements(prompt, medium, type, practices) {
        let enhanced = prompt;

        switch (medium) {
            case 'image':
                enhanced = this.enhanceImagePrompt(enhanced, type, practices);
                break;
            case 'text':
                enhanced = this.enhanceTextPrompt(enhanced, type, practices);
                break;
        }

        return enhanced;
    }

    enhanceImagePrompt(prompt, type, practices) {
        let enhanced = prompt;

        if (type === 'generation' && practices.useWeighting) {
            // Add weighted prompts for better control
            enhanced = this.addWeightedPrompts(enhanced);
            this.improvements.push('Added weighted prompt components');
        }

        if (!/(resolution|quality|detailed)/i.test(enhanced)) {
            enhanced += '\nHigh resolution, professional quality, highly detailed';
            this.improvements.push('Added quality specifications');
        }

        return enhanced;
    }

    enhanceTextPrompt(prompt, type, practices) {
        let enhanced = prompt;

        if (type === 'chat' && !/(tone|style|manner)/i.test(enhanced)) {
            enhanced = `Please respond in a clear and professional manner.\n${enhanced}`;
            this.improvements.push('Added tone specification');
        }

        if (type === 'code' && !/(comments|documentation)/i.test(enhanced)) {
            enhanced += '\nPlease include clear comments and documentation.';
            this.improvements.push('Added documentation requirement');
        }

        return enhanced;
    }

    addWeightedPrompts(prompt) {
        // Add weight to important elements using (: :) syntax
        const elements = prompt.split(',').map(p => p.trim());
        return elements.map(element => {
            if (/(quality|resolution|detailed|professional)/i.test(element)) {
                return `(${element}:1.3)`;
            }
            return element;
        }).join(', ');
    }

    truncateIfNeeded(prompt, maxLength) {
        if (prompt.length > maxLength) {
            this.improvements.push('Truncated to prevent excessive length');
            return prompt.slice(0, maxLength) + '...';
        }
        return prompt;
    }
} 