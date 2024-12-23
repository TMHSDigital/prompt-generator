// Import separated feature modules
import { darkMode } from './darkMode.js';
import { savedPrompts } from './savedPrompts.js';
import { shareFeatures } from './shareFeatures.js';

// Notifications module
const notifications = {
    timeoutId: null,
    show(message, type = 'info') {
        this.clear();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Force reflow to trigger animation
        notification.offsetHeight;
        notification.classList.add('show');
        
        this.timeoutId = setTimeout(() => this.clear(), 3000);
    },
    
    clear() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
    }
};

// Loading state module
const loadingState = {
    show(element) {
        const originalContent = element.innerHTML;
        element.innerHTML = '<i class="fas fa-spinner"></i>';
        element.classList.add('loading');
        return () => {
            element.innerHTML = originalContent;
            element.classList.remove('loading');
        };
    }
};

// Character counter module
const characterCounter = {
    initialize(textarea, counter) {
        const maxLength = parseInt(textarea.dataset.maxLength) || 2000;
        const updateCount = () => {
            const count = textarea.value.length;
            counter.textContent = `${count}/${maxLength}`;
            counter.style.color = count > maxLength ? 'var(--notification-error)' : '';
        };
        textarea.addEventListener('input', updateCount);
        updateCount();
    }
};

// Export all UI features
export const uiFeatures = {
    darkMode: {
        ...darkMode,
        cleanup() {
            // Remove system color scheme listener if it exists
            if (this.systemThemeQuery) {
                this.systemThemeQuery.removeEventListener('change', this.handleSystemThemeChange);
            }
        }
    },
    savedPrompts: {
        ...savedPrompts,
        cleanup() {
            // Remove event listeners from saved prompts viewer
            const viewer = document.getElementById('savedPromptsViewer');
            if (viewer) {
                const closeBtn = viewer.querySelector('.close-viewer-btn');
                if (closeBtn) {
                    closeBtn.removeEventListener('click', this.hideViewer);
                }
            }
        }
    },
    shareFeatures,
    notifications: {
        ...notifications,
        cleanup() {
            this.clear();
        }
    },
    loadingState,
    characterCounter: {
        ...characterCounter,
        cleanup() {
            // Character counter cleanup would be handled by the element removal
        }
    }
}; 