// Dark Mode Feature Module
export const darkMode = {
    isDark: false,
    initialize() {
        // Check saved preference first
        const savedPreference = localStorage.getItem('darkMode');
        if (savedPreference === 'true') {
            this.enable();
            return;
        }
        
        // Then check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.enable();
        }

        // Add system preference change listener
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (localStorage.getItem('darkMode') === null) {
                    if (e.matches) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }
            });
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