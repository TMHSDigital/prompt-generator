import { bestPractices, commonEnhancements } from './bestPractices.js';

class PromptEnhancer {
    constructor() {
        this.improvements = [];
        this.maxLength = 2000; // Prevent excessive length
    }

    enhance(prompt, type = 'general') {
        try {
            this.improvements = [];
            let enhancedPrompt = this.sanitizeInput(prompt);
            
            // Apply type-specific rules
            if (bestPractices[type]) {
                enhancedPrompt = this.applyRules(enhancedPrompt, bestPractices[type].rules);
            }

            // Apply common enhancements
            enhancedPrompt = this.applyCommonEnhancements(enhancedPrompt);

            // Check for patterns
            if (type === 'general') {
                enhancedPrompt = this.checkPatterns(enhancedPrompt);
            }

            // Ensure prompt doesn't exceed max length
            enhancedPrompt = this.truncateIfNeeded(enhancedPrompt);

            return {
                enhancedPrompt,
                improvements: this.improvements,
                wasModified: enhancedPrompt !== prompt
            };
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            return {
                enhancedPrompt: prompt,
                improvements: ['Error: Could not enhance prompt'],
                wasModified: false
            };
        }
    }

    sanitizeInput(prompt) {
        return prompt.trim()
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[\r\n]+/g, '\n') // Normalize line endings
            .slice(0, this.maxLength); // Prevent excessive length
    }

    applyRules(prompt, rules) {
        let enhancedPrompt = prompt;
        
        rules.forEach(rule => {
            try {
                if (rule.check(enhancedPrompt)) {
                    const originalPrompt = enhancedPrompt;
                    enhancedPrompt = rule.fix(enhancedPrompt);
                    
                    // Only add improvement if the prompt was actually modified
                    if (originalPrompt !== enhancedPrompt) {
                        this.improvements.push(rule.description);
                    }
                }
            } catch (error) {
                console.error(`Error applying rule ${rule.id}:`, error);
            }
        });

        return enhancedPrompt;
    }

    applyCommonEnhancements(prompt) {
        let enhancedPrompt = prompt;

        // Add clarity if needed
        if (!prompt.toLowerCase().includes('i want') && !prompt.toLowerCase().includes('please')) {
            const originalPrompt = enhancedPrompt;
            enhancedPrompt = commonEnhancements.addClarity(enhancedPrompt);
            if (originalPrompt !== enhancedPrompt) {
                this.improvements.push('Added clarity to request');
            }
        }

        // Add structure if needed
        if (!prompt.includes('\n')) {
            const originalPrompt = enhancedPrompt;
            enhancedPrompt = commonEnhancements.addStructure(enhancedPrompt);
            if (originalPrompt !== enhancedPrompt) {
                this.improvements.push('Added structural formatting');
            }
        }

        // Improve specificity if needed
        const originalPrompt = enhancedPrompt;
        enhancedPrompt = commonEnhancements.improveSpecificity(enhancedPrompt);
        if (originalPrompt !== enhancedPrompt) {
            this.improvements.push('Enhanced specificity');
        }

        return enhancedPrompt;
    }

    checkPatterns(prompt) {
        let enhancedPrompt = prompt;
        const patterns = bestPractices.general.patterns;

        // Check for role definition
        if (!patterns.roleDefinition.test(prompt)) {
            const originalPrompt = enhancedPrompt;
            enhancedPrompt = `You are an AI assistant tasked to: ${enhancedPrompt}`;
            if (originalPrompt !== enhancedPrompt) {
                this.improvements.push('Added role definition');
            }
        }

        // Check for task clarity
        if (!patterns.taskClarity.test(prompt)) {
            const originalPrompt = enhancedPrompt;
            enhancedPrompt = `Please complete the following task: ${enhancedPrompt}`;
            if (originalPrompt !== enhancedPrompt) {
                this.improvements.push('Added task clarity');
            }
        }

        // Check for context
        if (!patterns.contextProvided.test(prompt)) {
            const hasContext = prompt.includes('Context:') || prompt.includes('Background:');
            if (!hasContext) {
                const originalPrompt = enhancedPrompt;
                enhancedPrompt = `Context: This is a task for an AI assistant.\n${enhancedPrompt}`;
                if (originalPrompt !== enhancedPrompt) {
                    this.improvements.push('Added context information');
                }
            }
        }

        return enhancedPrompt;
    }

    truncateIfNeeded(prompt) {
        if (prompt.length > this.maxLength) {
            this.improvements.push('Truncated to prevent excessive length');
            return prompt.slice(0, this.maxLength) + '...';
        }
        return prompt;
    }
}

export const promptEnhancer = new PromptEnhancer(); 