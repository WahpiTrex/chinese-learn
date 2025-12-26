/**
 * Storage Module
 * Handles localStorage operations and progress code generation
 */

const Storage = {
    KEYS: {
        PROGRESS: 'learnChinese_progress',
        STATS: 'learnChinese_stats',
        SETTINGS: 'learnChinese_settings'
    },

    /**
     * Save data to localStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    /**
     * Load data from localStorage
     */
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    },

    /**
     * Clear specific key
     */
    clear(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.clear(key));
    },

    /**
     * Get current progress
     */
    getProgress() {
        return this.load(this.KEYS.PROGRESS) || {
            currentLevel: 1,
            currentWordIndex: 0,
            completedLevels: [],
            learnedCharacters: []
        };
    },

    /**
     * Save progress
     */
    saveProgress(progress) {
        return this.save(this.KEYS.PROGRESS, progress);
    },

    /**
     * Get settings
     */
    getSettings() {
        return this.load(this.KEYS.SETTINGS) || {
            showPinyin: true,
            showCharacterBar: true,
            quizMode: 'mixed'
        };
    },

    /**
     * Save settings
     */
    saveSettings(settings) {
        return this.save(this.KEYS.SETTINGS, settings);
    },

    /**
     * Generate progress code (base64 encoded)
     */
    generateProgressCode() {
        const data = {
            p: this.getProgress(),
            s: Stats.getStats()
        };
        try {
            const json = JSON.stringify(data);
            return btoa(encodeURIComponent(json));
        } catch (e) {
            console.error('Code generation error:', e);
            return '';
        }
    },

    /**
     * Load progress from code
     */
    loadProgressCode(code) {
        try {
            const json = decodeURIComponent(atob(code));
            const data = JSON.parse(json);
            
            if (data.p) {
                this.saveProgress(data.p);
            }
            if (data.s) {
                Stats.saveStats(data.s);
            }
            
            return true;
        } catch (e) {
            console.error('Code loading error:', e);
            return false;
        }
    }
};
