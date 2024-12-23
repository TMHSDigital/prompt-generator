import { bestPractices, commonEnhancements } from './bestPractices.js';

class PromptEnhancer {
    constructor() {
        this.improvements = [];
    }

    enhance(prompt, type = 'general') {
        this.improvements = [];
        let enhancedPrompt = prompt.trim();
        
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

        return {
            enhancedPrompt,
            improvements: this.improvements
        };
    }

    applyRules(prompt, rules) {
        let enhancedPrompt = prompt;
        
        rules.forEach(rule => {
            if (rule.check(enhancedPrompt)) {
                enhancedPrompt = rule.fix(enhancedPrompt);
                this.improvements.push(rule.description);
            }
        });

        return enhancedPrompt;
    }

    applyCommonEnhancements(prompt) {
        let enhancedPrompt = prompt;

        // Add clarity if needed
        if (!prompt.toLowerCase().includes('i want') && !prompt.toLowerCase().includes('please')) {
            enhancedPrompt = commonEnhancements.addClarity(enhancedPrompt);
            this.improvements.push('Added clarity to request');
        }

        // Add structure if needed
        if (!prompt.includes('\n')) {
            enhancedPrompt = commonEnhancements.addStructure(enhancedPrompt);
            this.improvements.push('Added structural formatting');
        }

        // Improve specificity if needed
        const originalLength = enhancedPrompt.length;
        enhancedPrompt = commonEnhancements.improveSpecificity(enhancedPrompt);
        if (enhancedPrompt.length > originalLength) {
            this.improvements.push('Enhanced specificity');
        }

        return enhancedPrompt;
    }

    checkPatterns(prompt) {
        let enhancedPrompt = prompt;
        const patterns = bestPractices.general.patterns;

        // Check for role definition
        if (!patterns.roleDefinition.test(prompt)) {
            enhancedPrompt = `You are an AI assistant tasked to: ${enhancedPrompt}`;
            this.improvements.push('Added role definition');
        }

        // Check for task clarity
        if (!patterns.taskClarity.test(prompt)) {
            enhancedPrompt = `Please complete the following task: ${enhancedPrompt}`;
            this.improvements.push('Added task clarity');
        }

        // Check for context
        if (!patterns.contextProvided.test(prompt)) {
            const hasContext = prompt.includes('Context:') || prompt.includes('Background:');
            if (!hasContext) {
                enhancedPrompt = `Context: This is a task for an AI assistant.\n${enhancedPrompt}`;
                this.improvements.push('Added context information');
            }
        }

        return enhancedPrompt;
    }
}

// Export the enhancer
export const promptEnhancer = new PromptEnhancer(); 