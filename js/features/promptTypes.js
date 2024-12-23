// Prompt Types Configuration
export const mediumTypes = {
    text: {
        name: 'Text',
        description: 'For text-based AI models like ChatGPT, GPT-4, etc.',
        types: {
            general: {
                name: 'General',
                description: 'For general purpose text generation',
                factors: ['objective', 'context', 'tone', 'format', 'constraints', 'examples']
            },
            completion: {
                name: 'Completion',
                description: 'For completing or extending text',
                factors: ['context', 'style', 'length', 'creativity', 'format', 'continuity']
            },
            chat: {
                name: 'Chat',
                description: 'For conversational AI interactions',
                factors: ['role', 'tone', 'context', 'memory', 'personality', 'constraints']
            },
            code: {
                name: 'Code',
                description: 'For code generation and explanation',
                factors: ['language', 'purpose', 'complexity', 'style', 'documentation', 'tests']
            }
        }
    },
    image: {
        name: 'Image',
        description: 'For image generation AI models like DALL-E, Midjourney, etc.',
        types: {
            generation: {
                name: 'Generation',
                description: 'For creating images from text descriptions',
                factors: ['subject', 'style', 'composition', 'lighting', 'color', 'mood', 'detail', 'perspective']
            },
            editing: {
                name: 'Editing',
                description: 'For modifying or enhancing existing images',
                factors: ['modification', 'strength', 'style', 'focus', 'preservation', 'blend']
            },
            variation: {
                name: 'Variation',
                description: 'For creating variations of images',
                factors: ['elements', 'style', 'diversity', 'consistency', 'focus']
            }
        }
    }
};

// Helper function to get all available factors for a medium and type
export function getFactors(medium, type) {
    return mediumTypes[medium]?.types[type]?.factors || [];
}

// Helper function to get type info
export function getTypeInfo(medium, type) {
    return mediumTypes[medium]?.types[type] || null;
}

// Helper function to get medium info
export function getMediumInfo(medium) {
    return mediumTypes[medium] || null;
} 