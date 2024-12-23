const bestPractices = {
    general: {
        rules: [
            {
                id: 'clear-objective',
                check: (prompt) => !prompt.toLowerCase().includes('please') || prompt.length < 10,
                fix: (prompt) => `I want you to ${prompt}`,
                description: 'Added clear objective statement'
            },
            {
                id: 'context-setting',
                check: (prompt) => !prompt.toLowerCase().includes('context'),
                fix: (prompt) => `Context: This is a task for an AI assistant.\nTask: ${prompt}`,
                description: 'Added context setting'
            },
            {
                id: 'output-format',
                check: (prompt) => !prompt.toLowerCase().includes('format'),
                fix: (prompt) => `${prompt}\n\nProvide your response in a clear, structured format.`,
                description: 'Specified output format'
            }
        ],
        patterns: {
            roleDefinition: /^(you are|act as|behave like)/i,
            taskClarity: /(create|make|generate|write|develop|implement)/i,
            contextProvided: /(context|background|situation):/i
        }
    },
    
    completion: {
        rules: [
            {
                id: 'completion-context',
                check: (prompt) => !prompt.includes('Complete the following'),
                fix: (prompt) => `Complete the following task:\n${prompt}`,
                description: 'Added completion context'
            },
            {
                id: 'completion-format',
                check: (prompt) => !prompt.toLowerCase().includes('format'),
                fix: (prompt) => `${prompt}\n\nFormat your response as a direct completion of the task.`,
                description: 'Added format specification'
            }
        ]
    },
    
    chat: {
        rules: [
            {
                id: 'chat-persona',
                check: (prompt) => !prompt.toLowerCase().includes('you are'),
                fix: (prompt) => `You are a helpful AI assistant.\n${prompt}`,
                description: 'Added AI persona definition'
            },
            {
                id: 'chat-interaction',
                check: (prompt) => !prompt.toLowerCase().includes('respond'),
                fix: (prompt) => `${prompt}\n\nRespond in a conversational manner.`,
                description: 'Added interaction style'
            }
        ]
    },
    
    image: {
        rules: [
            {
                id: 'image-details',
                check: (prompt) => !prompt.toLowerCase().includes('style'),
                fix: (prompt) => `${prompt}, high quality, detailed, professional photography style`,
                description: 'Added image quality and style details'
            },
            {
                id: 'image-composition',
                check: (prompt) => !prompt.toLowerCase().includes('composition'),
                fix: (prompt) => `${prompt}, well-composed, balanced composition`,
                description: 'Added composition guidelines'
            }
        ]
    }
};

const commonEnhancements = {
    addClarity: (prompt) => {
        return prompt.replace(/^/, 'I want you to ').trim();
    },
    
    addStructure: (prompt) => {
        if (!prompt.includes('\n')) {
            return `${prompt}\n\nPlease provide a structured response.`;
        }
        return prompt;
    },
    
    improveSpecificity: (prompt) => {
        const specifics = prompt.match(/(specific|exactly|precisely)/i);
        if (!specifics) {
            return `${prompt}\n\nBe specific and precise in your response.`;
        }
        return prompt;
    }
};

// Export the configurations
export { bestPractices, commonEnhancements }; 