/**
 * Prompt Suggestions Module
 * Provides rule-based suggestions for improving prompts based on keywords and patterns.
 * Runs completely client-side.
 */

class AIPromptHelper {
    constructor() {
        // Flag to indicate if patterns and classifier are ready
        this.initialized = false; 
        this.classifier = null;
        this.promptPatterns = null;
    }

    /**
     * Initialize the suggestion system by loading patterns and setting up the classifier.
     * This is now a synchronous operation.
     */
    init() {
        if (this.initialized) return;

        try {
            // Load prompt patterns
            this.promptPatterns = this.loadPromptPatterns();
            
            // Initialize the classifier
            this.classifier = this.createClassifier();
            
            this.initialized = true;
            console.log("Prompt suggestion system initialized.");

        } catch (error) {
            console.error('Failed to initialize prompt suggestion system:', error);
            // Keep initialized false so attempts might be made again later if applicable
        }
    }

    /**
     * Load prompt patterns.
     * These are predefined patterns and suggestions.
     */
    loadPromptPatterns() {
        // Simple example patterns
        return {
            'text': {
                'general': [
                    { pattern: 'explain', suggestion: 'Be specific about the audience and desired depth' },
                    { pattern: 'write', suggestion: 'Specify tone, length, and format' },
                    { pattern: 'summarize', suggestion: 'Specify the key points to focus on' }
                ],
                'completion': [
                    { pattern: 'continue', suggestion: 'Provide context and desired outcome' },
                    { pattern: 'finish', suggestion: 'Specify the ending tone and themes' }
                ],
                'chat': [
                    { pattern: 'persona', suggestion: 'Define personality traits and knowledge base' },
                    { pattern: 'conversation', suggestion: 'Set context and relationship between participants' }
                ],
                'code': [
                    { pattern: 'function', suggestion: 'Specify language, paradigm, and error handling' },
                    { pattern: 'debug', suggestion: 'Include error messages and expected behavior' },
                    { pattern: 'optimize', suggestion: 'Define metrics for optimization (speed, memory, etc)' }
                ]
            },
            'image': {
                'generation': [
                    { pattern: 'create', suggestion: 'Specify style, lighting, and composition' },
                    { pattern: 'design', suggestion: 'Include color palette and mood' }
                ],
                'editing': [
                    { pattern: 'change', suggestion: 'Be specific about what elements to preserve' },
                    { pattern: 'remove', suggestion: 'Describe what should replace the removed elements' }
                ],
                'variation': [
                    { pattern: 'similar', suggestion: 'Specify which elements to vary and which to keep' },
                    { pattern: 'alternative', suggestion: 'Define parameters for variation (color, style, etc)' }
                ]
            }
        };
    }

    /**
     * Create a simple rule-based classifier for prompt type detection.
     */
    createClassifier() {
        // Simple rule-based system based on keywords
        return {
            classify: (text) => {
                // Convert to lowercase for matching
                const lowerText = text.toLowerCase();
                
                // Simple keyword-based classifications
                if (lowerText.includes('code') || lowerText.includes('function') || lowerText.includes('program')) {
                    return 'code';
                } else if (lowerText.includes('chat') || lowerText.includes('conversation')) {
                    return 'chat';
                } else if (lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('photo')) {
                    // Basic check - might need refinement if medium is already known
                    return 'generation'; // Default image type
                } else if (lowerText.includes('continue') || lowerText.includes('finish')) {
                    return 'completion';
                } else {
                    return 'general'; // Default text type
                }
            }
        };
    }

    /**
     * Get suggestions for a prompt based on rules and patterns.
     * @param {string} prompt - The user's prompt
     * @param {string} medium - Text or Image
     * @param {string} type - Prompt type
     * @returns {Array<string>} - Array of suggestion strings
     */
    getSuggestions(prompt, medium, type) {
        // Ensure initialization
        if (!this.initialized) {
            this.init();
            // If init failed, return a generic suggestion
            if (!this.initialized) return ['Ensure the suggestion system initialized correctly.']; 
        }
        
        try {
            const suggestions = [];
            const lowerPrompt = prompt.toLowerCase();
            
            // Get relevant patterns, falling back to text/general if specific ones don't exist
            const mediumPatterns = this.promptPatterns[medium] || this.promptPatterns['text'] || {};
            const typePatterns = mediumPatterns[type] || mediumPatterns['general'] || [];
            
            // Add type-specific suggestions based on keyword patterns
            typePatterns.forEach(({ pattern, suggestion }) => {
                if (lowerPrompt.includes(pattern.toLowerCase())) {
                    // Avoid duplicate suggestions
                    if (!suggestions.includes(suggestion)) {
                        suggestions.push(suggestion);
                    }
                }
            });
            
            // Add general contextual suggestions
            if (prompt.length < 20) {
                const suggestion = 'Add more details to get better results';
                if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
            }
            
            if (medium === 'image' && !lowerPrompt.includes('style')) {
                 const suggestion = 'Specify a style (e.g., photorealistic, cartoon, watercolor) for more consistent results';
                 if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
            }
            
            if (medium === 'text' && type !== 'chat' && !lowerPrompt.includes('format')) {
                 const suggestion = 'Specify a format (e.g., paragraph, bullet points, JSON)';
                 if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
            }

            // Limit the number of suggestions to avoid overwhelming the user
            const MAX_SUGGESTIONS = 5;
            return suggestions.slice(0, MAX_SUGGESTIONS);

        } catch (error) {
            console.error('Error generating suggestions:', error);
            // Return a generic suggestion on error
            return ['Consider adding more specificity or context to your prompt.'];
        }
    }

    /**
     * Analyze a prompt to suggest the best type using the simple classifier.
     * @param {string} prompt - The user's prompt
     * @returns {Object} - Suggested { medium, type } or null if unable to classify
     */
    analyzePromptType(prompt) {
         // Ensure initialization
        if (!this.initialized) {
            this.init();
             if (!this.initialized) return null; // Init failed
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return null;
        }

        try {
            const classifiedType = this.classifier.classify(prompt);

            // Determine medium based on classified type (simple mapping)
            let suggestedMedium = 'text'; // Default to text
            if (['generation', 'editing', 'variation'].includes(classifiedType) || prompt.toLowerCase().includes('image')) {
                 suggestedMedium = 'image';
            }
           
            // Refine type based on medium patterns
            let suggestedType = 'general'; // Default type within medium
            if (suggestedMedium === 'image') {
                if (this.promptPatterns.image && this.promptPatterns.image[classifiedType]) {
                    suggestedType = classifiedType;
                } else {
                    suggestedType = 'generation'; // Fallback image type
                }
            } else { // medium is text
                 if (this.promptPatterns.text && this.promptPatterns.text[classifiedType]) {
                    suggestedType = classifiedType;
                } else {
                    suggestedType = 'general'; // Fallback text type
                }
            }

            return { medium: suggestedMedium, type: suggestedType };

        } catch (error) {
            console.error('Error analyzing prompt type:', error);
            return null;
        }
    }
}

// Export a single instance
const aiPromptHelper = new AIPromptHelper();
export default aiPromptHelper; 