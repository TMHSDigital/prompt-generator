import { mediumTypes, getFactors } from './promptTypes.js';

export class PromptValidator {
    constructor() {
        this.errors = [];
    }

    validate(prompt, medium, type, options = {}) {
        this.errors = [];
        const typeInfo = mediumTypes[medium]?.types[type];

        if (!typeInfo) {
            this.errors.push('Invalid prompt type');
            return false;
        }

        // Check length
        const maxLength = medium === 'text' ? 2000 : 1000;
        if (prompt.length > maxLength) {
            this.errors.push(`Prompt exceeds maximum length of ${maxLength} characters`);
        }

        // Check required factors
        const factors = getFactors(medium, type);
        factors.forEach(factor => {
            if (!this.hasFactor(prompt, factor, options)) {
                this.errors.push(`Missing required factor: ${factor}`);
            }
        });

        return this.errors.length === 0;
    }

    hasFactor(prompt, factor, options) {
        switch (factor) {
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
            case 'role':
                return options.role || /(you are|act as|behave like)/i.test(prompt);
            case 'tone':
                return options.tone || /(formal|informal|professional|casual|friendly)/i.test(prompt);
            case 'language':
                return options.language || /(in|using|with) (language|programming language|syntax):/i.test(prompt);
            case 'purpose':
                return options.purpose || /(purpose|goal|objective|aim):/i.test(prompt);
            case 'documentation':
                return options.documentation || /(comments|documentation|explain)/i.test(prompt);
            case 'tests':
                return options.tests || /(test cases|unit tests|testing)/i.test(prompt);
            case 'composition':
                return options.composition || /(composition|layout|arrangement|positioning)/i.test(prompt);
            case 'lighting':
                return options.lighting || /(lighting|illumination|shadows|brightness)/i.test(prompt);
            case 'color':
                return options.color || /(color|palette|tones|hues)/i.test(prompt);
            case 'mood':
                return options.mood || /(mood|atmosphere|feeling|emotion)/i.test(prompt);
            case 'perspective':
                return options.perspective || /(perspective|angle|view|viewpoint)/i.test(prompt);
            case 'modification':
                return options.modification || /(modify|change|adjust|transform)/i.test(prompt);
            case 'strength':
                return options.strength || /(strength|intensity|power|level)/i.test(prompt);
            case 'preservation':
                return options.preservation || /(preserve|maintain|keep|retain)/i.test(prompt);
            case 'blend':
                return options.blend || /(blend|mix|combine|merge)/i.test(prompt);
            case 'diversity':
                return options.diversity || /(diverse|different|variety|range)/i.test(prompt);
            case 'consistency':
                return options.consistency || /(consistent|coherent|uniform|matching)/i.test(prompt);
            default:
                return true;
        }
    }

    getErrors() {
        return this.errors;
    }
} 