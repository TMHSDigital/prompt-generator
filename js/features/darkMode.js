// Dark Mode Feature Module
export const darkMode = {
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
}; 