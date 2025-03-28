import { PromptEnhancer } from './features/promptEnhancer.js';
import { mediumTypes, getFactors, getTypeInfo, getMediumInfo } from './features/promptTypes.js';
import { uiFeatures } from './features/uiFeatures.js';
import { shareFeatures } from './features/shareFeatures.js';
import storageManager from './features/aiSuggestions.js';

// Error handling for module loading
window.addEventListener('error', (event) => {
    if (event.filename.includes('.js')) {
        console.error('Module loading error:', event.error);
        uiFeatures.notifications.show('Failed to load application. Please refresh the page.', 'error');
    }
});

class PromptUI {
    constructor() {
        this.enhancer = new PromptEnhancer();
        this.boundHandlers = new Map();
        this.initializeElements();
        this.initializeFeatures();
        this.attachEventListeners();
        this.loadSavedPrompts();
        this.checkForSharedPrompt();
        this.updateDarkModeButton();
    }

    initializeElements() {
        this.elements = {
            originalPrompt: document.getElementById('originalPrompt'),
            promptMedium: document.getElementById('promptMedium'),
            promptType: document.getElementById('promptType'),
            generateBtn: document.getElementById('generateBtn'),
            enhancedPrompt: document.getElementById('enhancedPrompt'),
            copyBtn: document.getElementById('copyBtn'),
            saveBtn: document.getElementById('saveBtn'),
            shareBtn: document.getElementById('shareBtn'),
            improvementsList: document.getElementById('improvementsList'),
            charCounter: document.getElementById('charCounter'),
            darkModeBtn: document.getElementById('darkModeBtn'),
            exportBtn: document.getElementById('exportBtn'),
            importFile: document.getElementById('importFile'),
            promptSearchField: document.getElementById('promptSearchField'),
            notification: document.getElementById('notification'),
            confirmDialog: document.getElementById('confirmDialog'),
            confirmOk: document.getElementById('confirmOk'),
            confirmCancel: document.getElementById('confirmCancel'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage')
        };

        // Initialize medium selector
        this.updateMediumTypes();
        
        // Initialize type selector based on default medium
        this.updatePromptTypes(this.elements.promptMedium.value);
    }

    updateMediumTypes() {
        this.elements.promptMedium.innerHTML = Object.entries(mediumTypes)
            .map(([value, medium]) => `
                <option value="${value}" title="${medium.description}">
                    ${medium.name}
                </option>
            `).join('');
    }

    updatePromptTypes(medium) {
        // Show loading state
        this.elements.promptType.disabled = true;
        this.elements.promptType.style.opacity = '0.7';

        const types = mediumTypes[medium]?.types || {};
        this.elements.promptType.innerHTML = Object.entries(types)
            .map(([value, type]) => `
                <option value="${value}" title="${type.description}">
                    ${type.name}
                </option>
            `).join('');

        // Remove loading state
        this.elements.promptType.disabled = false;
        this.elements.promptType.style.opacity = '1';
    }

    async initializeFeatures() {
        // Initialize dark mode
        await uiFeatures.darkMode.initialize();
        this.updateDarkModeButton();

        // Initialize character counter
        uiFeatures.characterCounter.initialize(
            this.elements.originalPrompt,
            this.elements.charCounter
        );

        // Initialize saved prompts
        await uiFeatures.savedPrompts.initialize();
    }

    attachEventListeners() {
        // Store bound handlers for cleanup
        this.boundHandlers.set('generate', () => this.generateEnhancedPrompt());
        this.boundHandlers.set('copy', () => this.copyToClipboard());
        this.boundHandlers.set('share', async () => {
            const result = await this.sharePrompt();
            uiFeatures.notifications.show(result.message, result.success ? 'success' : 'error');
        });
        this.boundHandlers.set('save', () => this.savePrompt());
        this.boundHandlers.set('darkMode', async () => {
            const isDark = await uiFeatures.darkMode.toggle();
            this.updateDarkModeButton();
            uiFeatures.notifications.show(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
        });
        this.boundHandlers.set('autoResize', (e) => this.autoResizeTextarea(e.target));
        this.boundHandlers.set('mediumChange', (e) => {
            this.updatePromptTypes(e.target.value);
            this.handleTypeChange();
        });
        this.boundHandlers.set('typeChange', () => this.handleTypeChange());

        // Export/Import functionality
        this.elements.exportBtn.addEventListener('click', () => this.exportPrompts());
        this.elements.importFile.addEventListener('change', (e) => this.importPrompts(e));
        
        // Search functionality
        this.elements.promptSearchField.addEventListener('input', this.debounce(() => this.searchSavedPrompts(), 300));
        
        // Confirmation dialog events
        this.elements.confirmOk.addEventListener('click', () => {
            if (typeof this.confirmCallback === 'function') {
                this.confirmCallback(true);
            }
            this.hideConfirmDialog();
        });
        
        this.elements.confirmCancel.addEventListener('click', () => {
            if (typeof this.confirmCallback === 'function') {
                this.confirmCallback(false);
            }
            this.hideConfirmDialog();
        });

        // Attach event listeners
        this.elements.generateBtn.addEventListener('click', this.boundHandlers.get('generate'));
        this.elements.copyBtn.addEventListener('click', this.boundHandlers.get('copy'));
        this.elements.shareBtn.addEventListener('click', this.boundHandlers.get('share'));
        this.elements.saveBtn.addEventListener('click', this.boundHandlers.get('save'));
        this.elements.darkModeBtn.addEventListener('click', this.boundHandlers.get('darkMode'));
        this.elements.originalPrompt.addEventListener('input', this.boundHandlers.get('autoResize'));
        this.elements.promptMedium.addEventListener('change', this.boundHandlers.get('mediumChange'));
        this.elements.promptType.addEventListener('change', this.boundHandlers.get('typeChange'));

        // Add debounced handler for prompt text changes
        this.elements.originalPrompt.addEventListener('input', this.debounce(() => {
            this.updateCharCounter();
            this.autoResizeTextarea(this.elements.originalPrompt);
            
            // Only trigger type analysis if there's substantial text
            if (this.elements.originalPrompt.value.length > 15) {
                this.handleTypeChange();
            }
        }, 1000));
    }

    cleanup() {
        // Remove event listeners
        this.elements.generateBtn.removeEventListener('click', this.boundHandlers.get('generate'));
        this.elements.copyBtn.removeEventListener('click', this.boundHandlers.get('copy'));
        this.elements.shareBtn.removeEventListener('click', this.boundHandlers.get('share'));
        this.elements.saveBtn.removeEventListener('click', this.boundHandlers.get('save'));
        this.elements.darkModeBtn.removeEventListener('click', this.boundHandlers.get('darkMode'));
        this.elements.originalPrompt.removeEventListener('input', this.boundHandlers.get('autoResize'));
        this.elements.promptMedium.removeEventListener('change', this.boundHandlers.get('mediumChange'));
        this.elements.promptType.removeEventListener('change', this.boundHandlers.get('typeChange'));

        // Clear bound handlers
        this.boundHandlers.clear();

        // Cleanup features
        uiFeatures.darkMode.cleanup();
        uiFeatures.savedPrompts.cleanup();
    }

    async generateEnhancedPrompt() {
        const originalPrompt = this.elements.originalPrompt.value.trim();
        if (!originalPrompt) {
            this.showNotification('Please enter a prompt to enhance', 'info');
            return;
        }

        // Set loading state
        this.elements.generateBtn.classList.add('loading');
        this.elements.generateBtn.innerHTML = '<i class="fas fa-spinner"></i> Enhancing...';
        this.elements.enhancedPrompt.innerHTML = '<p>Processing prompt...</p>';
        this.elements.improvementsList.innerHTML = '';

        try {
            // Get the selected medium and type
            const medium = this.elements.promptMedium.value;
            const type = this.elements.promptType.value;

            // Log analytics for enhancement
            storageManager.logAnalytics('enhance', { medium, type, length: originalPrompt.length });

            // Get AI suggestions
            const aiSuggestions = await aiPromptHelper.getSuggestions(originalPrompt, medium, type);

            // Get enhanced prompt from promptEnhancer
            const enhancedPrompt = await this.enhancer.enhance(originalPrompt, medium, type);
            
            // Format the enhanced prompt properly to ensure it fits in the container
            const formattedPrompt = this.formatEnhancedPrompt(enhancedPrompt, medium);
            
            // Display enhanced prompt
            this.elements.enhancedPrompt.innerHTML = formattedPrompt;
            
            // Add improvements
            this.elements.improvementsList.innerHTML = '';
            
            // Add improvements from AI suggestions
            aiSuggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="improvement-text">${suggestion}</span>`;
                this.elements.improvementsList.appendChild(li);
            });
            
            // Add basic improvements
            const basicImprovements = [
                'Added structural consistency',
                'Improved clarity and specificity',
                'Enhanced formatting for better readability'
            ];
            
            basicImprovements.forEach(improvement => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="improvement-text">${improvement}</span>`;
                this.elements.improvementsList.appendChild(li);
            });
            
            // Add type-specific improvements
            if (type === 'code') {
                const codeImprovements = [
                    'Added language-specific syntax guidance',
                    'Included error handling suggestions'
                ];
                
                codeImprovements.forEach(improvement => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="improvement-text">${improvement}</span>`;
                    this.elements.improvementsList.appendChild(li);
                });
            } else if (medium === 'image') {
                const imageImprovements = [
                    'Added style and composition details',
                    'Improved visual description clarity'
                ];
                
                imageImprovements.forEach(improvement => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="improvement-text">${improvement}</span>`;
                    this.elements.improvementsList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            this.elements.enhancedPrompt.innerHTML = '<p class="error">Error enhancing prompt. Please try again.</p>';
        } finally {
            // Remove loading state
            this.elements.generateBtn.classList.remove('loading');
            this.elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Enhance Prompt';
        }
    }

    // Format enhanced prompt for proper display
    formatEnhancedPrompt(prompt, medium) {
        // Sanitize HTML to prevent XSS
        const sanitizedPrompt = this.sanitizeHTML(prompt);
        
        if (medium === 'image') {
            // For image prompts, format with proper line breaks for parameters
            // This helps with midjourney/stable diffusion style prompts
            return sanitizedPrompt
                .replace(/\(([^)]+)\)/g, '<span class="parameter">($1)</span>')
                .replace(/\n/g, '<br>')
                .replace(/,\s+/g, ',<br>');
        } else {
            // For text prompts, preserve formatting but ensure proper wrapping
            return sanitizedPrompt.replace(/\n/g, '<br>');
        }
    }

    // Simple HTML sanitizer
    sanitizeHTML(text) {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
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
            medium: this.elements.promptMedium.value,
            type: this.elements.promptType.value
        };

        // Show share options if available
        const platforms = shareFeatures.getAvailablePlatforms();
        if (platforms.length > 1 && !navigator.share) {
            // If we have multiple platforms and no native share, show platform selection
            const platform = await this.showSharePlatformDialog(platforms);
            if (platform) {
                return await shareFeatures.sharePrompt(promptData, platform);
            }
            return { success: false, message: 'Share cancelled' };
        }

        // Otherwise use default sharing
        return await shareFeatures.sharePrompt(promptData);
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

    async savePrompt() {
        const originalText = this.elements.originalPrompt.value;
        const enhancedText = this.elements.enhancedPrompt.textContent;
        const medium = this.elements.promptMedium.value;
        const type = this.elements.promptType.value;

        if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
            uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
            return;
        }

        const promptData = {
            original: originalText,
            enhanced: enhancedText,
            medium: medium,
            type: type,
            timestamp: new Date().toISOString()
        };

        uiFeatures.savedPrompts.save(promptData);
        uiFeatures.savedPrompts.showViewer();
        uiFeatures.notifications.show('Prompt saved successfully!', 'success');
    }

