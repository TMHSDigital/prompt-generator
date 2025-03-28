import { mediumTypes, getFactors, getBestPractices } from './promptTypes.js';
import { PromptValidator } from './promptValidator.js';

/**
 * Enhanced prompt generation system that implements best practices and smart enhancements.
 * Supports both text and image prompts with medium-specific optimizations.
 */
export class PromptEnhancer {
    /**
     * Creates a new instance of the PromptEnhancer.
     * Initializes the validator and improvements tracking.
     */
    constructor() {
        this.validator = new PromptValidator();
        this.improvements = [];
    }

    /**
     * Enhances a prompt based on its medium and type.
     * @param {string} prompt - The original prompt to enhance
     * @param {string} medium - The medium type ('text' or 'image')
     * @param {string} type - The specific prompt type within the medium
     * @param {Object} options - Additional options for enhancement
     * @param {boolean} [options.versionControl=false] - Whether to add version control information
     * @param {Object} [options.factors={}] - Additional factors to consider
     * @returns {Object} Enhanced prompt data
     * @returns {string} .enhancedPrompt - The enhanced prompt text
     * @returns {string[]} .improvements - List of improvements made
     * @returns {boolean} .wasModified - Whether the prompt was modified
     * @returns {Object} .settings - Additional settings like temperature
     */
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

