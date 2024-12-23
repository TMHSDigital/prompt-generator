import { promptEnhancer } from './promptEnhancer.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const originalPrompt = document.getElementById('originalPrompt');
    const promptType = document.getElementById('promptType');
    const generateBtn = document.getElementById('generateBtn');
    const enhancedPrompt = document.getElementById('enhancedPrompt');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const improvementsList = document.getElementById('improvementsList');

    // Initialize local storage
    const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');

    // Generate enhanced prompt
    generateBtn.addEventListener('click', () => {
        const prompt = originalPrompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt first.');
            return;
        }

        const type = promptType.value;
        const { enhancedPrompt: newPrompt, improvements } = promptEnhancer.enhance(prompt, type);

        // Update UI with enhanced prompt
        enhancedPrompt.innerHTML = `<pre>${newPrompt}</pre>`;
        
        // Update improvements list
        improvementsList.innerHTML = improvements
            .map(improvement => `<li>${improvement}</li>`)
            .join('');

        // Show success message
        generateBtn.innerHTML = '<i class="fas fa-check"></i> Enhanced!';
        setTimeout(() => {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Enhance Prompt';
        }, 2000);
    });

    // Copy enhanced prompt
    copyBtn.addEventListener('click', () => {
        const promptText = enhancedPrompt.textContent;
        navigator.clipboard.writeText(promptText).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    });

    // Save prompt
    saveBtn.addEventListener('click', () => {
        const originalText = originalPrompt.value;
        const enhancedText = enhancedPrompt.textContent;
        const type = promptType.value;

        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            alert('Please generate an enhanced prompt first.');
            return;
        }

        const promptData = {
            original: originalText,
            enhanced: enhancedText,
            type: type,
            timestamp: new Date().toISOString()
        };

        savedPrompts.unshift(promptData);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.slice(0, 10))); // Keep last 10 prompts

        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        }, 2000);
    });

    // Handle textarea auto-resize
    originalPrompt.addEventListener('input', () => {
        originalPrompt.style.height = 'auto';
        originalPrompt.style.height = originalPrompt.scrollHeight + 'px';
    });

    // Handle prompt type change
    promptType.addEventListener('change', () => {
        if (originalPrompt.value && enhancedPrompt.textContent) {
            generateBtn.click(); // Re-generate with new type
        }
    });
}); 