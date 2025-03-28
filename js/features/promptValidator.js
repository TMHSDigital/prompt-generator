import { mediumTypes, getFactors } from './promptTypes.js';

export class PromptValidator {
    constructor() {
        this.errors = [];
    }

    validate(prompt, medium, type, options = {}) {
        this.errors = [];
        
        // Basic validation
        if (!this.validateBasics(prompt)) {
            // Basic failures are usually critical enough to stop
            return false; 
        }

        // Medium/Type existence validation
        if (!this.validateMediumAndTypeExist(medium, type)) {
            return false;
        }

        // Note: Removed calls to specific medium/type content validation (e.g., validateTextPrompt)
        // Note: Removed call to validateFactors as its strictness was not helpful.
        // The hasFactor method is still used by the PromptEnhancer.

        // Validation now only fails on basic errors or invalid medium/type.
        return this.errors.length === 0;
    }

    validateBasics(prompt) {
        if (!prompt || typeof prompt !== 'string') {
            this.errors.push('Prompt must be a non-empty string');
            return false;
        }

        if (prompt.length < 3) {
            // Changed from error to warning - short prompts might be intentional
            console.warn('Validation warning: Prompt is very short.');
            // return false; // Don't fail validation for short prompts
        }

        const MAX_PROMPT_LENGTH = 4000; // Increased max length slightly
        if (prompt.length > MAX_PROMPT_LENGTH) {
            this.errors.push(`Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`);
            return false;
        }

        // Check for potentially problematic characters (less strict than before)
        // Allowed common markdown/formatting characters: *, _, `, #, -, [, ], (, )
        if (/[<>{}|\]/g.test(prompt)) { 
            // Changed from error to warning
            console.warn('Validation warning: Prompt contains potentially problematic characters (<, >, {, }, |, \).');
           // return false; // Don't fail validation for these characters
        }

        return true;
    }

    /**
     * Validates that the medium and type combination exists in promptTypes definition.
     */
    validateMediumAndTypeExist(medium, type) {
        if (!mediumTypes[medium]) {
            this.errors.push(`Invalid medium specified: ${medium}`);
            return false;
        }
        const mediumInfo = mediumTypes[medium];
        if (!mediumInfo?.types[type]) {
            this.errors.push(`Invalid type: '${type}' for medium: '${medium}'`);
            return false;
        }
        return true;
    }

    // Removed validateMedium, validateTextPrompt, validateImagePrompt
    // Removed validateType, validateCodePrompt, validateChatPrompt
    // Removed validateFactors (its logic was moved/simplified)

    /**
     * Checks if a prompt likely contains keywords related to a specific factor.
     * Used by PromptEnhancer to avoid adding redundant suggestions.
     * @param {string} prompt 
     * @param {string} factor 
     * @param {object} options (Currently unused here, kept for potential future use)
     * @returns {boolean}
     */
    hasFactor(prompt, factor, options = {}) { // Added default for options
        const factorPatterns = {
            objective: /(goal|objective|purpose|task|aim|intent|target):|^(i want|i need|please|could you|help me|create|make|generate|write|act as|you are)/im,
            context: /(context|background|situation|scenario|environment|setting|given|assuming|when|if):|for use in|in the context of/i,
            role: /(you are|act as|behave like|take on the role|function as|serve as|perform as|work as|role:|persona:)/i, // Added role:/persona:
            tone: /(tone:|style:|manner:|voice:|approach:|attitude:|professional|casual|formal|friendly|serious|playful|technical|humorous)/i, // Added humorous
            format: /(format:|structure:|organize:|layout:|arrange:|present:|display:|output:|json|markdown|list|bullet points?|paragraph|table|csv|xml|step[- ]by[- ]step|in (points|sections|parts))/i, // Added output keywords
            language: /(language:|using|in|with|written in|coded in|programmed in)\s+(javascript|python|java|c\+\+|c#|ruby|php|go|swift|kotlin|typescript|html|css|sql)/i, // Added language:
            documentation: /(comments?|documentation|explain|describe|clarify|elaborate|annotate|document|docstring)/i, // Added docstring, comment(s)
            tests: /(test cases?|unit tests?|testing|verification|validation|assert|check)/i,
            quality: /(quality:|resolution:|4k|8k|hd|high quality|highly detailed|photorealistic quality|low quality|detailed|professional|refined|polished|high[- ]end|premium)/i, // Merged keywords
            style: /(style:|style is|in the style of|artistic|aesthetic|visual|design|look|appearance|theme|photorealistic|cartoon|anime|sketch|drawing|illustration|3d render|low poly|pixel art|watercolor|oil painting|impressionist|cubist|surrealist)/i, // Merged keywords
            composition: /(composition:|layout:|arrangement:|positioning:|framing:|structure:|balance:|harmony:|perspective:|viewpoint:|angle:|pov:|view:|shot:|camera:)/i, // Merged keywords
            lighting: /(lighting:|illumination:|shadows:|brightness:|exposure:|contrast:|highlights:|ambient:)/i,
            mood: /(mood:|atmosphere:|feeling:|emotion:|tone:|ambiance:|vibe:|character:)/i, // Note: Overlaps with text tone
            constraints: /(constraints?:|limitations?:|restrictions?:|requirements?:|boundaries:|parameters:|scope:|must not|avoid|do not|don't)/i, // Added negative constraints
            examples: /(examples?:|instances?:|cases?:|scenarios?:|illustrations?:|demonstrations?:|samples?:|e\.g\.|i\.e\.)/i, // Added e.g./i.e.
            creativity: /(creative|innovative|original|unique|novel|imaginative|inventive|unconventional|outside the box)/i, // Added more synonyms
            continuity: /(continue|maintain|follow|consistent with|in line with|matching|flowing|based on the previous|building upon)/i, // Added context phrases
            memory: /(remember|recall|previous|earlier|before|maintain context|keep in mind|past conversation|history)/i, // Added history
            complexity: /(simple|complex|basic|advanced|intermediate|difficulty level|sophistication|easy|hard|beginner|expert)/i, // Added more levels
            detail: /(detailed|specific|precise|exact|thorough|comprehensive|complete|in detail|elaborate on|provide details)/i, // Added phrases
            perspective: /(perspective:|viewpoint:|angle:|pov:|view:|shot:|camera:|from the perspective of|as seen by|first[- ]person|third[- ]person)/i, // Merged & expanded
            modification: /(modify|change|adjust|transform|alter|edit|revise|update|rewrite|improve|refactor)/i, // Added more synonyms
            strength: /(strength|intensity|power|level|magnitude|force|impact|degree|amount|very|extremely|slightly|subtle)/i, // Added adverbs
            preservation: /(preserve|maintain|keep|retain|protect|safeguard|conserve|do not change|don't alter)/i, // Added negative phrases
            blend: /(blend|mix|combine|merge|integrate|fuse|unite|synthesize|incorporate)/i, // Added synonyms
            diversity: /(diverse|different|variety|range|assortment|mixture|varied|multiple|various|several)/i, // Added synonyms
            consistency: /(consistent|coherent|uniform|matching|aligned|harmonious|synchronized|the same style|similar tone)/i // Added phrases
        };

        // Check if the factor regex pattern exists and tests true against the prompt
        // Removed the check for options[factor] as its usage wasn't confirmed and complicates the logic.
        // If options need to influence factor presence, it should be handled explicitly where validate/enhance is called.
        return factorPatterns[factor] ? factorPatterns[factor].test(prompt) : false;
    }

    getErrors() {
        return this.errors;
    }
} 