// Enhancement rules for different components
export const enhancementRules = {
    objective: {
        patterns: {
            hasObjective: /(^i want|^i need|^please|^could you|^help me)/i,
            hasVerb: /(create|make|generate|write|develop|implement|do|help|assist)/i
        },
        enhance: (prompt) => {
            const hasObjective = enhancementRules.objective.patterns.hasObjective.test(prompt);
            const hasVerb = enhancementRules.objective.patterns.hasVerb.test(prompt);
            
            if (!hasObjective) {
                return hasVerb ? `I want you to ${prompt}` : `I want you to help me ${prompt}`;
            }
            return prompt;
        }
    },

    context: {
        patterns: {
            hasContext: /(context|background|situation|scenario|given that|assuming|for|when):/i
        },
        enhance: (prompt, type) => {
            const contextMap = {
                general: 'This is a task for an AI assistant',
                image: 'This is an image generation request',
                chat: 'This is a conversational interaction',
                completion: 'This is a text completion task'
            };
            return `Context: ${contextMap[type] || contextMap.general}\nTask: ${prompt}`;
        }
    },

    format: {
        patterns: {
            hasFormat: /(format|structure|style|output|respond with|provide|give me):/i
        },
        enhance: (prompt, type) => {
            const formatMap = {
                general: 'Provide your response in a clear, structured format with detailed explanations',
                image: 'Describe the image with specific details about style, composition, and quality',
                chat: 'Respond in a natural, conversational manner while maintaining professionalism',
                completion: 'Complete the text maintaining consistent style and context'
            };
            return `${prompt}\n\n${formatMap[type] || formatMap.general}`;
        }
    },

    quality: {
        patterns: {
            hasQuality: /(quality|resolution|detail|fidelity)/i
        },
        enhance: (prompt, type) => {
            if (type === 'image') {
                return `${prompt}, ultra high quality, professional grade, perfect lighting, detailed textures`;
            }
            return prompt;
        }
    },

    style: {
        patterns: {
            hasStyle: /(style|tone|manner|way|approach)/i
        },
        enhance: (prompt, type) => {
            const styleMap = {
                image: ', professional photography style, artistic composition',
                chat: '\nMaintain a professional yet friendly tone',
                completion: '\nMaintain consistent style and tone',
                general: '\nUse a clear and professional style'
            };
            return `${prompt}${styleMap[type] || styleMap.general}`;
        }
    },

    specificity: {
        patterns: {
            hasSpecifics: /(specific|exactly|precisely|detailed|step[- ]by[- ]step)/i
        },
        enhance: (prompt) => {
            return `${prompt}\n\nBe specific and precise in your response, providing detailed explanations where appropriate`;
        }
    }
}; 