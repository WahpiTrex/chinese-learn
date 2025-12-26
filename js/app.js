/**
 * App Module
 * Main application controller - handles initialization, UI events, and modals
 */

const App = {
    // Screen elements
    screens: {},

    /**
     * Initialize the application
     */
    async init() {
        this.cacheScreens();
        this.setupEventListeners();
        this.loadSettings();
        this.checkSavedProgress();

        // Initialize game (pre-load data)
        await Game.init();
    },

    /**
     * Cache screen elements
     */
    cacheScreens() {
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            game: document.getElementById('game-screen')
        };
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openModal('settings-modal');
        });

        // Stats button
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.openStatsModal();
        });

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                this.closeModal(modalId);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Settings handlers
        this.setupSettingsListeners();
    },

    /**
     * Setup settings listeners
     */
    setupSettingsListeners() {
        // Show Pinyin toggle
        document.getElementById('show-pinyin').addEventListener('change', (e) => {
            const settings = Storage.getSettings();
            settings.showPinyin = e.target.checked;
            Storage.saveSettings(settings);
            this.applySettings();
        });

        // Show Character Bar toggle
        document.getElementById('show-character-bar').addEventListener('change', (e) => {
            const settings = Storage.getSettings();
            settings.showCharacterBar = e.target.checked;
            Storage.saveSettings(settings);
            this.applySettings();
        });

        // Quiz Mode select
        document.getElementById('quiz-mode').addEventListener('change', (e) => {
            Game.setQuizMode(e.target.value);
        });

        // Copy progress code
        document.getElementById('copy-code-btn').addEventListener('click', () => {
            const code = Storage.generateProgressCode();
            const input = document.getElementById('progress-code');
            input.value = code;
            navigator.clipboard.writeText(code).then(() => {
                document.getElementById('copy-code-btn').textContent = 'Kopyalandı!';
                setTimeout(() => {
                    document.getElementById('copy-code-btn').textContent = 'Kopyala';
                }, 2000);
            });
        });

        // Load progress code
        document.getElementById('load-code-btn').addEventListener('click', () => {
            const code = document.getElementById('load-code-input').value.trim();
            if (code) {
                const success = Storage.loadProgressCode(code);
                if (success) {
                    alert('İlerleme başarıyla yüklendi!');
                    location.reload();
                } else {
                    alert('Geçersiz kod!');
                }
            }
        });

        // Reset progress
        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            if (confirm('Tüm ilerlemeniz silinecek. Emin misiniz?')) {
                Game.resetProgress();
                this.closeModal('settings-modal');
                this.showScreen('welcome');
            }
        });
    },

    /**
     * Load and apply settings
     */
    loadSettings() {
        const settings = Storage.getSettings();

        // Set form values
        document.getElementById('show-pinyin').checked = settings.showPinyin;
        document.getElementById('show-character-bar').checked = settings.showCharacterBar;
        document.getElementById('quiz-mode').value = settings.quizMode;

        this.applySettings();
    },

    /**
     * Apply current settings to UI
     */
    applySettings() {
        const settings = Storage.getSettings();

        // Pinyin visibility
        const pinyinHint = document.getElementById('pinyin-hint');
        if (pinyinHint) {
            if (settings.showPinyin) {
                pinyinHint.classList.remove('hidden');
            } else {
                pinyinHint.classList.add('hidden');
            }
        }

        // Character bar visibility
        const charBar = document.getElementById('character-bar');
        if (charBar) {
            if (settings.showCharacterBar) {
                charBar.classList.remove('hidden');
            } else {
                charBar.classList.add('hidden');
            }
        }
    },

    /**
     * Check for saved progress and show preview
     */
    checkSavedProgress() {
        const progress = Storage.getProgress();
        const overall = Stats.getOverallStats();

        const preview = document.getElementById('stats-preview');

        if (overall.totalAttempts > 0) {
            preview.innerHTML = `
                <div>📊 Kayıtlı ilerleme bulundu</div>
                <div>Seviye ${progress.currentLevel} • ${overall.totalCharacters} karakter öğrenildi • %${overall.averageRate} başarı</div>
            `;
        }
    },

    /**
     * Start the game
     */
    startGame() {
        this.showScreen('game');
        Game.setupGame();
    },

    /**
     * Show a screen
     */
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    },

    /**
     * Open a modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');

            // Update progress code
            if (modalId === 'settings-modal') {
                document.getElementById('progress-code').value = Storage.generateProgressCode();
            }
        }
    },

    /**
     * Close a modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * Open stats modal with populated data
     */
    openStatsModal() {
        const overall = Stats.getOverallStats();
        const sorted = Stats.getSortedStats();

        // Update summary
        const summary = document.getElementById('stats-summary');
        summary.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${overall.totalCharacters}</div>
                <div class="stat-label">Karakter</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${overall.totalAttempts}</div>
                <div class="stat-label">Deneme</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">%${overall.averageRate}</div>
                <div class="stat-label">Başarı</div>
            </div>
        `;

        // Update grid
        const grid = document.getElementById('stats-grid');
        grid.innerHTML = '';

        if (sorted.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">Henüz istatistik yok. Öğrenmeye başlayın!</p>';
        } else {
            sorted.forEach(item => {
                const div = document.createElement('div');
                div.className = 'stat-item';

                let rateClass = '';
                if (item.rate < 50) rateClass = 'low';
                else if (item.rate < 80) rateClass = 'medium';

                div.innerHTML = `
                    <span class="stat-char">${item.character}</span>
                    <span class="stat-percent ${rateClass}">%${item.rate}</span>
                `;
                grid.appendChild(div);
            });
        }

        this.openModal('stats-modal');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
