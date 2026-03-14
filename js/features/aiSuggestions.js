/**
 * Prompt Suggestions Module
 * Rule-based suggestions and type detection. Runs completely client-side.
 */

class AIPromptHelper {
    constructor() {
        this.initialized = false;
        this.classifier = null;
        this.promptPatterns = null;
    }

    init() {
        if (this.initialized) return;

        try {
            this.promptPatterns = this.loadPromptPatterns();
            this.classifier = this.createClassifier();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize prompt suggestion system:', error);
        }
    }

    loadPromptPatterns() {
        return {
            text: {
                general: [
                    { pattern: 'explain', suggestion: 'Be specific about the audience and desired depth' },
                    { pattern: 'write', suggestion: 'Specify tone, length, and format' },
                    { pattern: 'summarize', suggestion: 'Specify the key points to focus on' },
                    { pattern: 'compare', suggestion: 'Define comparison criteria and output format' },
                    { pattern: 'list', suggestion: 'Specify how many items and level of detail per item' },
                    { pattern: 'translate', suggestion: 'Specify source and target languages' },
                ],
                completion: [
                    { pattern: 'continue', suggestion: 'Provide context and desired outcome' },
                    { pattern: 'finish', suggestion: 'Specify the ending tone and themes' },
                    { pattern: 'complete', suggestion: 'Indicate desired length and style consistency' },
                ],
                chat: [
                    { pattern: 'persona', suggestion: 'Define personality traits and knowledge base' },
                    { pattern: 'conversation', suggestion: 'Set context and relationship between participants' },
                    { pattern: 'roleplay', suggestion: 'Define the scenario, rules, and boundaries' },
                ],
                code: [
                    { pattern: 'function', suggestion: 'Specify language, paradigm, and error handling' },
                    { pattern: 'debug', suggestion: 'Include error messages and expected behavior' },
                    { pattern: 'optimize', suggestion: 'Define metrics for optimization (speed, memory, etc)' },
                    { pattern: 'refactor', suggestion: 'Specify goals: readability, performance, or maintainability' },
                    { pattern: 'api', suggestion: 'Define endpoints, methods, auth, and response format' },
                    { pattern: 'test', suggestion: 'Specify framework, coverage targets, and edge cases' },
                ],
            },
            image: {
                generation: [
                    { pattern: 'create', suggestion: 'Specify style, lighting, and composition' },
                    { pattern: 'design', suggestion: 'Include color palette and mood' },
                    { pattern: 'portrait', suggestion: 'Specify pose, expression, and background' },
                    { pattern: 'landscape', suggestion: 'Define atmosphere, time of day, and depth' },
                ],
                editing: [
                    { pattern: 'change', suggestion: 'Be specific about what elements to preserve' },
                    { pattern: 'remove', suggestion: 'Describe what should replace the removed elements' },
                    { pattern: 'retouch', suggestion: 'Specify intensity and areas to focus on' },
                ],
                variation: [
                    { pattern: 'similar', suggestion: 'Specify which elements to vary and which to keep' },
                    { pattern: 'alternative', suggestion: 'Define parameters for variation (color, style, etc)' },
                    { pattern: 'version', suggestion: 'Describe how each version should differ' },
                ],
            },
        };
    }

    createClassifier() {
        const langKeywords = /\b(python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|php|sql|swift|kotlin|html|css|react|vue|angular|node|django|flask|spring)\b/i;
        const codeVerbs = /\b(code|function|method|class|def|algorithm|sort|filter|implement|refactor|debug|deploy|compile|parse|api|endpoint|script|module|component|hook|query|schema|migration)\b/i;
        const codePatterns = /\b(write me|create a|build a|implement a|make a|develop a)\b.*\b(code|function|script|program|app|api|server|class|component|module|database|query)\b/i;

        const imageKeywords = /\b(image|picture|photo|illustration|portrait|landscape|render|artwork|scene|painting|drawing|sketch|wallpaper|poster|logo|icon|banner|thumbnail)\b/i;
        const imageVerbs = /\b(draw|paint|render|visualize|illustrate|depict)\b/i;

        const editKeywords = /\b(edit|retouch|adjust|fix|correct|crop|resize|filter|overlay|touch up|color correct|remove background)\b/i;
        const variationKeywords = /\b(variation|variant|similar to|alternative|different version|remix|restyle|reimagine)\b/i;

        const chatKeywords = /\b(chat|conversation|roleplay|role-play|persona|act as|you are|pretend|simulate|interview|dialogue|talk to me as)\b/i;
        const completionKeywords = /\b(continue|finish|complete|extend|carry on|pick up where|next part|keep going|what happens next)\b/i;

        return {
            classify: (text) => {
                const lower = text.toLowerCase();

                if (codePatterns.test(text) || langKeywords.test(text) || codeVerbs.test(lower)) {
                    return { medium: 'text', type: 'code' };
                }

                if (chatKeywords.test(lower)) {
                    return { medium: 'text', type: 'chat' };
                }

                if (completionKeywords.test(lower)) {
                    return { medium: 'text', type: 'completion' };
                }

                const hasImageContext = imageKeywords.test(lower) || imageVerbs.test(lower);

                if (hasImageContext && variationKeywords.test(lower)) {
                    return { medium: 'image', type: 'variation' };
                }
                if (hasImageContext && editKeywords.test(lower)) {
                    return { medium: 'image', type: 'editing' };
                }
                if (hasImageContext) {
                    return { medium: 'image', type: 'generation' };
                }

                return { medium: 'text', type: 'general' };
            },
        };
    }

    getSuggestions(prompt, medium, type) {
        if (!this.initialized) {
            this.init();
            if (!this.initialized) return [];
        }

        try {
            const suggestions = [];
            const lowerPrompt = prompt.toLowerCase();

            const mediumPatterns = this.promptPatterns[medium] || this.promptPatterns.text || {};
            const typePatterns = mediumPatterns[type] || mediumPatterns.general || [];

            for (const { pattern, suggestion } of typePatterns) {
                if (lowerPrompt.includes(pattern.toLowerCase()) && !suggestions.includes(suggestion)) {
                    suggestions.push(suggestion);
                }
            }

            if (prompt.length < 20) {
                const s = 'Add more details to get better results';
                if (!suggestions.includes(s)) suggestions.push(s);
            }

            if (medium === 'image' && !lowerPrompt.includes('style')) {
                const s = 'Specify a style (e.g., photorealistic, cartoon, watercolor)';
                if (!suggestions.includes(s)) suggestions.push(s);
            }

            if (medium === 'text' && type !== 'chat' && !lowerPrompt.includes('format')) {
                const s = 'Specify a format (e.g., paragraph, bullet points, JSON)';
                if (!suggestions.includes(s)) suggestions.push(s);
            }

            return suggestions.slice(0, 5);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return [];
        }
    }

    analyzePromptType(prompt) {
        if (!this.initialized) {
            this.init();
            if (!this.initialized) return null;
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return null;
        }

        try {
            return this.classifier.classify(prompt);
        } catch (error) {
            console.error('Error analyzing prompt type:', error);
            return null;
        }
    }
}

const aiPromptHelper = new AIPromptHelper();
export default aiPromptHelper;
