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
            // Check local storage first
            const storedPreference = localStorage.getItem('darkMode');
            
            if (storedPreference !== null) {
                this.isDark = storedPreference === 'true';
            } else {
                // Check system preference
                this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            // Apply initial theme
            this.applyTheme();
            
            // Watch for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (localStorage.getItem('darkMode') === null) {
                    this.isDark = e.matches;
                    this.applyTheme();
                }
            });
        },

        toggle() {
            this.isDark = !this.isDark;
            localStorage.setItem('darkMode', this.isDark);
            this.applyTheme();
            return this.isDark; // Return new state for UI updates
        },

        applyTheme() {
            document.documentElement.classList.toggle('dark-mode', this.isDark);
            // Update favicon and meta theme color
            this.updateMetaTheme();
        },

        updateMetaTheme() {
            const themeColor = this.isDark ? '#1a1a1a' : '#f8fafc';
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
                metaTheme.setAttribute('content', themeColor);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'theme-color';
                meta.content = themeColor;
                document.head.appendChild(meta);
            }
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