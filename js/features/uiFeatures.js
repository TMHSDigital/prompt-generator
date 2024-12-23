// Import separated feature modules
import { darkMode } from './darkMode.js';
import { savedPrompts } from './savedPrompts.js';
import { shareFeatures } from './shareFeatures.js';

// UI Features Module
export const uiFeatures = {
    darkMode,
    savedPrompts,
    shareFeatures,

    characterCounter: {
        initialize(textarea, counter, maxLength = 2000) {
            const updateCount = () => {
                const length = textarea.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                if (length >= maxLength * 0.9) {
                    counter.classList.add('near-limit');
                } else {
                    counter.classList.remove('near-limit');
                }
            };

            textarea.addEventListener('input', updateCount);
            updateCount();
        }
    },

    loadingState: {
        show(button) {
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            button.disabled = true;
            button.classList.add('loading');

            return () => {
                button.innerHTML = originalContent;
                button.disabled = false;
                button.classList.remove('loading');
            };
        }
    },

    notifications: {
        show(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);

            // Trigger animation
            setTimeout(() => notification.classList.add('show'), 10);

            // Remove after delay
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
}; 