    /**
     * Sanitizes the input prompt by normalizing whitespace and line endings.
     * @param {string} prompt - The prompt to sanitize
     * @returns {string} Sanitized prompt
     * @private
     */
    sanitizeInput(prompt) {
        return prompt.trim()
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[\r\n]+/g, '\n'); // Normalize line endings
    }

    /**
     * Applies chain-of-thought prompting by breaking down complex tasks.
     * @param {string} prompt - The original prompt
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @returns {string} Enhanced prompt with chain-of-thought structure
     * @private
     */
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

    /**
     * Identifies sub-problems in a complex prompt.
     * @param {string} prompt - The prompt to analyze
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @returns {string[]} Array of identified sub-problems
     * @private
     */
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

    /**
     * Checks if text contains action verbs.
     * @param {string} text - The text to check
     * @returns {boolean} Whether the text contains action verbs
     * @private
     */
    containsActionVerb(text) {
        const actionVerbs = /(create|make|generate|write|develop|implement|design|modify|update|enhance|improve|analyze)/i;
        return actionVerbs.test(text);
    }

    /**
     * Applies enhancement factors to the prompt.
     * @param {string} prompt - The prompt to enhance
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @param {Object} options - Enhancement options
     * @returns {string} Enhanced prompt with applied factors
     * @private
     */
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

    /**
     * Adds a specific enhancement factor to the prompt, checking for existing related content.
     * @param {string} prompt - The prompt to enhance
     * @param {string} factor - The factor to add
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @returns {string} Enhanced prompt with added factor (if applicable)
     * @private
     */
    addFactor(prompt, factor, medium, type) {
        const lowerPrompt = prompt.toLowerCase();
        const trimmedPrompt = prompt.trim();

        const factorMap = {
            objective: (p) => {
                const objectiveStarters = /^\s*(create|generate|write|make|act as|you are|i want you to)/i;
                if (!objectiveStarters.test(trimmedPrompt)) {
                    return `I want you to ${p}`;
                }
                return p; // Already has an objective-like start
            },
            context: (p) => {
                // Context is usually safe to add for structure
                if (!lowerPrompt.includes('context:')) {
                    return `Context: This is a ${type} prompt for ${medium} generation.\n${p}`;
                }
                return p;
            },
            role: (p) => {
                const roleStarters = /\b(act as|you are|role:|persona:)/i;
                if (!roleStarters.test(lowerPrompt)) {
                    return `You are an AI assistant specialized in ${type} ${medium} generation. ${p}`;
                }
                return p; // Already seems to define a role
            },
            tone: (p) => {
                const toneKeywords = /\b(tone:|style:|formal|casual|professional|friendly|serious|humorous)/i;
                if (medium === 'text' && !toneKeywords.test(lowerPrompt)) {
                    return `${p}\nPlease respond in a professional and clear tone.`; // Appending is less intrusive
                }
                return p;
            },
            format: (p) => {
                const formatKeywords = /\b(format:|output:|json|markdown|list|bullet points|paragraph|table|csv|xml)/i;
                if (medium === 'text' && !formatKeywords.test(lowerPrompt)) {
                     return `${p}\nPlease format the output clearly and logically.`; // Appending
                }
                return p;
            },
            style: (p, m) => {
                const styleKeywords = /\b(style:|style is|in the style of|photorealistic|cartoon|anime|sketch|drawing|illustration|3d render|low poly|pixel art|watercolor|oil painting|impressionist|cubist|surrealist)/i;
                if (m === 'image' && !styleKeywords.test(lowerPrompt)) {
                    return `${p}\nStyle: Consider specifying an artistic style (e.g., photorealistic, cartoon, painting).`; // Suggestion instead of default
                }
                return p;
            },
            quality: (p, m) => {
                const qualityKeywords = /\b(quality:|resolution:|4k|8k|hd|high quality|highly detailed|photorealistic quality|low quality)/i;
                 if (m === 'image' && !qualityKeywords.test(lowerPrompt)) {
                    return `${p}\nQuality: Consider specifying the desired quality (e.g., 4K, highly detailed).`; // Suggestion
                }
                return p;
            },
            language: (p) => {
                // Only adds comment suggestion if type is code and keywords missing
                const codeKeywords = /\b(language:|python|javascript|java|c\+\+|c#|ruby|php|go|swift|kotlin|typescript|comment|documentation|documented)/i;
                if (type === 'code' && !codeKeywords.test(lowerPrompt)) {
                    return `${p}\nConsider adding comments and documentation to the code.`;
                }
                return p;
            },
            // Factors below are generally structural or specific requests, less likely to be redundant
            documentation: (p) => type === 'code' && !lowerPrompt.includes('documentation') ? `${p}\nInclude comprehensive documentation and examples.` : p,
            tests: (p) => type === 'code' && !lowerPrompt.includes('test') ? `${p}\nProvide unit tests for the code.` : p,
            subject: (p, m) => m === 'image' && !lowerPrompt.includes('subject') && !lowerPrompt.includes('focus') ? `${p}\nFocus on the main subject with clear composition.` : p,
            composition: (p, m) => m === 'image' && !lowerPrompt.includes('composition') && !lowerPrompt.includes('layout') ? `${p}\nEnsure balanced composition and visual hierarchy.` : p,
            lighting: (p, m) => m === 'image' && !lowerPrompt.includes('lighting') ? `${p}\nOptimize lighting for clarity and atmosphere.` : p,
            mood: (p, m) => m === 'image' && !lowerPrompt.includes('mood') && !lowerPrompt.includes('atmosphere') ? `${p}\nConvey appropriate mood and atmosphere.` : p,
            constraints: (p) => !lowerPrompt.includes('constraint') && !lowerPrompt.includes('limitation') ? `${p}\nConsider the following constraints and limitations.` : p,
            examples: (p) => !lowerPrompt.includes('example') ? `${p}\nHere are some examples to illustrate the desired outcome:` : p
        };

        return factorMap[factor] ? factorMap[factor](prompt, medium) : prompt;
    }

    /**
     * Adds relevant examples to the prompt based on medium and type.
     * @param {string} prompt - The prompt to enhance
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @returns {string} Enhanced prompt with examples
     * @private
     */
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

    /**
     * Gets example templates for a specific medium and type.
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @returns {string[]} Array of example templates
     * @private
     */
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

    /**
     * Applies medium-specific enhancements to the prompt.
     * @param {string} prompt - The prompt to enhance
     * @param {string} medium - The medium type
     * @param {string} type - The prompt type
     * @param {Object} practices - Best practices configuration
     * @returns {string} Enhanced prompt with medium-specific improvements
     * @private
     */
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

    /**
     * Adds weighted components to prompts based on medium type.
     * @param {string} prompt - The prompt to enhance
     * @param {string} medium - The medium type ('text' or 'image')
     * @returns {string} Enhanced prompt with weighted components
     * @private
     */
    addWeightedPrompts(prompt, medium) {
        if (medium === 'image') {
            // Image-specific weighting using explicit numerical weights
            const elements = prompt.split(',').map(p => p.trim());
            return elements.map(element => {
                // Core subject elements get higher weight
                if (/(subject|main|focus|primary)/i.test(element)) {
                    return `(${element}:1.4)`;
                }
                // Quality and style specifications get medium weight
                if (/(quality|resolution|detailed|professional|style)/i.test(element)) {
                    return `(${element}:1.2)`;
                }
                // Modifiers and secondary elements get lower weight
                if (/(background|texture|effect|additional)/i.test(element)) {
                    return `(${element}:0.8)`;
                }
                return element;
            }).join(', ');
        } else {
            // Text-specific weighting using implicit structural emphasis
            const lines = prompt.split('\n');
            const enhancedLines = lines.map(line => {
                // Add structural emphasis for important instructions
                if (/(must|important|essential|key|critical)/i.test(line)) {
                    return `[Important] ${line}`;
                }
                // Add context markers for background information
                if (/(context|background|note)/i.test(line)) {
                    return `[Context] ${line}`;
                }
                // Add emphasis for specific requirements
                if (/(require|need|should|must)/i.test(line)) {
                    return `[Requirement] ${line}`;
                }
                return line;
            });
            return enhancedLines.join('\n');
        }
    }

    /**
     * Enhances image-specific prompts with quality and composition details.
     * @param {string} prompt - The prompt to enhance
     * @param {string} type - The image prompt type
     * @param {Object} practices - Best practices configuration
     * @returns {string} Enhanced image prompt
     * @private
     */
    enhanceImagePrompt(prompt, type, practices) {
        let enhanced = prompt;

        if (type === 'generation' && practices.useWeighting) {
            // Add weighted prompts for better control over visual elements
            enhanced = this.addWeightedPrompts(enhanced, 'image');
            this.improvements.push('Added weighted components for better visual control');
        }

        // Add quality specifications if not present
        if (!/(resolution|quality|detailed)/i.test(enhanced)) {
            enhanced += ', (high resolution:1.2), (professional quality:1.2), (highly detailed:1.2)';
            this.improvements.push('Added quality specifications with appropriate weights');
        }

        // Add composition guidance based on type
        switch (type) {
            case 'generation':
                if (!/(composition|layout|arrangement)/i.test(enhanced)) {
                    enhanced += ', (balanced composition:1.1), (professional lighting:1.1)';
                    this.improvements.push('Added composition and lighting guidance');
                }
                break;
            case 'editing':
                if (!/(preserve|maintain|keep)/i.test(enhanced)) {
                    enhanced += ', (preserve original elements:1.3), (seamless integration:1.2)';
                    this.improvements.push('Added preservation and integration guidance');
                }
                break;
            case 'variation':
                if (!/(consistent|coherent)/i.test(enhanced)) {
                    enhanced += ', (maintain style consistency:1.3), (coherent variations:1.2)';
                    this.improvements.push('Added consistency guidance for variations');
                }
                break;
        }

        return enhanced;
    }

    /**
     * Enhances text-specific prompts with appropriate formatting and emphasis.
     * @param {string} prompt - The prompt to enhance
     * @param {string} type - The text prompt type
     * @param {Object} practices - Best practices configuration
     * @returns {string} Enhanced text prompt
     * @private
     */
    enhanceTextPrompt(prompt, type, practices) {
        let enhanced = prompt;

        // Add implicit weighting through structural emphasis
        enhanced = this.addWeightedPrompts(enhanced, 'text');

        // Add type-specific enhancements
        switch (type) {
            case 'chat':
                if (!/(tone|style|manner)/i.test(enhanced)) {
                    enhanced = `[Important] Please respond in a clear and professional manner.\n${enhanced}`;
                    this.improvements.push('Added tone specification with emphasis');
                }
                break;
            case 'code':
                if (!/(comments|documentation)/i.test(enhanced)) {
                    enhanced = `[Requirement] Include clear comments and documentation.\n${enhanced}`;
                    this.improvements.push('Added documentation requirement with emphasis');
                }
                break;
            case 'completion':
                if (!/(style|voice|tone)/i.test(enhanced)) {
                    enhanced = `[Important] Maintain consistent style and tone with the existing content.\n${enhanced}`;
                    this.improvements.push('Added style consistency requirement');
                }
                break;
        }

        return enhanced;
    }

    /**
     * Truncates a prompt if it exceeds the maximum length.
     * @param {string} prompt - The prompt to check
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} Truncated prompt if necessary
     * @private
     */
    truncateIfNeeded(prompt, maxLength) {
        if (prompt.length > maxLength) {
            this.improvements.push('Truncated to prevent excessive length');
            return prompt.slice(0, maxLength) + '...';
        }
        return prompt;
    }
} 