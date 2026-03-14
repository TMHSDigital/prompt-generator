import { PromptEnhancer } from './features/promptEnhancer.js';
import { mediumTypes } from './features/promptTypes.js';
import { uiFeatures } from './features/uiFeatures.js';
import aiPromptHelper from './features/aiSuggestions.js';
import storageManager from './features/storageManager.js';

import {
    autoResizeTextarea,
    sanitizeHTML,
    formatEnhancedPrompt,
    showNotification,
    showConfirmDialog,
    hideConfirmDialog,
    truncateText,
    updateDarkModeButton,
    debounce,
} from './ui.js';

import { sharePrompt, copyToClipboard } from './share.js';

import {
    savePrompt,
    showSavedPrompts,
    ensureSavedPromptsViewer,
    loadPrompt,
    exportPrompts,
    importPrompts,
    searchSavedPrompts,
    renderSavedPrompts,
} from './storage.js';

// Error handling for module loading
window.addEventListener('error', event => {
    if (event.filename?.includes('.js')) {
        console.error('Module loading error:', event.error);
        uiFeatures.notifications.show('Failed to load application. Please refresh the page.', 'error');
    }
});

class PromptUI {
    constructor() {
        this.enhancer = new PromptEnhancer();
        this.boundHandlers = new Map();
        this.confirmCallback = null;
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
            confirmMessage: document.getElementById('confirmMessage'),
        };