    showSavedPrompts() {
        const viewer = document.getElementById('savedPromptsViewer');
        const listContainer = viewer.querySelector('.saved-prompts-list');
        const savedPrompts = uiFeatures.savedPrompts.getAll();

        listContainer.innerHTML = savedPrompts.length ? savedPrompts.map((prompt, index) => {
            const medium = prompt.medium || 'text'; // Default to text for backward compatibility
            const typeInfo = getTypeInfo(medium, prompt.type);
            const mediumInfo = getMediumInfo(medium);
            
            return `
                <div class="saved-prompt-item">
                    <div class="saved-prompt-header">
                        <div class="prompt-info">
                            <span class="prompt-medium">${mediumInfo?.name || 'Text'}</span>
                            <span class="prompt-separator">›</span>
                            <span class="prompt-type">${typeInfo?.name || 'General'}</span>
                        </div>
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
            `;
        }).join('') : '<div class="no-prompts">No saved prompts yet</div>';

        // Add event listeners for load and delete buttons
        listContainer.querySelectorAll('.load-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const prompt = savedPrompts[index];
                this.elements.originalPrompt.value = prompt.original;
                this.elements.promptMedium.value = prompt.medium || 'text';
                this.updatePromptTypes(prompt.medium || 'text');
                this.elements.promptType.value = prompt.type;
                this.generateEnhancedPrompt();
                uiFeatures.savedPrompts.hideViewer();
            });
        });

        listContainer.querySelectorAll('.delete-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                uiFeatures.savedPrompts.delete(index);
                this.showSavedPrompts(); // Refresh the list
                uiFeatures.notifications.show('Prompt deleted successfully!', 'success');
            });
        });

        uiFeatures.savedPrompts.showViewer();
    }

    getOptionsForType(medium, type) {
        const factors = getFactors(medium, type);
        const options = {};

        factors.forEach(factor => {
            options[factor] = true;
        });

        return options;
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
                
                // Set medium first, then update types
                this.elements.promptMedium.value = promptData.medium || 'text';
                this.updatePromptTypes(promptData.medium || 'text');
                this.elements.promptType.value = promptData.type;
                
                this.generateEnhancedPrompt();
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Failed to load shared prompt:', error);
                uiFeatures.notifications.show('Failed to load shared prompt.', 'error');
            }
        }
    }

    async handleTypeChange() {
        // Get current prompt text
        const promptText = this.elements.originalPrompt.value.trim();
        
        // If there's text and AI helper is available, analyze and suggest type
        if (promptText.length > 10) {
            try {
                const { medium, type } = await aiPromptHelper.analyzePromptType(promptText);
                
                // Only update if the suggested type is different
                if (medium !== this.elements.promptMedium.value) {
                    this.elements.promptMedium.value = medium;
                    this.updatePromptTypes(medium);
                }
                
                // Set the type after the options are updated
                setTimeout(() => {
                    this.elements.promptType.value = type;
                    this.showNotification(`Detected prompt type: ${medium} - ${type}`, 'info');
                }, 0);
            } catch (error) {
                console.error('Error analyzing prompt type:', error);
                // Silently fail - don't disrupt user experience
            }
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    updateDarkModeButton() {
        const isDark = uiFeatures.darkMode.isDark;
        this.elements.darkModeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        this.elements.darkModeBtn.setAttribute('aria-pressed', isDark.toString());
        this.elements.darkModeBtn.title = `${isDark ? 'Disable' : 'Enable'} dark mode`;
    }

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async exportPrompts() {
        try {
            await storageManager.exportPrompts();
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export prompts', 'error');
        }
    }
    
    async importPrompts(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            // Confirm import
            this.showConfirmDialog(
                'Import Prompts',
                'This will add the imported prompts to your existing collection. Continue?',
                async (confirmed) => {
                    if (confirmed) {
                        try {
                            const count = await storageManager.importPrompts(file);
                            this.showNotification(`Successfully imported ${count} prompts`, 'success');
                            // Refresh the saved prompts view if it's open
                            if (document.getElementById('savedPromptsViewer').classList.contains('show')) {
                                this.showSavedPrompts();
                            }
                        } catch (error) {
                            console.error('Import failed:', error);
                            this.showNotification('Import failed: ' + error.message, 'error');
                        }
                    }
                    // Reset the file input
                    event.target.value = '';
                }
            );
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Failed to import prompts', 'error');
            // Reset the file input
            event.target.value = '';
        }
    }
    
    async searchSavedPrompts() {
        const query = this.elements.promptSearchField.value.trim();
        const prompts = await storageManager.searchPrompts(query);
        this.renderSavedPrompts(prompts);
    }
    
    renderSavedPrompts(prompts) {
        const savedPromptsList = document.querySelector('.saved-prompts-list');
        
        if (!prompts || prompts.length === 0) {
            savedPromptsList.innerHTML = '<div class="no-prompts">No saved prompts found</div>';
            return;
        }
        
        // Sort prompts by date (newest first)
        prompts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        savedPromptsList.innerHTML = '';
        
        prompts.forEach(prompt => {
            const date = new Date(prompt.date);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            const promptElement = document.createElement('div');
            promptElement.className = 'saved-prompt-item';
            promptElement.dataset.id = prompt.id;
            
            promptElement.innerHTML = `
                <div class="prompt-info">
                    <div class="prompt-content">
                        <strong>${prompt.medium} - ${prompt.type}</strong>
                        <p>${this.truncateText(prompt.original, 80)}</p>
                    </div>
                    <div class="prompt-date">${formattedDate}</div>
                </div>
                <div class="prompt-actions">
                    <button class="load-prompt-btn" title="Load Prompt">
                        <i class="fas fa-upload"></i>
                    </button>
                    <button class="delete-prompt-btn" title="Delete Prompt">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Load prompt event
            promptElement.querySelector('.load-prompt-btn').addEventListener('click', () => {
                this.loadPrompt(prompt);
            });
            
            // Delete prompt event
            promptElement.querySelector('.delete-prompt-btn').addEventListener('click', () => {
                this.showConfirmDialog(
                    'Delete Prompt',
                    'Are you sure you want to delete this prompt?',
                    async (confirmed) => {
                        if (confirmed) {
                            try {
                                await storageManager.deletePrompt(prompt.id);
                                promptElement.remove();
                                this.showNotification('Prompt deleted successfully', 'success');
                                
                                // Check if there are no more prompts
                                if (savedPromptsList.children.length === 0) {
                                    savedPromptsList.innerHTML = '<div class="no-prompts">No saved prompts found</div>';
                                }
                            } catch (error) {
                                console.error('Failed to delete prompt:', error);
                                this.showNotification('Failed to delete prompt', 'error');
                            }
                        }
                    }
                );
            });
            
            savedPromptsList.appendChild(promptElement);
        });
    }
    
    loadPrompt(prompt) {
        // Set values
        this.elements.originalPrompt.value = prompt.original;
        this.elements.promptMedium.value = prompt.medium;
        this.updatePromptTypes(prompt.medium);
        setTimeout(() => {
            this.elements.promptType.value = prompt.type;
        }, 0);
        
        // Set enhanced prompt
        this.elements.enhancedPrompt.innerHTML = prompt.enhanced;
        
        // Set improvements if available
        if (prompt.improvements && Array.isArray(prompt.improvements)) {
            this.elements.improvementsList.innerHTML = '';
            prompt.improvements.forEach(improvement => {
                const li = document.createElement('li');
                li.textContent = improvement;
                this.elements.improvementsList.appendChild(li);
            });
        }
        
        // Close the saved prompts viewer
        document.getElementById('savedPromptsViewer').classList.remove('show');
        
        // Auto-resize the textarea
        this.autoResizeTextarea(this.elements.originalPrompt);
        
        this.showNotification('Prompt loaded', 'success');
    }
    
    showNotification(message, type = 'info') {
        this.elements.notification.textContent = message;
        this.elements.notification.className = `notification ${type}`;
        this.elements.notification.classList.add('show');
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }
    
    showConfirmDialog(title, message, callback) {
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.elements.confirmDialog.style.display = 'flex';
    }
    
    hideConfirmDialog() {
        this.elements.confirmDialog.style.display = 'none';
        this.confirmCallback = null;
    }
    
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Load footer content
async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        if (!response.ok) {
            throw new Error(`Failed to load footer: ${response.status}`);
        }
        const footerContent = await response.text();
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = footerContent;
        } else {
            console.error('Footer container not found');
        }
    } catch (error) {
        console.error('Failed to load footer:', error);
        uiFeatures.notifications.show('Failed to load page footer', 'error');
    }
}

// Initialize the UI
let promptUI;
try {
    promptUI = new PromptUI();
    
    // Load footer immediately
    loadFooter().catch(error => {
        console.error('Footer loading error:', error);
    });
    
    // Cleanup on page unload
    window.addEventListener('unload', () => {
        if (promptUI) {
            promptUI.cleanup();
        }
    });
} catch (error) {
    console.error('Initialization error:', error);
    uiFeatures.notifications.show('Failed to initialize application. Please refresh the page.', 'error');
}

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