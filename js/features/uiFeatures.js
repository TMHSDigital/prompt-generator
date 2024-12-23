// UI Feature Modules
export const uiFeatures = {
    sharing: {
        generateShareLink(promptData) {
            const shareData = {
                type: promptData.type,
                original: promptData.original,
                enhanced: promptData.enhanced
            };
            return `${window.location.origin}${window.location.pathname}?share=${btoa(JSON.stringify(shareData))}`;
        },

        async sharePrompt(promptData) {
            const shareText = `Check out this enhanced AI prompt:\n\nOriginal: ${promptData.original}\n\nEnhanced: ${promptData.enhanced}`;
            const shareUrl = this.generateShareLink(promptData);
            
            // Try native share API first
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'AI Prompt Generator',
                        text: shareText,
                        url: shareUrl
                    });
                    return { success: true, message: 'Shared successfully!' };
                } catch (err) {
                    console.warn('Native share failed, falling back to clipboard:', err);
                }
            }
            
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(`${shareText}\n\nTry it yourself: ${shareUrl}`);
                return { success: true, message: 'Share link copied to clipboard!' };
            } catch (err) {
                console.error('Clipboard fallback failed:', err);
                return { success: false, message: 'Failed to share. Please try copying manually.' };
            }
        }
    },

    darkMode: {
        isDark: false,
        initialize() {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.enable();
            }
            // Check saved preference
            const savedPreference = localStorage.getItem('darkMode');
            if (savedPreference === 'true') {
                this.enable();
            }
        },
        enable() {
            document.body.classList.add('dark-mode');
            this.isDark = true;
            localStorage.setItem('darkMode', 'true');
        },
        disable() {
            document.body.classList.remove('dark-mode');
            this.isDark = false;
            localStorage.setItem('darkMode', 'false');
        },
        toggle() {
            if (this.isDark) {
                this.disable();
                return false;
            } else {
                this.enable();
                return true;
            }
        }
    },

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
    },

    savedPrompts: {
        initialize() {
            // Add click outside listener to close saved prompts viewer
            document.addEventListener('click', (e) => {
                const viewer = document.getElementById('savedPromptsViewer');
                if (viewer && viewer.classList.contains('show')) {
                    if (!viewer.querySelector('.saved-prompts-content').contains(e.target)) {
                        viewer.classList.remove('show');
                    }
                }
            });

            // Add escape key listener
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const viewer = document.getElementById('savedPromptsViewer');
                    if (viewer && viewer.classList.contains('show')) {
                        viewer.classList.remove('show');
                    }
                }
            });
        }
    }
}; 