        this.updateMediumTypes();
        this.updatePromptTypes(this.elements.promptMedium.value);
    }

    updateMediumTypes() {
        const { promptMedium } = this.elements;
        promptMedium.innerHTML = '';
        Object.entries(mediumTypes).forEach(([value, info]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = info.name;
            promptMedium.appendChild(option);
        });
    }

    updatePromptTypes(medium) {
        const { promptType } = this.elements;
        const mediumInfo = mediumTypes[medium];
        if (!mediumInfo) return;

        promptType.innerHTML = '';
        Object.entries(mediumInfo.types).forEach(([value, info]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = info.name;
            promptType.appendChild(option);
        });
    }

    async initializeFeatures() {
        await uiFeatures.darkMode.initialize();
        this.updateDarkModeButton();

        uiFeatures.characterCounter.initialize(
            this.elements.originalPrompt,
            this.elements.charCounter
        );

        await uiFeatures.savedPrompts.initialize();
    }

    attachEventListeners() {
        const el = this.elements;

        this.boundHandlers.set('generate', () => this.generateEnhancedPrompt());
        this.boundHandlers.set('copy', () => copyToClipboard(el, uiFeatures));
        this.boundHandlers.set('share', async () => {
            const result = await sharePrompt(el, uiFeatures);
            uiFeatures.notifications.show(result.message, result.success ? 'success' : 'error');
        });
        this.boundHandlers.set('save', () => savePrompt(el, uiFeatures));
        this.boundHandlers.set('darkMode', async () => {
            const isDark = await uiFeatures.darkMode.toggle();
            this.updateDarkModeButton();
            uiFeatures.notifications.show(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
        });
        this.boundHandlers.set('autoResize', e => autoResizeTextarea(e.target));
        this.boundHandlers.set('mediumChange', e => {
            this.updatePromptTypes(e.target.value);
            this.handleTypeChange();
        });
        this.boundHandlers.set('typeChange', () => this.handleTypeChange());

        el.exportBtn.addEventListener('click', () =>
            exportPrompts(storageManager, (msg, type) => showNotification(el, msg, type))
        );
        el.importFile.addEventListener('change', e =>
            importPrompts(
                e,
                storageManager,
                (title, msg, cb) => showConfirmDialog(el, title, msg, cb, this),
                (msg, type) => showNotification(el, msg, type),
                () => this.showSavedPrompts()
            )
        );

        el.promptSearchField.addEventListener(
            'input',
            debounce(
                () =>
                    searchSavedPrompts(
                        el.promptSearchField.value.trim(),
                        storageManager,
                        prompts =>
                            renderSavedPrompts(
                                prompts,
                                (text, max) => truncateText(text, max),
                                prompt => loadPrompt(el, prompt, m => this.updatePromptTypes(m), (msg, t) => showNotification(el, msg, t)),
                                (prompt, promptEl, list) => this._handleDeletePrompt(prompt, promptEl, list)
                            )
                    ),
                300
            )
        );

        el.confirmOk.addEventListener('click', () => {
            if (typeof this.confirmCallback === 'function') this.confirmCallback(true);
            hideConfirmDialog(el, this);
        });
        el.confirmCancel.addEventListener('click', () => {
            if (typeof this.confirmCallback === 'function') this.confirmCallback(false);
            hideConfirmDialog(el, this);
        });

        el.generateBtn.addEventListener('click', this.boundHandlers.get('generate'));
        el.copyBtn.addEventListener('click', this.boundHandlers.get('copy'));
        el.shareBtn.addEventListener('click', this.boundHandlers.get('share'));
        el.saveBtn.addEventListener('click', this.boundHandlers.get('save'));
        el.darkModeBtn.addEventListener('click', this.boundHandlers.get('darkMode'));
        el.originalPrompt.addEventListener('input', this.boundHandlers.get('autoResize'));
        el.promptMedium.addEventListener('change', this.boundHandlers.get('mediumChange'));
        el.promptType.addEventListener('change', this.boundHandlers.get('typeChange'));

        el.originalPrompt.addEventListener(
            'input',
            debounce(() => {
                autoResizeTextarea(el.originalPrompt);
                if (el.originalPrompt.value.length > 15) {
                    this.handleTypeChange();
                }
            }, 1000)
        );
    }

    cleanup() {
        const el = this.elements;
        el.generateBtn.removeEventListener('click', this.boundHandlers.get('generate'));
        el.copyBtn.removeEventListener('click', this.boundHandlers.get('copy'));
        el.shareBtn.removeEventListener('click', this.boundHandlers.get('share'));
        el.saveBtn.removeEventListener('click', this.boundHandlers.get('save'));
        el.darkModeBtn.removeEventListener('click', this.boundHandlers.get('darkMode'));
        el.originalPrompt.removeEventListener('input', this.boundHandlers.get('autoResize'));
        el.promptMedium.removeEventListener('change', this.boundHandlers.get('mediumChange'));
        el.promptType.removeEventListener('change', this.boundHandlers.get('typeChange'));
        this.boundHandlers.clear();
        uiFeatures.darkMode.cleanup();
        uiFeatures.savedPrompts.cleanup();
    }

    async generateEnhancedPrompt() {
        const originalPrompt = this.elements.originalPrompt.value.trim();
        if (!originalPrompt) {
            showNotification(this.elements, 'Please enter a prompt to enhance', 'info');
            return;
        }

        const el = this.elements;
        el.generateBtn.classList.add('loading');
        el.generateBtn.innerHTML = '<i class="fas fa-spinner"></i> Enhancing...';
        el.enhancedPrompt.innerHTML = '<p>Processing prompt...</p>';
        el.improvementsList.innerHTML = '';

        try {
            const medium = el.promptMedium.value;
            const type = el.promptType.value;

            storageManager.logAnalytics('enhance', { medium, type, length: originalPrompt.length });

            const aiSuggestions = await aiPromptHelper.getSuggestions(originalPrompt, medium, type);
            const result = await this.enhancer.enhance(originalPrompt, medium, type);

            el.enhancedPrompt.innerHTML = formatEnhancedPrompt(result.enhancedPrompt, medium);
            el.improvementsList.innerHTML = '';

            const allImprovements = [
                ...result.improvements,
                ...aiSuggestions,
                ...this._baseImprovements(medium, type),
            ];
            const unique = [...new Set(allImprovements)];
            unique.forEach(text => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="improvement-text">${text}</span>`;
                el.improvementsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            el.enhancedPrompt.innerHTML = '<p class="error">Error enhancing prompt. Please try again.</p>';
        } finally {
            el.generateBtn.classList.remove('loading');
            el.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Enhance Prompt';
        }
    }

    _baseImprovements(medium, type) {
        const base = [
            'Added structural consistency',
            'Improved clarity and specificity',
            'Enhanced formatting for better readability',
        ];
        if (type === 'code') {
            base.push('Added language-specific syntax guidance', 'Included error handling suggestions');
        } else if (medium === 'image') {
            base.push('Added style and composition details', 'Improved visual description clarity');
        }
        return base;
    }

    loadSavedPrompts() {
        ensureSavedPromptsViewer();
    }

    showSavedPrompts() {
        showSavedPrompts(
            this.elements,
            uiFeatures,
            medium => this.updatePromptTypes(medium),
            () => this.generateEnhancedPrompt()
        );
    }

    checkForSharedPrompt() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('share');
        if (!sharedData) return;

        try {
            const promptData = JSON.parse(atob(sharedData));
            this.elements.originalPrompt.value = promptData.original;
            this.elements.promptMedium.value = promptData.medium || 'text';
            this.updatePromptTypes(promptData.medium || 'text');
            this.elements.promptType.value = promptData.type;
            this.generateEnhancedPrompt();
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Failed to load shared prompt:', error);
            uiFeatures.notifications.show('Failed to load shared prompt.', 'error');
        }
    }

    async handleTypeChange() {
        const promptText = this.elements.originalPrompt.value.trim();
        if (promptText.length <= 10) return;

        try {
            const { medium, type } = await aiPromptHelper.analyzePromptType(promptText);
            if (medium !== this.elements.promptMedium.value) {
                this.elements.promptMedium.value = medium;
                this.updatePromptTypes(medium);
            }
            setTimeout(() => {
                this.elements.promptType.value = type;
                showNotification(this.elements, `Detected prompt type: ${medium} - ${type}`, 'info');
            }, 0);
        } catch (error) {
            console.error('Error analyzing prompt type:', error);
        }
    }

    updateDarkModeButton() {
        updateDarkModeButton(this.elements, uiFeatures);
    }

    async _handleDeletePrompt(prompt, promptElement, list) {
        showConfirmDialog(
            this.elements,
            'Delete Prompt',
            'Are you sure you want to delete this prompt?',
            async confirmed => {
                if (confirmed) {
                    try {
                        await storageManager.deletePrompt(prompt.id);
                        promptElement.remove();
                        showNotification(this.elements, 'Prompt deleted successfully', 'success');
                        if (list.children.length === 0) {
                            list.innerHTML = '<div class="no-prompts">No saved prompts found</div>';
                        }
                    } catch (error) {
                        console.error('Failed to delete prompt:', error);
                        showNotification(this.elements, 'Failed to delete prompt', 'error');
                    }
                }
            },
            this
        );
    }
}

async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        if (!response.ok) throw new Error(`Failed to load footer: ${response.status}`);
        const footerContent = await response.text();
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = footerContent;
        }
    } catch (error) {
        console.error('Failed to load footer:', error);
        uiFeatures.notifications.show('Failed to load page footer', 'error');
    }
}

let promptUI;
try {
    promptUI = new PromptUI();
    loadFooter().catch(error => console.error('Footer loading error:', error));
    window.addEventListener('unload', () => promptUI?.cleanup());
} catch (error) {
    console.error('Initialization error:', error);
    uiFeatures.notifications.show('Failed to initialize application. Please refresh the page.', 'error');
}

document.addEventListener('DOMContentLoaded', () => {
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        darkModeBtn.classList.add('pulse');
        setTimeout(() => darkModeBtn.classList.remove('pulse'), 6000);
        darkModeBtn.addEventListener('mouseenter', () => darkModeBtn.classList.remove('pulse'));
        darkModeBtn.addEventListener('click', () => darkModeBtn.classList.remove('pulse'));
    }
});
