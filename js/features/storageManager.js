const STORAGE_KEY = 'savedPrompts';
const SETTINGS_KEY = 'appSettings';

class StorageManager {
    _getPrompts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    _setPrompts(prompts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    }

    async savePrompt(promptData) {
        const prompts = this._getPrompts();
        if (!promptData.id) promptData.id = Date.now();
        if (!promptData.timestamp) promptData.timestamp = new Date().toISOString();
        prompts.push(promptData);
        this._setPrompts(prompts);
        return promptData.id;
    }

    async getPrompts() {
        return this._getPrompts();
    }

    async deletePrompt(id) {
        const prompts = this._getPrompts().filter(p => p.id !== id);
        this._setPrompts(prompts);
        return true;
    }

    async exportPrompts() {
        const prompts = this._getPrompts();
        if (prompts.length === 0) return;

        const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt-engine-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    async importPrompts(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve({ success: false, importedCount: 0, skippedCount: 0, error: 'No file provided' });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data)) {
                        resolve({ success: false, importedCount: 0, skippedCount: 0, error: 'Expected an array of prompts' });
                        return;
                    }

                    const existing = this._getPrompts();
                    let importedCount = 0;
                    let skippedCount = 0;
                    let nextId = Date.now();

                    for (const item of data) {
                        if (!this._isValid(item)) {
                            skippedCount++;
                            continue;
                        }
                        existing.push({
                            original: item.original || item.originalPrompt || '',
                            enhanced: item.enhanced || item.enhancedPrompt || '',
                            medium: item.medium || 'text',
                            type: item.type || 'general',
                            timestamp: item.timestamp || item.date || new Date().toISOString(),
                            id: nextId++,
                        });
                        importedCount++;
                    }

                    if (importedCount > 0) this._setPrompts(existing);
                    resolve({ success: importedCount > 0, importedCount, skippedCount });
                } catch (err) {
                    resolve({ success: false, importedCount: 0, skippedCount: 0, error: err.message });
                }
            };
            reader.onerror = () => resolve({ success: false, importedCount: 0, skippedCount: 0, error: 'File read error' });
            reader.readAsText(file);
        });
    }

    _isValid(item) {
        if (!item || typeof item !== 'object') return false;
        const orig = item.original || item.originalPrompt;
        const enh = item.enhanced || item.enhancedPrompt;
        return typeof orig === 'string' && typeof enh === 'string';
    }

    async searchPrompts(query) {
        const prompts = this._getPrompts();
        if (!query || !query.trim()) return prompts;
        const q = query.toLowerCase().trim();
        return prompts.filter(p =>
            (p.original && p.original.toLowerCase().includes(q)) ||
            (p.enhanced && p.enhanced.toLowerCase().includes(q)) ||
            (p.type && p.type.toLowerCase().includes(q)) ||
            (p.medium && p.medium.toLowerCase().includes(q))
        );
    }

    logAnalytics() {}

    async saveSetting(key, value) {
        try {
            const settings = this._getSettings();
            settings[key] = value;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch { /* non-critical */ }
    }

    async getSetting(key, defaultValue = null) {
        const settings = this._getSettings();
        return key in settings ? settings[key] : defaultValue;
    }

    _getSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }
}

const storageManager = new StorageManager();
export default storageManager;
