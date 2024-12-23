const bestPractices = {
    general: {
        rules: [
            {
                id: 'clear-objective',
                check: (prompt) => {
                    const hasObjective = /(^i want|^i need|^please|^could you|^help me)/i.test(prompt);
                    return !hasObjective || prompt.length < 20;
                },
                fix: (prompt) => {
                    const hasVerb = /(create|make|generate|write|develop|implement|do|help|assist)/i.test(prompt);
                    return hasVerb ? `I want you to ${prompt}` : `I want you to help me ${prompt}`;
                },
                description: 'Added clear objective statement'
            },
            {
                id: 'context-setting',
                check: (prompt) => !/(context|background|situation|scenario|given that|assuming|for|when):/i.test(prompt),
                fix: (prompt) => `Context: This is a task for an AI assistant.\nTask: ${prompt}`,
                description: 'Added context setting'
            },
            {
                id: 'output-format',
                check: (prompt) => !/(format|structure|style|output|respond with|provide|give me):/i.test(prompt),
                fix: (prompt) => `${prompt}\n\nProvide your response in a clear, structured format with detailed explanations.`,
                description: 'Specified output format'
            }
        ],
        patterns: {
            roleDefinition: /^(you are|act as|behave like|as an?|taking the role of)/i,
            taskClarity: /(create|make|generate|write|develop|implement|do|help|assist|provide|give|show|explain|analyze)/i,
            contextProvided: /(context|background|situation|scenario|given that|assuming|for|when):/i
        }
    },
    
    completion: {
        rules: [
            {
                id: 'completion-context',
                check: (prompt) => !/(complete|finish|continue|proceed with)/i.test(prompt),
                fix: (prompt) => `Complete the following task with detailed explanations:\n${prompt}`,
                description: 'Added completion context'
            },
            {
                id: 'completion-format',
                check: (prompt) => !/(format|structure|style|output):/i.test(prompt),
                fix: (prompt) => `${prompt}\n\nFormat your response as a detailed completion of the task, explaining your approach.`,
                description: 'Added format specification'
            }
        ]
    },
    
    chat: {
        rules: [
            {
                id: 'chat-persona',
                check: (prompt) => !/(you are|act as|behave like|as an?)/i.test(prompt),
                fix: (prompt) => `You are a helpful AI assistant skilled in engaging conversations.\n${prompt}`,
                description: 'Added AI persona definition'
            },
            {
                id: 'chat-interaction',
                check: (prompt) => !/(respond|reply|answer|interact|communicate)/i.test(prompt),
                fix: (prompt) => `${prompt}\n\nRespond in a natural, conversational manner while maintaining professionalism.`,
                description: 'Added interaction style'
            }
        ]
    },
    
    image: {
        rules: [
            {
                id: 'image-details',
                check: (prompt) => !/(style|quality|resolution|lighting|mood|atmosphere)/i.test(prompt),
                fix: (prompt) => `${prompt}, ultra high quality, professional photography, perfect lighting, detailed textures`,
                description: 'Added image quality and style details'
            },
            {
                id: 'image-composition',
                check: (prompt) => !/(composition|angle|perspective|view|shot|frame)/i.test(prompt),
                fix: (prompt) => `${prompt}, well-composed, dynamic composition, perfect framing, professional perspective`,
                description: 'Added composition guidelines'
            }
        ]
    }
};

const commonEnhancements = {
    addClarity: (prompt) => {
        const hasClarity = /(^i want|^i need|^please|^could you|^help me)/i.test(prompt);
        return hasClarity ? prompt : `I want you to ${prompt.trim()}`;
    },
    
    addStructure: (prompt) => {
        if (!prompt.includes('\n') && prompt.length > 50) {
            return `${prompt}\n\nPlease provide a structured response with the following:\n1. Understanding of the task\n2. Detailed implementation\n3. Additional considerations`;
        }
        return prompt;
    },
    
    improveSpecificity: (prompt) => {
        const hasSpecifics = /(specific|exactly|precisely|detailed|step[- ]by[- ]step)/i.test(prompt);
        if (!hasSpecifics && prompt.length > 30) {
            return `${prompt}\n\nBe specific and precise in your response, providing detailed explanations and examples where appropriate.`;
        }
        return prompt;
    }
};

export { bestPractices, commonEnhancements }; 