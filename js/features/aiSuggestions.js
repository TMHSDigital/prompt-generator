/**
 * AI Suggestions Module
 * Uses TensorFlow.js to provide AI-powered prompt suggestions
 * Runs completely client-side for privacy and offline capability
 */

// Minimal model for text classification and suggestions
// Uses a pre-trained universal sentence encoder (USE) with a small classification head
class AIPromptHelper {
    constructor() {
        this.modelLoaded = false;
        this.encoder = null;
        this.classifier = null;
        this.promptPatterns = null;
        this.isLoading = false;
        this.loadCallbacks = [];
    }

    /**
     * Initialize the AI model
     * Only loads when needed to conserve resources
     */
    async init() {
        if (this.modelLoaded || this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Load TensorFlow.js dynamically to avoid blocking initial page load
            await this.loadTensorFlow();
            
            // Load the universal sentence encoder
            this.encoder = await this.loadEncoder();
            
            // Load prompt patterns
            this.promptPatterns = await this.loadPromptPatterns();
            
            // Initialize the classifier
            this.classifier = await this.createClassifier();
            
            this.modelLoaded = true;
            
            // Notify any pending callbacks
            this.loadCallbacks.forEach(callback => callback());
            this.loadCallbacks = [];
        } catch (error) {
            console.error('Failed to load AI model:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load TensorFlow.js dynamically
     */
    async loadTensorFlow() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.tf) {
                resolve();
                return;
            }
            
            // Load TensorFlow.js script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js';
            script.async = true;
            
            script.onload = () => {
                // Also load the USE model
                const useScript = document.createElement('script');
                useScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder@1.3.3/dist/universal-sentence-encoder.min.js';
                useScript.async = true;
                
                useScript.onload = () => resolve();
                useScript.onerror = () => reject(new Error('Failed to load Universal Sentence Encoder'));
                
                document.body.appendChild(useScript);
            };
            
            script.onerror = () => reject(new Error('Failed to load TensorFlow.js'));
            
            document.body.appendChild(script);
        });
    }

    /**
     * Load the universal sentence encoder model
     */
    async loadEncoder() {
        try {
            return await window.use.load();
        } catch (error) {
            console.error('Error loading encoder:', error);
            throw error;
        }
    }

    /**
     * Load prompt patterns
     * In a real implementation, this could be a more sophisticated dataset
     */
    async loadPromptPatterns() {
        // Simple example patterns - in a real app, this would be a larger dataset
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
     * Create a simple classifier for prompt enhancement
     */
    async createClassifier() {
        // In a production system, this would be a proper model
        // For this demo, we use a simple rule-based system
        return {
            classify: (text) => {
                // Convert to lowercase for matching
                const lowerText = text.toLowerCase();
                
                // Sample classifications
                if (lowerText.includes('code') || lowerText.includes('function') || lowerText.includes('program')) {
                    return 'code';
                } else if (lowerText.includes('chat') || lowerText.includes('conversation')) {
                    return 'chat';
                } else if (lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('photo')) {
                    return 'image';
                } else if (lowerText.includes('continue') || lowerText.includes('finish')) {
                    return 'completion';
                } else {
                    return 'general';
                }
            }
        };
    }

    /**
     * Wait for model to be loaded
     */
    async waitForModel() {
        if (this.modelLoaded) return Promise.resolve();
        
        if (!this.isLoading) {
            this.init();
        }
        
        return new Promise(resolve => {
            this.loadCallbacks.push(resolve);
        });
    }

    /**
     * Get suggestions for a prompt
     * @param {string} prompt - The user's prompt
     * @param {string} medium - Text or Image
     * @param {string} type - Prompt type
     * @returns {Promise<Array>} - Array of suggestions
     */
    async getSuggestions(prompt, medium, type) {
        try {
            // Initialize if not already loaded
            if (!this.modelLoaded && !this.isLoading) {
                this.init();
            }
            
            // If still loading, wait
            if (!this.modelLoaded) {
                await this.waitForModel();
            }
            
            // Simple pattern matching for suggestions
            const suggestions = [];
            
            // Get type-specific patterns
            const mediumPatterns = this.promptPatterns[medium] || this.promptPatterns['text'];
            const typePatterns = mediumPatterns[type] || mediumPatterns['general'];
            
            // Add type-specific suggestions
            if (typePatterns) {
                typePatterns.forEach(({ pattern, suggestion }) => {
                    if (prompt.toLowerCase().includes(pattern.toLowerCase())) {
                        suggestions.push(suggestion);
                    }
                });
            }
            
            // Add general suggestions
            if (prompt.length < 20) {
                suggestions.push('Add more details to get better results');
            }
            
            if (!prompt.includes('style') && medium === 'image') {
                suggestions.push('Specify a style for more consistent results');
            }
            
            if (!prompt.includes('format') && medium === 'text' && type !== 'chat') {
                suggestions.push('Specify a format (e.g., paragraph, bullet points)');
            }
            
            return suggestions;
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return ['Add more specificity to your prompt'];
        }
    }

    /**
     * Analyze a prompt to suggest the best type
     * @param {string} prompt - The user's prompt
     * @returns {Promise<Object>} - Suggested medium and type
     */
    async analyzePromptType(prompt) {
        try {
            if (!this.modelLoaded && !this.isLoading) {
                this.init();
            }
            
            if (!this.modelLoaded) {
                await this.waitForModel();
            }
            
            // Use the classifier to determine type
            const classification = this.classifier.classify(prompt);
            
            let medium = 'text';
            let type = 'general';
            
            // Simple mapping from classification to medium/type
            if (classification === 'image') {
                medium = 'image';
                
                if (prompt.toLowerCase().includes('edit') || prompt.toLowerCase().includes('change')) {
                    type = 'editing';
                } else if (prompt.toLowerCase().includes('variation') || prompt.toLowerCase().includes('alternative')) {
                    type = 'variation';
                } else {
                    type = 'generation';
                }
            } else {
                // Text medium types
                if (classification === 'code') {
                    type = 'code';
                } else if (classification === 'chat') {
                    type = 'chat';
                } else if (classification === 'completion') {
                    type = 'completion';
                }
            }
            
            return { medium, type };
        } catch (error) {
            console.error('Error analyzing prompt type:', error);
            return { medium: 'text', type: 'general' };
        }
    }
}

// Create and export the AI helper
const aiPromptHelper = new AIPromptHelper();
export default aiPromptHelper; 