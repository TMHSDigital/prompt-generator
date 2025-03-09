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
     * @param {File} file - The file to import from
     * @returns {Promise<number>} - Number of prompts imported
     */
    async importPrompts(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const content = event.target.result;
                    let promptsToImport = JSON.parse(content);
                    
                    if (!Array.isArray(promptsToImport)) {
                        throw new Error('Invalid import format. Expected an array of prompts.');
                    }
                    
                    // Filter out invalid prompts
                    promptsToImport = promptsToImport.filter(prompt => 
                        prompt && 
                        typeof prompt === 'object' && 
                        prompt.original && 
                        prompt.enhanced
                    );
                    
                    if (promptsToImport.length === 0) {
                        throw new Error('No valid prompts found in import file.');
                    }
                    
                    // Process imports in batches to avoid overwhelming storage
                    const existingPrompts = await this.getPrompts();
                    const existingIds = new Set(existingPrompts.map(p => p.id));
                    
                    let importCount = 0;
                    for (const prompt of promptsToImport) {
                        // Generate new ID to avoid conflicts
                        delete prompt.id;
                        await this.savePrompt(prompt);
                        importCount++;
                    }
                    
                    this.showNotification(`Successfully imported ${importCount} prompts`, 'success');
                    
                    // Log analytics
                    this.logAnalytics('import', { count: importCount });
                    
                    resolve(importCount);
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Failed to import prompts: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                this.showNotification('Error reading import file', 'error');
                reject(error);
            };
            
            reader.readAsText(file);
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
}

// Create and export the storage manager instance
const storageManager = new StorageManager();
export default storageManager; 