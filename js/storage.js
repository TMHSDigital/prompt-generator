/**
 * Storage utilities — save, load, search, export, import prompts.
 */
import { getTypeInfo, getMediumInfo } from './features/promptTypes.js';

/**
 * @param {object} elements
 * @param {object} uiFeatures
 */
export async function savePrompt(elements, uiFeatures) {
    const originalText = elements.originalPrompt.value;
    const enhancedText = elements.enhancedPrompt.textContent;
    const medium = elements.promptMedium.value;
    const type = elements.promptType.value;

    if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here...')) {
        uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
        return;
    }

    const promptData = {
        original: originalText,
        enhanced: enhancedText,
        medium,
        type,
        timestamp: new Date().toISOString(),
    };

    uiFeatures.savedPrompts.save(promptData);
    uiFeatures.savedPrompts.showViewer();
    uiFeatures.notifications.show('Prompt saved successfully!', 'success');
}

/**
 * @param {object} elements
 * @param {object} uiFeatures
 * @param {Function} updatePromptTypes
 * @param {Function} generateEnhancedPrompt
 */
export function showSavedPrompts(elements, uiFeatures, updatePromptTypes, generateEnhancedPrompt) {
    const viewer = document.getElementById('savedPromptsViewer');
    const listContainer = viewer.querySelector('.saved-prompts-list');
    const savedPrompts = uiFeatures.savedPrompts.getAll();

    listContainer.innerHTML = savedPrompts.length
        ? savedPrompts.map((prompt, index) => {
              const medium = prompt.medium || 'text';
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
          }).join('')
        : '<div class="no-prompts">No saved prompts yet</div>';

    listContainer.querySelectorAll('.load-prompt-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = e.currentTarget.dataset.index;
            const prompt = savedPrompts[index];
            elements.originalPrompt.value = prompt.original;
            elements.promptMedium.value = prompt.medium || 'text';
            updatePromptTypes(prompt.medium || 'text');
            elements.promptType.value = prompt.type;
            generateEnhancedPrompt();
            uiFeatures.savedPrompts.hideViewer();
        });
    });

    listContainer.querySelectorAll('.delete-prompt-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = e.currentTarget.dataset.index;
            uiFeatures.savedPrompts.delete(index);
            showSavedPrompts(elements, uiFeatures, updatePromptTypes, generateEnhancedPrompt);
            uiFeatures.notifications.show('Prompt deleted successfully!', 'success');
        });
    });

    uiFeatures.savedPrompts.showViewer();
}

/**
 * Ensures the savedPromptsViewer DOM element exists.
 */
export function ensureSavedPromptsViewer() {
    if (document.getElementById('savedPromptsViewer')) return;

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

    viewer.querySelector('.close-viewer-btn').addEventListener('click', () => {
        viewer.classList.remove('show');
    });
}

/**
 * @param {object} elements
 * @param {Function} updatePromptTypes
 */
export function loadPrompt(elements, prompt, updatePromptTypes, showNotification) {
    elements.originalPrompt.value = prompt.original;
    elements.promptMedium.value = prompt.medium;
    updatePromptTypes(prompt.medium);
    setTimeout(() => {
        elements.promptType.value = prompt.type;
    }, 0);

    elements.enhancedPrompt.innerHTML = prompt.enhanced;

    if (prompt.improvements && Array.isArray(prompt.improvements)) {
        elements.improvementsList.innerHTML = '';
        prompt.improvements.forEach(improvement => {
            const li = document.createElement('li');
            li.textContent = improvement;
            elements.improvementsList.appendChild(li);
        });
    }

    document.getElementById('savedPromptsViewer').classList.remove('show');

    elements.originalPrompt.style.height = 'auto';
    elements.originalPrompt.style.height = elements.originalPrompt.scrollHeight + 'px';

    showNotification('Prompt loaded', 'success');
}

/**
 * @param {object} storageManager
 * @param {Function} showNotification
 */
export async function exportPrompts(storageManager, showNotification) {
    try {
        await storageManager.exportPrompts();
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export prompts', 'error');
    }
}

/**
 * @param {Event} event
 * @param {object} storageManager
 * @param {Function} showConfirmDialog
 * @param {Function} showNotification
 * @param {Function} refreshView - called after successful import if viewer is open
 */
export async function importPrompts(event, storageManager, showConfirmDialog, showNotification, refreshView) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        showConfirmDialog(
            'Import Prompts',
            'This will add the imported prompts to your existing collection. Continue?',
            async confirmed => {
                if (confirmed) {
                    try {
                        const count = await storageManager.importPrompts(file);
                        showNotification(`Successfully imported ${count} prompts`, 'success');
                        if (document.getElementById('savedPromptsViewer')?.classList.contains('show')) {
                            refreshView();
                        }
                    } catch (error) {
                        console.error('Import failed:', error);
                        showNotification('Import failed: ' + error.message, 'error');
                    }
                }
                event.target.value = '';
            }
        );
    } catch (error) {
        console.error('Import failed:', error);
        showNotification('Failed to import prompts', 'error');
        event.target.value = '';
    }
}

/**
 * @param {string} query
 * @param {object} storageManager
 * @param {Function} renderSavedPrompts
 */
export async function searchSavedPrompts(query, storageManager, renderSavedPrompts) {
    const prompts = await storageManager.searchPrompts(query);
    renderSavedPrompts(prompts);
}

/**
 * @param {object[]} prompts
 * @param {Function} truncateText
 * @param {Function} onLoad  - (prompt) => void
 * @param {Function} onDelete - (prompt, promptElement) => void
 */
export function renderSavedPrompts(prompts, truncateText, onLoad, onDelete) {
    const savedPromptsList = document.querySelector('.saved-prompts-list');

    if (!prompts || prompts.length === 0) {
        savedPromptsList.innerHTML = '<div class="no-prompts">No saved prompts found</div>';
        return;
    }

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
                    <p>${truncateText(prompt.original, 80)}</p>
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

        promptElement.querySelector('.load-prompt-btn').addEventListener('click', () => {
            onLoad(prompt);
        });

        promptElement.querySelector('.delete-prompt-btn').addEventListener('click', () => {
            onDelete(prompt, promptElement, savedPromptsList);
        });

        savedPromptsList.appendChild(promptElement);
    });
}
