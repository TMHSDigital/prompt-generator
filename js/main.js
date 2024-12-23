import { PromptEnhancer } from './features/promptEnhancer.js';
import { promptTypes } from './features/promptTypes.js';
import { uiFeatures } from './features/uiFeatures.js';
import { ShareManager } from './features/shareFeatures.js';

class PromptUI {
    constructor() {
        this.enhancer = new PromptEnhancer();
        this.shareManager = new ShareManager();
        this.initializeElements();
        this.initializeFeatures();
        this.attachEventListeners();
        this.loadSavedPrompts();
        this.checkForSharedPrompt();
    }

    initializeElements() {
        this.elements = {
            originalPrompt: document.getElementById('originalPrompt'),
            promptType: document.getElementById('promptType'),
            generateBtn: document.getElementById('generateBtn'),
            enhancedPrompt: document.getElementById('enhancedPrompt'),
            copyBtn: document.getElementById('copyBtn'),
            saveBtn: document.getElementById('saveBtn'),
            shareBtn: document.getElementById('shareBtn'),
            improvementsList: document.getElementById('improvementsList'),
            charCounter: document.getElementById('charCounter'),
            darkModeBtn: document.getElementById('darkModeBtn')
        };

        // Initialize type selector
        this.elements.promptType.innerHTML = Object.entries(promptTypes)
            .map(([value, type]) => `<option value="${value}">${type.name}</option>`)
            .join('');
    }

    initializeFeatures() {
        // Initialize dark mode
        uiFeatures.darkMode.initialize();

        // Initialize character counter
        uiFeatures.characterCounter.initialize(
            this.elements.originalPrompt,
            this.elements.charCounter
        );
    }

    attachEventListeners() {
        // Generate enhanced prompt
        this.elements.generateBtn.addEventListener('click', () => this.generateEnhancedPrompt());

        // Copy enhanced prompt
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());

        // Share prompt
        this.elements.shareBtn.addEventListener('click', async () => {
            const result = await this.sharePrompt();
            uiFeatures.notifications.show(result.message, result.success ? 'success' : 'error');
        });

        // Save prompt
        this.elements.saveBtn.addEventListener('click', () => this.savePrompt());

        // Dark mode toggle
        this.elements.darkModeBtn.addEventListener('click', () => {
            const isDark = uiFeatures.darkMode.toggle();
            this.elements.darkModeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
            uiFeatures.notifications.show(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
        });

        // Handle textarea auto-resize
        this.elements.originalPrompt.addEventListener('input', (e) => this.autoResizeTextarea(e.target));

        // Handle prompt type change
        this.elements.promptType.addEventListener('change', () => this.handleTypeChange());
    }

    async generateEnhancedPrompt() {
        const prompt = this.elements.originalPrompt.value.trim();
        if (!prompt) {
            uiFeatures.notifications.show('Please enter a prompt first.', 'error');
            return;
        }

        const type = this.elements.promptType.value;
        const options = this.getOptionsForType(type);

        // Show loading state
        const hideLoading = uiFeatures.loadingState.show(this.elements.generateBtn);

        try {
            const { enhancedPrompt, improvements, wasModified } = this.enhancer.enhance(prompt, type, options);

            // Update UI
            this.elements.enhancedPrompt.innerHTML = `<pre>${enhancedPrompt}</pre>`;
            this.elements.improvementsList.innerHTML = improvements
                .map(improvement => `<li>${improvement}</li>`)
                .join('');

            // Show success message
            uiFeatures.notifications.show('Prompt enhanced successfully!', 'success');
        } catch (error) {
            console.error('Enhancement error:', error);
            uiFeatures.notifications.show('Failed to enhance prompt.', 'error');
        } finally {
            hideLoading();
        }
    }

    async sharePrompt() {
        const enhancedText = this.elements.enhancedPrompt.textContent;
        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
            return { success: false, message: 'No prompt to share' };
        }

