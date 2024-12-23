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
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'AI Prompt Generator',
                        text: shareText,
                        url: this.generateShareLink(promptData)
                    });
                    return { success: true };
                } catch (err) {
                    console.error('Share failed:', err);
                    return this.fallbackShare(shareText);
                }
            } else {
                return this.fallbackShare(shareText);
            }
        },

        fallbackShare(text) {
            return navigator.clipboard.writeText(text)
                .then(() => ({ success: true, message: 'Share link copied to clipboard!' }))
                .catch(() => ({ success: false, message: 'Failed to copy share link.' }));
        }
    },

    darkMode: {
        isDark: false,
        
        initialize() {
            this.isDark = localStorage.getItem('darkMode') === 'true';
            this.applyTheme();
            
            // Watch for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.isDark = e.matches;
                this.applyTheme();
            });
        },

        toggle() {
            this.isDark = !this.isDark;
            localStorage.setItem('darkMode', this.isDark);
            this.applyTheme();
        },

        applyTheme() {
            document.documentElement.classList.toggle('dark-mode', this.isDark);
        }
    },

    characterCounter: {
        initialize(textarea, counter) {
            this.updateCount(textarea, counter);
            textarea.addEventListener('input', () => this.updateCount(textarea, counter));
        },

        updateCount(textarea, counter) {
            const maxLength = textarea.getAttribute('data-max-length') || 2000;
            const currentLength = textarea.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            counter.classList.toggle('near-limit', currentLength > maxLength * 0.9);
        }
    },

    loadingState: {
        show(button) {
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
            return () => {
                button.disabled = false;
                button.innerHTML = originalText;
            };
        }
    },

    notifications: {
        show(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }, 100);
        }
    }
}; 