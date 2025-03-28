import storageManager from './storageManager.js'; // Import the storage manager

// Dark Mode Feature Module
export const darkMode = {
    isDark: false,
    async initialize() { // Make initialize async
        // Check saved preference first using storageManager
        const savedPreference = await storageManager.getSetting('darkMode'); // Use await and getSetting
        
        if (savedPreference === 'true' || savedPreference === true) { // Check for boolean true as well
            await this.enable(); // Await enable
            return;
        } else if (savedPreference === 'false' || savedPreference === false) {
            await this.disable(); // Await disable
            return;
        }
        
        // If no saved preference, check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            await this.enable(false); // Enable but don't save yet, let listener handle saving if needed
        } else {
            await this.disable(false); // Ensure consistent state
        }

        // Add system preference change listener
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', async (e) => { // Make listener async
                // Only change based on system if no explicit user choice is saved
                const userPreference = await storageManager.getSetting('darkMode');
                if (userPreference === null || userPreference === undefined) { 
                    if (e.matches) {
                        await this.enable(false); // Enable but don't save, respecting no explicit choice
                    } else {
                        await this.disable(false); // Disable but don't save
                    }
                }
            });
    },
    async enable(save = true) { // Add save flag, make async
        document.body.classList.add('dark-mode');
        this.isDark = true;
        if (save) {
            await storageManager.saveSetting('darkMode', true); // Use saveSetting, save boolean true
        }
    },
    async disable(save = true) { // Add save flag, make async
        document.body.classList.remove('dark-mode');
        this.isDark = false;
        if (save) {
             await storageManager.saveSetting('darkMode', false); // Use saveSetting, save boolean false
        }
    },
    async toggle() { // Make toggle async
        if (this.isDark) {
            await this.disable(); // Await disable
            return false;
        } else {
            await this.enable(); // Await enable
            return true;
        }
    }
}; 