        const promptData = {
            original: this.elements.originalPrompt.value,
            enhanced: enhancedText,
            type: this.elements.promptType.value
        };

        // Show share options if available
        const platforms = this.shareManager.getAvailablePlatforms();
        if (platforms.length > 1 && !navigator.share) {
            // If we have multiple platforms and no native share, show platform selection
            const platform = await this.showSharePlatformDialog(platforms);
            if (platform) {
                return await this.shareManager.share(promptData, platform);
            }
            return { success: false, message: 'Share cancelled' };
        }

        // Otherwise use default sharing
        return await this.shareManager.share(promptData);
    }

    async showSharePlatformDialog(platforms) {
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        
        // Group platforms into categories
        const socialPlatforms = ['twitter', 'linkedin', 'facebook'];
        const messagingPlatforms = ['whatsapp', 'telegram'];
        const otherPlatforms = ['email', 'copyLink', 'qrCode'];

        dialog.innerHTML = `
            <div class="share-dialog-content">
                <h3>Share Enhanced Prompt</h3>
                
                <div class="share-section">
                    <h4>Social Media</h4>
                    <div class="share-platforms">
                        ${socialPlatforms.filter(p => platforms.includes(p)).map(platform => `
                            <button class="share-platform-btn" data-platform="${platform}">
                                <i class="fab fa-${platform}"></i>
                                <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="share-section">
                    <h4>Messaging</h4>
                    <div class="share-platforms">
                        ${messagingPlatforms.filter(p => platforms.includes(p)).map(platform => `
                            <button class="share-platform-btn" data-platform="${platform}">
                                <i class="fab fa-${platform}"></i>
                                <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="share-section">
                    <h4>Other Options</h4>
                    <div class="share-platforms">
                        ${otherPlatforms.filter(p => platforms.includes(p)).map(platform => `
                            <button class="share-platform-btn" data-platform="${platform}">
                                <i class="fas fa-${
                                    platform === 'email' ? 'envelope' :
                                    platform === 'copyLink' ? 'link' :
                                    platform === 'qrCode' ? 'qrcode' : ''
                                }"></i>
                                <span>${
                                    platform === 'copyLink' ? 'Copy Link' :
                                    platform === 'qrCode' ? 'QR Code' :
                                    platform.charAt(0).toUpperCase() + platform.slice(1)
                                }</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <button class="share-dialog-close">
                    <i class="fas fa-times"></i>
                    <span>Close</span>
                </button>
            </div>
        `;

        return new Promise(resolve => {
            const handleClick = (e) => {
                const platformBtn = e.target.closest('.share-platform-btn');
                if (platformBtn) {
                    const platform = platformBtn.dataset.platform;
                    dialog.remove();
                    resolve(platform);
                }
            };

            dialog.querySelector('.share-platforms').addEventListener('click', handleClick);
            dialog.querySelector('.share-dialog-close').addEventListener('click', () => {
                dialog.remove();
                resolve(null);
            });

            document.body.appendChild(dialog);
        });
    }

    async copyToClipboard() {
        const promptText = this.elements.enhancedPrompt.textContent;
        try {
            await navigator.clipboard.writeText(promptText);
            uiFeatures.notifications.show('Copied to clipboard!', 'success');
        } catch (error) {
            uiFeatures.notifications.show('Failed to copy to clipboard.', 'error');
        }
    }

    savePrompt() {
        const originalText = this.elements.originalPrompt.value;
        const enhancedText = this.elements.enhancedPrompt.textContent;
        const type = this.elements.promptType.value;

        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
            return;
        }

        const promptData = {
            original: originalText,
            enhanced: enhancedText,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.saveToLocalStorage(promptData);
        this.showSavedPrompts();
        uiFeatures.notifications.show('Prompt saved successfully!', 'success');
    }

    showSavedPrompts() {
        const viewer = document.getElementById('savedPromptsViewer');
        const listContainer = viewer.querySelector('.saved-prompts-list');
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');

        listContainer.innerHTML = savedPrompts.length ? savedPrompts.map((prompt, index) => `
            <div class="saved-prompt-item">
                <div class="saved-prompt-header">
                    <span class="prompt-type">${promptTypes[prompt.type]?.name || 'General'}</span>
                    <span class="prompt-date">${new Date(prompt.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="prompt-content">
                    <div class="original-prompt">
                        <strong>Original:</strong>
                        <p>${prompt.original}</p>
                    </div>
                    <div class="enhanced-prompt">
                        <strong>Enhanced:</strong>
                        <p>${prompt.enhanced}</p>
                    </div>
                </div>
                <div class="prompt-actions">
                    <button class="load-prompt-btn" data-index="${index}">
                        <i class="fas fa-upload"></i> Load
                    </button>
                    <button class="delete-prompt-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('') : '<div class="no-prompts">No saved prompts yet</div>';

        // Add event listeners for load and delete buttons
        listContainer.querySelectorAll('.load-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const prompt = savedPrompts[index];
                this.elements.originalPrompt.value = prompt.original;
                this.elements.promptType.value = prompt.type;
                this.generateEnhancedPrompt();
                viewer.classList.remove('show');
            });
        });

        listContainer.querySelectorAll('.delete-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                savedPrompts.splice(index, 1);
                localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
                this.showSavedPrompts(); // Refresh the list
                uiFeatures.notifications.show('Prompt deleted successfully!', 'success');
            });
        });

        viewer.classList.add('show');
    }

    getOptionsForType(type) {
        const typeConfig = promptTypes[type];
        const options = {};

        if (type === 'image') {
            options.quality = true;
            options.style = true;
        } else if (type === 'chat') {
            options.tone = true;
        }

        return options;
    }

    saveToLocalStorage(promptData) {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        savedPrompts.unshift(promptData);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.slice(0, 10)));
    }

    loadSavedPrompts() {
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        
        // Create saved prompts viewer if it doesn't exist
        if (!document.getElementById('savedPromptsViewer')) {
            const viewer = document.createElement('div');
            viewer.id = 'savedPromptsViewer';
            viewer.className = 'saved-prompts-viewer';
            viewer.innerHTML = `
                <div class="saved-prompts-content">
                    <div class="saved-prompts-header">
                        <h3>Saved Prompts</h3>
                        <button class="close-viewer-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="saved-prompts-list"></div>
                </div>
            `;
            document.body.appendChild(viewer);

            // Add close button listener
            viewer.querySelector('.close-viewer-btn').addEventListener('click', () => {
                viewer.classList.remove('show');
            });
        }
    }

    checkForSharedPrompt() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('share');
        
        if (sharedData) {
            try {
                const promptData = JSON.parse(atob(sharedData));
                this.elements.originalPrompt.value = promptData.original;
                this.elements.promptType.value = promptData.type;
                this.generateEnhancedPrompt();
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Failed to load shared prompt:', error);
            }
        }
    }

    handleTypeChange() {
        if (this.elements.originalPrompt.value && !this.elements.enhancedPrompt.textContent.includes('Your enhanced prompt will appear here...')) {
            this.generateEnhancedPrompt();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    updateDarkModeButton() {
        const icon = this.elements.darkModeBtn.querySelector('i');
        icon.className = uiFeatures.darkMode.isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.promptUI = new PromptUI();
});

// Initialize dark mode button with pulse animation
document.addEventListener('DOMContentLoaded', () => {
    const darkModeBtn = document.getElementById('darkModeBtn');
    
    // Add pulse animation class
    darkModeBtn.classList.add('pulse');
    
    // Remove pulse after 3 animations (6 seconds)
    setTimeout(() => {
        darkModeBtn.classList.remove('pulse');
    }, 6000);
    
    // Remove pulse on hover or click
    darkModeBtn.addEventListener('mouseenter', () => {
        darkModeBtn.classList.remove('pulse');
    });
    
    darkModeBtn.addEventListener('click', () => {
        darkModeBtn.classList.remove('pulse');
    });
}); 