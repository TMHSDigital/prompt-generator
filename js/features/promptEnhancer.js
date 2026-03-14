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

            const practices = getBestPractices(medium, type);

            if (practices.temperature !== 0.7) {
                enhancedPrompt = `[Temperature: ${practices.temperature}]\n${enhancedPrompt}`;
            }

            if (!this.validator.validate(enhancedPrompt, medium, type, options)) {
                const errors = this.validator.getErrors();
                console.warn('Validation warnings:', errors);
            }

            const typeInfo = mediumTypes[medium]?.types[type];
            if (!typeInfo) {
                throw new Error('Invalid prompt type');
            }

            if (practices.chainOfThought) {
                enhancedPrompt = this.applyChainOfThought(enhancedPrompt, medium, type);
            }

            enhancedPrompt = this.applyFactors(enhancedPrompt, medium, type, options);

            enhancedPrompt = this.applyExpansionHints(enhancedPrompt, medium, type);

            if (practices.useExamples) {
                enhancedPrompt = this.addExamples(enhancedPrompt, medium, type);
            }

            enhancedPrompt = this.applyMediumSpecificEnhancements(enhancedPrompt, medium, type, practices);

            const version = options.versionControl ? new Date().toISOString() : undefined;
            if (version) {
                enhancedPrompt = `[Version: ${version}]\n${enhancedPrompt}`;
                this.improvements.push('Added version control information');
            }

            const maxLength = medium === 'text' ? 2000 : 1000;
            enhancedPrompt = this.truncateIfNeeded(enhancedPrompt, maxLength);

            return {
                enhancedPrompt,
                improvements: this.deduplicateImprovements(),
                wasModified: enhancedPrompt !== prompt,
                settings: { temperature: practices.temperature, version }
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
            .replace(/\s+/g, ' ')
            .replace(/[\r\n]+/g, '\n');
    }

    // ── Chain-of-Thought ─────────────────────────────────────────────────

    applyChainOfThought(prompt, medium, type) {
        if (type === 'completion') return prompt;
        if (prompt.length < 80) return prompt;

        const subProblems = this.identifySubProblems(prompt);
        if (subProblems.length < 2) return prompt;

        let enhanced = `${prompt}\n\nBreak down your response into these steps:`;
        subProblems.forEach((problem, i) => {
            enhanced += `\n${i + 1}. ${problem}`;
        });
        enhanced += '\n\nProvide a comprehensive response covering all points.';
        this.improvements.push('Applied structured step-by-step breakdown');
        return enhanced;
    }

    identifySubProblems(prompt) {
        const safe = prompt
            .replace(/\b(e\.g\.|i\.e\.|vs\.|etc\.|Mr\.|Mrs\.|Dr\.|Jr\.|Sr\.)/gi, m => m.replace(/\./g, '\u2024'));

        const conjunctionSplit = safe.split(/\b(?:and also|and then|,\s*and\s+also|;\s*also)\b/i);
        if (conjunctionSplit.length > 1) {
            return conjunctionSplit.map(s => s.replace(/\u2024/g, '.').trim()).filter(s => s.length > 5);
        }

        const sentences = safe.split(/[.!?]+/).filter(s => s.trim().length > 5);
        if (sentences.length > 1) {
            const actionSentences = sentences.filter(s => this.containsActionVerb(s));
            if (actionSentences.length > 1) {
                return actionSentences.map(s => s.replace(/\u2024/g, '.').trim());
            }
        }

        return [prompt];
    }

    containsActionVerb(text) {
        return /\b(create|make|generate|write|develop|implement|design|modify|update|enhance|improve|analyze|build|add|remove|fix|refactor|test|deploy|configure|set up|explain|describe|list|compare|evaluate|optimize|debug|document|review|convert|translate|summarize)\b/i.test(text);
    }

    // ── Factor Application ───────────────────────────────────────────────

    applyFactors(prompt, medium, type, options) {
        let enhanced = prompt;
        const factors = getFactors(medium, type);

        for (const factor of factors) {
            if (!this.validator.hasFactor(enhanced, factor, options)) {
                const original = enhanced;
                enhanced = this.addFactor(enhanced, factor, medium, type);
                if (original !== enhanced) {
                    this.improvements.push(`Added ${factor} guidance`);
                }
            }
        }

        return enhanced;
    }

    addFactor(prompt, factor, medium, type) {
        const lower = prompt.toLowerCase();
        const startsWithVerb = /^\s*(create|generate|write|make|build|develop|implement|design|explain|describe|list|compare|help|tell|show|give|find|add|remove|fix|debug|optimize|refactor|test|draw|paint|render|edit|modify|convert|translate|summarize|continue|finish|complete|act|you are|i want|i need|please|could you)/i;

        const factorMap = {
            // ── Text: General ─────────────────────────────────────
            objective: (p) => {
                if (!startsWithVerb.test(p.trim())) {
                    return `I want you to ${p}`;
                }
                return p;
            },
            tone: (p) => {
                if (medium === 'text' && !/\b(tone:|style:|formal|casual|professional|friendly|serious|humorous|technical|academic)/i.test(lower)) {
                    return `${p}\nUse a professional and clear tone.`;
                }
                return p;
            },
            format: (p) => {
                if (medium === 'text' && !/\b(format:|output:|json|markdown|list|bullet points?|paragraph|table|csv|xml|step[- ]by[- ]step)/i.test(lower)) {
                    return `${p}\nFormat the output clearly and logically.`;
                }
                return p;
            },

            // ── Text: Chat ────────────────────────────────────────
            role: (p) => {
                if (type === 'chat' && !/\b(act as|you are|role:|persona:|pretend|roleplay|role-play)/i.test(lower)) {
                    return `You are a knowledgeable and helpful assistant. ${p}`;
                }
                return p;
            },
            memory: (p) => {
                if (!/\b(remember|recall|previous|earlier|history|context|maintain context)/i.test(lower)) {
                    return `${p}\nReference prior context when relevant and maintain conversation continuity.`;
                }
                return p;
            },

            // ── Text: Completion ──────────────────────────────────
            creativity: (p) => {
                if (!/\b(creative|original|unique|imaginative|novel|inventive|unconventional)/i.test(lower)) {
                    return `${p}\nAllow creative freedom while staying coherent with the existing content.`;
                }
                return p;
            },
            continuity: (p) => {
                if (!/\b(continu|maintain|consistent|follow|in line with|matching|flowing)/i.test(lower)) {
                    return `${p}\nMaintain consistent style and voice with the existing content.`;
                }
                return p;
            },

            // ── Text: Code ────────────────────────────────────────
            language: (p) => {
                if (type === 'code' && !/\b(python|javascript|java|c\+\+|c#|ruby|php|go|swift|kotlin|typescript|rust|sql|html|css)\b/i.test(lower)) {
                    return `${p}\nSpecify the programming language.`;
                }
                return p;
            },
            purpose: (p) => {
                if (type === 'code' && !/\b(purpose|goal|objective|accomplish|description of what)/i.test(lower)) {
                    return `${p}\nInclude a brief description of what the code should accomplish.`;
                }
                return p;
            },
            complexity: () => prompt,
            documentation: (p) => {
                if (type === 'code' && !/\b(document|comment|docstring|jsdoc|readme)/i.test(lower)) {
                    return `${p}\nInclude clear documentation and inline comments.`;
                }
                return p;
            },
            tests: (p) => {
                if (type === 'code' && !/\b(test|spec|assert|verify|coverage)/i.test(lower)) {
                    return `${p}\nProvide unit tests covering key scenarios.`;
                }
                return p;
            },

            // ── Image: Generation ─────────────────────────────────
            subject: (p) => {
                if (medium === 'image' && !/\b(subject|focus|main element|center|focal point)/i.test(lower)) {
                    return `${p}\nFocus on the main subject with clear composition.`;
                }
                return p;
            },
            style: (p) => {
                if (medium === 'image' && !/\b(style:|in the style of|photorealistic|cartoon|anime|sketch|illustration|3d render|low poly|pixel art|watercolor|oil painting|impressionist|minimalist|abstract)/i.test(lower)) {
                    return `${p}\nSpecify an artistic style (e.g., photorealistic, illustration, watercolor).`;
                }
                if (medium === 'text' && type === 'completion' && !/\b(style:|voice:|tone:|maintain|consistent)/i.test(lower)) {
                    return `${p}\nMatch the tone and formatting of the source material.`;
                }
                if (medium === 'text' && type === 'code' && !/\b(style|convention|guideline|standard|pattern|lint)/i.test(lower)) {
                    return `${p}\nFollow standard style guidelines for the language.`;
                }
                return p;
            },
            composition: (p) => {
                if (medium === 'image' && !/\b(composition|layout|arrangement|framing|rule of thirds)/i.test(lower)) {
                    return `${p}\nEnsure balanced composition and visual hierarchy.`;
                }
                return p;
            },
            lighting: (p) => {
                if (medium === 'image' && !/\b(light|shadow|illuminat|bright|dark|exposure|contrast)/i.test(lower)) {
                    return `${p}\nOptimize lighting for clarity and atmosphere.`;
                }
                return p;
            },
            color: (p) => {
                if (medium === 'image' && !/\b(color|colour|palette|hue|tonal|monochrom|vibrant|pastel|saturated)/i.test(lower)) {
                    return `${p}\nConsider specifying a color palette or tonal mood.`;
                }
                return p;
            },
            mood: (p) => {
                if (medium === 'image' && !/\b(mood|atmosphere|feeling|emotion|vibe|ambiance)/i.test(lower)) {
                    return `${p}\nConvey appropriate mood and atmosphere.`;
                }
                return p;
            },
            detail: (p) => {
                if (medium === 'image' && !/\b(detail|intricate|minimalist|highly detailed|fine detail|level of detail)/i.test(lower)) {
                    return `${p}\nSpecify the level of detail (e.g., highly detailed, minimalist).`;
                }
                return p;
            },
            perspective: (p) => {
                if (medium === 'image' && !/\b(perspective|viewpoint|angle|pov|bird.?s?.eye|close[- ]?up|wide angle|aerial|top[- ]down|isometric)/i.test(lower)) {
                    return `${p}\nConsider specifying perspective (e.g., close-up, wide angle, bird's eye).`;
                }
                return p;
            },

            // ── Image: Editing ────────────────────────────────────
            modification: (p) => {
                if (medium === 'image' && !/\b(modif|change|adjust|transform|alter|edit|revis)/i.test(lower)) {
                    return `${p}\nClearly describe what should change and what stays the same.`;
                }
                return p;
            },
            strength: (p) => {
                if (medium === 'image' && !/\b(strength|intensity|subtle|dramatic|slight|strong|heavy|light edit)/i.test(lower)) {
                    return `${p}\nSpecify the intensity of edits (e.g., subtle, dramatic).`;
                }
                return p;
            },
            focus: (p) => {
                if (medium === 'image' && !/\b(focus|primary area|target area|region|area to|zone)/i.test(lower)) {
                    return `${p}\nIdentify the primary areas to modify.`;
                }
                return p;
            },
            preservation: (p) => {
                if (medium === 'image' && !/\b(preserve|maintain|keep|retain|protect|do not change|don.?t alter|original element)/i.test(lower)) {
                    return `${p}\nSpecify which key elements of the original to preserve.`;
                }
                return p;
            },
            blend: (p) => {
                if (medium === 'image' && !/\b(blend|seamless|integrat|merge|natural transition)/i.test(lower)) {
                    return `${p}\nEnsure edits blend naturally with the rest of the image.`;
                }
                return p;
            },

            // ── Image: Variation ──────────────────────────────────
            elements: (p) => {
                if (medium === 'image' && !/\b(element|component|part|aspect|feature to vary|which to keep)/i.test(lower)) {
                    return `${p}\nSpecify which elements to vary and which to keep constant.`;
                }
                return p;
            },
            diversity: (p) => {
                if (medium === 'image' && !/\b(divers|range|variety|different|multiple|varied|how much to vary)/i.test(lower)) {
                    return `${p}\nDefine the desired range of variation.`;
                }
                return p;
            },
            consistency: (p) => {
                if (medium === 'image' && !/\b(consist|coherent|uniform|matching|recognizable|same style)/i.test(lower)) {
                    return `${p}\nMaintain recognizable core elements across variations.`;
                }
                return p;
            },

            // ── Removed / no-ops ──────────────────────────────────
            context: () => prompt,
            constraints: () => prompt,
            examples: () => prompt,
        };

        return factorMap[factor] ? factorMap[factor](prompt) : prompt;
    }

    // ── Expansion Hints ──────────────────────────────────────────────────

    applyExpansionHints(prompt, medium, type) {
        if (prompt.length > 200) return prompt;

        const lower = prompt.toLowerCase();
        let hint = '';

        if (medium === 'text' && type === 'general') {
            if (/\b(blog post|article|essay)\b/i.test(lower)) {
                hint = 'Specify: target audience, approximate word count, and key sections to cover.';
            } else if (/\b(explain|summarize|describe)\b/i.test(lower)) {
                hint = 'Specify: desired depth, target audience, and output format (paragraphs, bullet points, etc.).';
            } else if (prompt.length < 60) {
                hint = 'Consider specifying: audience, desired length, format, and any constraints.';
            }
        } else if (medium === 'text' && type === 'code') {
            if (/\b(function|method|class|module|script)\b/i.test(lower)) {
                hint = 'Include: input/output description, error handling requirements, and example usage.';
            } else if (/\b(debug|fix|error)\b/i.test(lower)) {
                hint = 'Include: the error message or unexpected behavior, expected behavior, and relevant code context.';
            } else if (prompt.length < 60) {
                hint = 'Specify: programming language, expected behavior, and any constraints.';
            }
        } else if (medium === 'image' && type === 'generation' && prompt.length < 80) {
            hint = 'Consider adding: artistic style, lighting conditions, composition, and mood.';
        } else if (medium === 'image' && type === 'editing' && prompt.length < 80) {
            hint = 'Specify: what to change, what to preserve, and desired intensity of edits.';
        } else if (medium === 'image' && type === 'variation' && prompt.length < 80) {
            hint = 'Specify: which elements to vary, desired range, and what to keep consistent.';
        }

        if (hint) {
            this.improvements.push('Added type-specific expansion guidance');
            return `${prompt}\n\n${hint}`;
        }
        return prompt;
    }

    // ── Examples ─────────────────────────────────────────────────────────

    addExamples(prompt, medium, type) {
        const examples = this.getExamplesForType(medium, type);
        if (examples.length) {
            this.improvements.push('Added relevant examples');
            return `${prompt}\n\nExamples:\n${examples.join('\n')}`;
        }
        return prompt;
    }

    getExamplesForType(medium, type) {
        const exampleMap = {
            text: {
                general: [
                    '- Clear, concise explanation with key points highlighted',
                    '- Step-by-step instructions with examples',
                    '- Structured response with introduction, main points, and conclusion'
                ],
                completion: [
                    '- Natural continuation maintaining the original style and tone',
                    '- Coherent transition from the existing content'
                ],
                chat: [
                    '- Natural conversational flow with appropriate context',
                    '- Professional yet friendly tone with relevant information'
                ],
                code: [
                    '- Well-documented function with clear parameters and return values',
                    '- Implementation with comprehensive error handling',
                    '- Unit tests covering edge cases'
                ]
            },
            image: {
                generation: [
                    '- Professional portrait with soft lighting and natural pose',
                    '- Detailed landscape with atmospheric effects and depth'
                ],
                editing: [
                    '- Color correction maintaining natural appearance',
                    '- Background modification with seamless integration'
                ],
                variation: [
                    '- Different perspectives of the same subject',
                    '- Style variations maintaining core elements'
                ]
            }
        };

        return exampleMap[medium]?.[type] || [];
    }

    // ── Medium-Specific Enhancements ─────────────────────────────────────

    applyMediumSpecificEnhancements(prompt, medium, type, practices) {
        switch (medium) {
            case 'image':
                return this.enhanceImagePrompt(prompt, type);
            case 'text':
                return this.enhanceTextPrompt(prompt, type);
            default:
                return prompt;
        }
    }

    enhanceImagePrompt(prompt, type) {
        let enhanced = prompt;
        const lower = enhanced.toLowerCase();

        if (!/\b(quality:|resolution:|4k|8k|hd|high quality|highly detailed|low quality)/i.test(lower)) {
            enhanced += "\nQuality: Specify desired quality (e.g., 'high resolution', '4K', 'highly detailed').";
            this.improvements.push('Added quality guidance');
        }

        return enhanced;
    }

    enhanceTextPrompt(prompt, type) {
        let enhanced = prompt;
        const lower = enhanced.toLowerCase();

        switch (type) {
            case 'chat':
                if (!/\b(tone:|manner:|formal|casual|professional|friendly)/i.test(lower)) {
                    enhanced += '\nSpecify the desired conversational tone or manner.';
                    this.improvements.push('Added conversational tone guidance');
                }
                break;
            case 'code':
                if (!/\b(comment|documentation|docstring|jsdoc)/i.test(lower)) {
                    enhanced += '\nConsider requesting inline comments or documentation.';
                    this.improvements.push('Added documentation guidance');
                }
                break;
            case 'completion':
                if (!/\b(style:|voice:|tone:|maintain|consistent)/i.test(lower)) {
                    enhanced += '\nMaintain a consistent style and tone with the source material.';
                    this.improvements.push('Added style consistency guidance');
                }
                break;
        }

        return enhanced;
    }

    // ── Utilities ────────────────────────────────────────────────────────

    truncateIfNeeded(prompt, maxLength) {
        if (prompt.length > maxLength) {
            this.improvements.push('Truncated to prevent excessive length');
            return prompt.slice(0, maxLength) + '...';
        }
        return prompt;
    }

    deduplicateImprovements() {
        const dominated = new Set();

        for (let i = 0; i < this.improvements.length; i++) {
            const a = this.improvements[i].toLowerCase();
            for (let j = i + 1; j < this.improvements.length; j++) {
                const b = this.improvements[j].toLowerCase();
                if (a.includes(b) || b.includes(a)) {
                    dominated.add(a.length < b.length ? i : j);
                }
            }
        }

        return this.improvements.filter((_, i) => !dominated.has(i));
    }
}
