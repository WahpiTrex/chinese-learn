/**
 * Stats Module
 * Handles character statistics tracking
 */

const Stats = {
    STORAGE_KEY: 'learnChinese_stats',

    /**
     * Get all stats
     */
    getStats() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Stats load error:', e);
            return {};
        }
    },

    /**
     * Save stats
     */
    saveStats(stats) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Stats save error:', e);
            return false;
        }
    },

    /**
     * Record an answer for a character
     */
    recordAnswer(character, isCorrect) {
        const stats = this.getStats();

        if (!stats[character]) {
            stats[character] = {
                correct: 0,
                total: 0
            };
        }

        stats[character].total++;
        if (isCorrect) {
            stats[character].correct++;
        }

        this.saveStats(stats);
    },

    /**
     * Get success rate for a character
     */
    getSuccessRate(character) {
        const stats = this.getStats();
        const charStats = stats[character];

        if (!charStats || charStats.total === 0) {
            return null;
        }

        return Math.round((charStats.correct / charStats.total) * 100);
    },

    /**
     * Get overall statistics
     */
    getOverallStats() {
        const stats = this.getStats();
        const characters = Object.keys(stats);

        if (characters.length === 0) {
            return {
                totalCharacters: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                averageRate: 0
            };
        }

        let totalAttempts = 0;
        let totalCorrect = 0;

        characters.forEach(char => {
            totalAttempts += stats[char].total;
            totalCorrect += stats[char].correct;
        });

        return {
            totalCharacters: characters.length,
            totalAttempts,
            totalCorrect,
            averageRate: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
        };
    },

    /**
     * Get stats sorted by success rate
     */
    getSortedStats() {
        const stats = this.getStats();
        const result = [];

        Object.entries(stats).forEach(([char, data]) => {
            const rate = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            result.push({
                character: char,
                correct: data.correct,
                total: data.total,
                rate
            });
        });

        // Sort by rate (ascending) so weakest characters are first
        result.sort((a, b) => a.rate - b.rate);

        return result;
    },

    /**
     * Clear all stats
     */
    clearStats() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Stats clear error:', e);
            return false;
        }
    }
};
