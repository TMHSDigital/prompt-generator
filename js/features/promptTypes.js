// Define different prompt types and their specific requirements
export const promptTypes = {
    general: {
        name: 'General',
        description: 'General purpose AI prompts',
        requiredComponents: ['objective', 'context', 'format'],
        optionalComponents: ['role', 'constraints', 'examples'],
        defaultFormat: 'text',
        maxLength: 2000
    },
    
    completion: {
        name: 'Completion',
        description: 'Auto-completion and continuation prompts',
        requiredComponents: ['context', 'format'],
        optionalComponents: ['style', 'length', 'creativity'],
        defaultFormat: 'text',
        maxLength: 1000
    },
    
    chat: {
        name: 'Chat',
        description: 'Conversational AI prompts',
        requiredComponents: ['persona', 'tone'],
        optionalComponents: ['context', 'memory', 'constraints'],
        defaultFormat: 'conversation',
        maxLength: 500
    },
    
    image: {
        name: 'Image Generation',
        description: 'Image generation prompts',
        requiredComponents: ['subject', 'style', 'quality'],
        optionalComponents: ['composition', 'lighting', 'colors', 'mood'],
        defaultFormat: 'detailed',
        maxLength: 1000
    }
}; 