/**
 * StorageManager module
 * Provides abstracted storage functionality using either IndexedDB or localStorage
 * Handles data persistence, export/import, and storage limit management
 */

// IndexedDB configuration
const DB_NAME = 'promptEngineDB';
const DB_VERSION = 1;
const PROMPT_STORE = 'prompts';
const SETTINGS_STORE = 'settings';
const ANALYTICS_STORE = 'analytics';

class StorageManager {
    constructor() {
        this.db = null;
        this.isIndexedDBSupported = 'indexedDB' in window;
        this.init();
    }

    /**
     * Initialize storage - setup IndexedDB if supported, otherwise fall back to localStorage
     */
    async init() {
        if (!this.isIndexedDBSupported) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            return;
        }

        try {
            this.db = await this.openDatabase();
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            this.isIndexedDBSupported = false;
        }
    }

    /**
     * Open and configure the IndexedDB database
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create prompt store
                if (!db.objectStoreNames.contains(PROMPT_STORE)) {
                    const promptStore = db.createObjectStore(PROMPT_STORE, { keyPath: 'id', autoIncrement: true });
                    promptStore.createIndex('date', 'date');
                    promptStore.createIndex('type', 'type');
                    promptStore.createIndex('medium', 'medium');
                }
                
                // Create settings store
                if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                    db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
                }
                
                // Create analytics store 
                if (!db.objectStoreNames.contains(ANALYTICS_STORE)) {
                    const analyticsStore = db.createObjectStore(ANALYTICS_STORE, { keyPath: 'id', autoIncrement: true });
                    analyticsStore.createIndex('date', 'date');
                    analyticsStore.createIndex('action', 'action');
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Save a prompt to storage
     * @param {Object} promptData - Prompt data to save
     * @returns {Promise<number>} - ID of saved prompt
     */
    async savePrompt(promptData) {
        if (this.isIndexedDBSupported && this.db) {
            return this.savePromptToIndexedDB(promptData);
        } else {
            return this.savePromptToLocalStorage(promptData);
        }
    }

    /**
     * Save prompt to IndexedDB
     */
    savePromptToIndexedDB(promptData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROMPT_STORE], 'readwrite');
            const store = transaction.objectStore(PROMPT_STORE);
            
            // Make sure date is always set
            if (!promptData.date) {
                promptData.date = new Date().toISOString();
            }
            
            const request = store.add(promptData);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Save prompt to localStorage with fallback
     */
    savePromptToLocalStorage(promptData) {
        return new Promise((resolve) => {
            try {
                // Get existing prompts
                let prompts = [];
                try {
                    const savedPrompts = localStorage.getItem('savedPrompts');
                    prompts = savedPrompts ? JSON.parse(savedPrompts) : [];
                } catch (e) {
                    prompts = [];
                }
                
                // Clean up storage if approaching limit (4MB to be safe)
                this.cleanupLocalStorageIfNeeded(prompts);
                
                // Add ID if not present
                if (!promptData.id) {
                    promptData.id = Date.now();
                }
                
                // Make sure date is set
                if (!promptData.date) {
                    promptData.date = new Date().toISOString();
                }
                
                // Add new prompt
                prompts.push(promptData);
                
                // Save back to storage
                localStorage.setItem('savedPrompts', JSON.stringify(prompts));
                
                resolve(promptData.id);
            } catch (error) {
                console.error('Failed to save prompt to localStorage:', error);
                this.showStorageError();
                resolve(null);
            }
        });
    }

    /**
     * Clean up localStorage if approaching limits
     */
    cleanupLocalStorageIfNeeded(prompts) {
        try {
            // Check current storage usage
            const currentSize = new Blob([localStorage.getItem('savedPrompts') || '']).size;
            const maxSize = 4 * 1024 * 1024; // 4MB max size to be safe
            
            if (currentSize > maxSize * 0.8) {
                // If over 80% of max, remove oldest prompts
                prompts.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Remove oldest 20% of prompts
                const removeCount = Math.ceil(prompts.length * 0.2);
                prompts.splice(0, removeCount);
                
                // Show notification to user
                this.showStorageWarning();
            }
        } catch (e) {
            console.error('Error checking storage size:', e);
        }
    }

    /**
     * Get all saved prompts
     * @returns {Promise<Array>} - Array of saved prompts
     */
    async getPrompts() {
        if (this.isIndexedDBSupported && this.db) {
            return this.getPromptsFromIndexedDB();
        } else {
            return this.getPromptsFromLocalStorage();
        }
    }

    /**
     * Get prompts from IndexedDB
     */
    getPromptsFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROMPT_STORE], 'readonly');
            const store = transaction.objectStore(PROMPT_STORE);
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Get prompts from localStorage
     */
    getPromptsFromLocalStorage() {
        return new Promise((resolve) => {
            try {
                const savedPrompts = localStorage.getItem('savedPrompts');
                resolve(savedPrompts ? JSON.parse(savedPrompts) : []);
            } catch (error) {
                console.error('Failed to get prompts from localStorage:', error);
                resolve([]);
            }
        });
    }

    /**
     * Delete a prompt by ID
     * @param {number} id - Prompt ID to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deletePrompt(id) {
        if (this.isIndexedDBSupported && this.db) {
            return this.deletePromptFromIndexedDB(id);
        } else {
            return this.deletePromptFromLocalStorage(id);
        }
    }

    /**
     * Delete prompt from IndexedDB
     */
    deletePromptFromIndexedDB(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROMPT_STORE], 'readwrite');
            const store = transaction.objectStore(PROMPT_STORE);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Delete prompt from localStorage
     */
    deletePromptFromLocalStorage(id) {
        return new Promise((resolve) => {
            try {
                const savedPrompts = localStorage.getItem('savedPrompts');
                if (!savedPrompts) {
                    resolve(false);
                    return;
                }
                
                let prompts = JSON.parse(savedPrompts);
                prompts = prompts.filter(prompt => prompt.id !== id);
                localStorage.setItem('savedPrompts', JSON.stringify(prompts));
                resolve(true);
            } catch (error) {
                console.error('Failed to delete prompt from localStorage:', error);
                resolve(false);
            }
        });
    }

    /**
     * Export all prompts to a JSON file
     */
    async exportPrompts() {
        try {
            const prompts = await this.getPrompts();
            
            if (prompts.length === 0) {
                this.showNotification('No prompts to export', 'info');
                return;
            }
            
            const dataStr = JSON.stringify(prompts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `prompt-engine-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Release the object URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showNotification('Prompts exported successfully', 'success');
            
            // Log analytics
            this.logAnalytics('export', { count: prompts.length });
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export prompts', 'error');
        }
    }

    /**
     * Import prompts from a JSON file
     * @param {File} file - The JSON file to import
     * @returns {Promise<{success: boolean, importedCount: number, skippedCount: number, error?: string}>}
     */
    async importPrompts(file) {
        return new Promise((resolve) => {
            if (!file || !file.type.match('application/json') && !file.type.match('text/plain')) {
                resolve({ success: false, importedCount: 0, skippedCount: 0, error: 'Invalid file type. Please select a JSON or TXT file.' });
                return;
            }

            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    let importedData = JSON.parse(fileContent);

                    if (!Array.isArray(importedData)) {
                        throw new Error('Invalid JSON format: Expected an array of prompts.');
                    }

                    // Validate and sanitize imported prompts
                    let validPrompts = [];
                    let skippedCount = 0;
                    for (const prompt of importedData) {
                        if (this.isValidPromptObject(prompt)) {
                            // Ensure essential fields exist and add date/id if missing
                            const sanitizedPrompt = { ...prompt }; // Copy object
                            if (!sanitizedPrompt.date) {
                                sanitizedPrompt.date = new Date().toISOString();
                            }
                             // ID will be auto-generated by IndexedDB or assigned in localStorage fallback if needed
                            delete sanitizedPrompt.id; // Remove potentially conflicting ID from import
                            
                            validPrompts.push(sanitizedPrompt);
                        } else {
                            console.warn('Skipping invalid prompt object during import:', prompt);
                            skippedCount++;
                        }
                    }

                    if (validPrompts.length === 0) {
                         resolve({ success: false, importedCount: 0, skippedCount: skippedCount, error: 'No valid prompts found in the file.'});
                         return;
                    }

                    // Save the valid prompts
                    if (this.isIndexedDBSupported && this.db) {
                        await this.saveMultiplePromptsToIndexedDB(validPrompts);
                    } else {
                        await this.saveMultiplePromptsToLocalStorage(validPrompts);
                    }

                    resolve({ success: true, importedCount: validPrompts.length, skippedCount: skippedCount });

                } catch (error) {
                    console.error('Failed to import prompts:', error);
                    resolve({ success: false, importedCount: 0, skippedCount: importedData?.length || 0, error: `Import failed: ${error.message}` });
                }
            };

            reader.onerror = (event) => {
                console.error('File reading error:', event.target.error);
                 resolve({ success: false, importedCount: 0, skippedCount: 0, error: 'Error reading the file.'});
            };

            reader.readAsText(file);
        });
    }
    
    /**
     * Helper to check if an object looks like a valid prompt for import.
     * @param {object} prompt 
     * @returns {boolean}
     * @private
     */
    isValidPromptObject(prompt) {
        return prompt && 
               typeof prompt === 'object' &&
               typeof prompt.originalPrompt === 'string' &&
               typeof prompt.enhancedPrompt === 'string' &&
               typeof prompt.medium === 'string' &&
               typeof prompt.type === 'string' &&
               (prompt.date === undefined || typeof prompt.date === 'string'); // Date is optional or string
               // Add more checks as needed (e.g., length limits)
    }
    
    /**
     * Helper to save multiple prompts efficiently to IndexedDB.
     * @param {Array<object>} prompts 
     * @private
     */
    async saveMultiplePromptsToIndexedDB(prompts) {
         return new Promise((resolve, reject) => {
            if (!this.db) return reject("Database not initialized");
            const transaction = this.db.transaction([PROMPT_STORE], 'readwrite');
            const store = transaction.objectStore(PROMPT_STORE);

            let addedCount = 0;
            prompts.forEach(prompt => {
                 // ID should be auto-incremented by IndexedDB, ensure it's not set
                 delete prompt.id; 
                 const request = store.add(prompt);
                 request.onsuccess = () => addedCount++;
                 request.onerror = (e) => console.error('Error adding prompt during bulk import:', e.target.error, prompt);
            });

            transaction.oncomplete = () => {
                console.log(`Bulk import completed. Added ${addedCount} prompts to IndexedDB.`);
                resolve();
            };
            transaction.onerror = (event) => {
                 console.error('Bulk import transaction error:', event.target.error);
                 reject(event.target.error);
            };
        });
    }

    /**
     * Helper to save multiple prompts to localStorage (less efficient).
     * @param {Array<object>} prompts 
     * @private
     */
    async saveMultiplePromptsToLocalStorage(prompts) {
        return new Promise((resolve) => {
             try {
                 // Get existing prompts
                 let existingPrompts = [];
                 try {
                     const savedPrompts = localStorage.getItem('savedPrompts');
                     existingPrompts = savedPrompts ? JSON.parse(savedPrompts) : [];
                 } catch (e) {
                     existingPrompts = [];
                 }

                 // Assign IDs and merge
                 let currentMaxId = existingPrompts.reduce((max, p) => Math.max(max, p.id || 0), Date.now());
                 const newPromptsWithIds = prompts.map(p => {
                     currentMaxId++;
                     return { ...p, id: currentMaxId }; 
                 });

                 const mergedPrompts = existingPrompts.concat(newPromptsWithIds);
                 
                 // Clean up if needed *before* final save
                 this.cleanupLocalStorageIfNeeded(mergedPrompts); 

                 // Save merged array
                 localStorage.setItem('savedPrompts', JSON.stringify(mergedPrompts));
                 resolve();
             } catch (error) {
                 console.error('Failed to save multiple prompts to localStorage:', error);
                 this.showStorageError();
                 resolve(); // Resolve anyway
             }
        });
    }

    /**
     * Search through saved prompts
     * @param {string} query - Search query
     * @returns {Promise<Array>} - Matching prompts
     */
    async searchPrompts(query) {
        const prompts = await this.getPrompts();
        if (!query || query.trim() === '') {
            return prompts;
        }
        
        query = query.toLowerCase().trim();
        
        return prompts.filter(prompt => {
            // Search in original, enhanced, title, and type
            return (
                (prompt.original && prompt.original.toLowerCase().includes(query)) ||
                (prompt.enhanced && prompt.enhanced.toLowerCase().includes(query)) ||
                (prompt.title && prompt.title.toLowerCase().includes(query)) ||
                (prompt.type && prompt.type.toLowerCase().includes(query)) ||
                (prompt.medium && prompt.medium.toLowerCase().includes(query))
            );
        });
    }

    /**
     * Log analytics data
     * @param {string} action - The action performed
     * @param {Object} data - Additional data to log
     */
    async logAnalytics(action, data = {}) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                const transaction = this.db.transaction([ANALYTICS_STORE], 'readwrite');
                const store = transaction.objectStore(ANALYTICS_STORE);
                
                await store.add({
                    action,
                    date: new Date().toISOString(),
                    ...data
                });
            }
        } catch (error) {
            console.error('Failed to log analytics:', error);
            // Non-critical error, so just log and continue
        }
    }

    /**
     * Get analytics data for dashboard
     * @returns {Promise<Object>} - Analytics data
     */
    async getAnalytics() {
        if (!this.isIndexedDBSupported || !this.db) {
            return { totalPrompts: 0, byType: {}, byMedium: {} };
        }
        
        try {
            // Get all prompts
            const prompts = await this.getPrompts();
            
            // Get all analytics data
            const transaction = this.db.transaction([ANALYTICS_STORE], 'readonly');
            const store = transaction.objectStore(ANALYTICS_STORE);
            
            return new Promise((resolve) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const analytics = request.result || [];
                    
                    // Process analytics
                    const byType = {};
                    const byMedium = {};
                    
                    // Group prompts by type and medium
                    prompts.forEach(prompt => {
                        if (prompt.type) {
                            byType[prompt.type] = (byType[prompt.type] || 0) + 1;
                        }
                        if (prompt.medium) {
                            byMedium[prompt.medium] = (byMedium[prompt.medium] || 0) + 1;
                        }
                    });
                    
                    resolve({
                        totalPrompts: prompts.length,
                        byType,
                        byMedium,
                        analytics
                    });
                };
                
                request.onerror = () => {
                    resolve({ totalPrompts: prompts.length, byType: {}, byMedium: {} });
                };
            });
        } catch (error) {
            console.error('Failed to get analytics:', error);
            return { totalPrompts: 0, byType: {}, byMedium: {} };
        }
    }

    /**
     * Show a notification to the user
     */
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Show storage warning
     */
    showStorageWarning() {
        this.showNotification('Storage space running low. Oldest prompts will be removed.', 'info');
    }

    /**
     * Show storage error
     */
    showStorageError() {
        this.showNotification('Storage error occurred. Some data may not be saved.', 'error');
    }

    /**
     * Save a setting (key-value pair)
     * @param {string} key - The setting key (e.g., 'darkMode')
     * @param {any} value - The value to save
     * @returns {Promise<void>}
     */
    async saveSetting(key, value) {
        if (this.isIndexedDBSupported && this.db) {
            return this.saveSettingToIndexedDB(key, value);
        } else {
            return this.saveSettingToLocalStorage(key, value);
        }
    }

    /**
     * Save setting to IndexedDB
     */
    saveSettingToIndexedDB(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([SETTINGS_STORE], 'readwrite');
            const store = transaction.objectStore(SETTINGS_STORE);
            // Use 'put' to overwrite if key exists, add if not.
            // The object store uses 'id' as keyPath, so key becomes the id.
            const request = store.put({ id: key, value: value }); 

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error(`Failed to save setting '${key}' to IndexedDB:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Save setting to localStorage
     */
    saveSettingToLocalStorage(key, value) {
        return new Promise((resolve) => {
            try {
                let settings = {};
                try {
                    const storedSettings = localStorage.getItem('appSettings');
                    settings = storedSettings ? JSON.parse(storedSettings) : {};
                } catch (e) {
                    settings = {}; // Reset if parsing fails
                }
                settings[key] = value;
                localStorage.setItem('appSettings', JSON.stringify(settings));
                resolve();
            } catch (error) {
                console.error(`Failed to save setting '${key}' to localStorage:`, error);
                this.showStorageError(); // Notify user about general storage error
                resolve(); // Resolve anyway, but log error
            }
        });
    }

    /**
     * Get a setting by key
     * @param {string} key - The setting key
     * @param {any} [defaultValue=null] - Value to return if key not found
     * @returns {Promise<any>} - The setting value or defaultValue
     */
    async getSetting(key, defaultValue = null) {
        if (this.isIndexedDBSupported && this.db) {
            return this.getSettingFromIndexedDB(key, defaultValue);
        } else {
            return this.getSettingFromLocalStorage(key, defaultValue);
        }
    }

    /**
     * Get setting from IndexedDB
     */
    getSettingFromIndexedDB(key, defaultValue) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([SETTINGS_STORE], 'readonly');
            const store = transaction.objectStore(SETTINGS_STORE);
            const request = store.get(key); // Use key directly as it's the keyPath 'id'

            request.onsuccess = (event) => {
                const result = event.target.result;
                resolve(result ? result.value : defaultValue);
            };

            request.onerror = (event) => {
                console.error(`Failed to get setting '${key}' from IndexedDB:`, event.target.error);
                // Don't reject, just resolve with default value on error
                resolve(defaultValue); 
            };
        });
    }

    /**
     * Get setting from localStorage
     */
    getSettingFromLocalStorage(key, defaultValue) {
        return new Promise((resolve) => {
            try {
                const storedSettings = localStorage.getItem('appSettings');
                const settings = storedSettings ? JSON.parse(storedSettings) : {};
                resolve(settings.hasOwnProperty(key) ? settings[key] : defaultValue);
            } catch (error) {
                console.error(`Failed to get setting '${key}' from localStorage:`, error);
                resolve(defaultValue); // Resolve with default on error
            }
        });
    }
}

// Create and export the storage manager instance
const storageManager = new StorageManager();
export default storageManager; 