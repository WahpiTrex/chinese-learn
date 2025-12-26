/**
 * Game Module - Enhanced Learning Flow
 * Phases: TEACH → QUIZ → SENTENCE → REVIEW
 */

const Game = {
    // Data
    allWords: [],
    lessonWords: {},
    lessons: [],
    sentences: [],

    // Current state
    currentLessonIndex: 0,
    currentWordIndex: 0,
    currentWord: null,
    currentPhase: 'teach', // 'teach', 'quiz', 'sentence', 'review'
    currentQuestionType: 'chinese-to-turkish',
    wordsLearnedInSession: 0,
    reviewQueue: [],

    // Settings
    quizMode: 'mixed',
    wordsBeforeSentence: 3, // Show sentence after learning X words
    reviewInterval: 5, // Review after every X new words

    // DOM Elements
    elements: {},

    /**
     * Initialize the game
     */
    async init() {
        this.cacheElements();
        await this.loadUnits();
        this.organizeByLesson();
        this.generateSentences();
        this.loadProgress();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            currentLevel: document.getElementById('current-level'),
            characterBar: document.getElementById('character-bar'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            questionType: document.getElementById('question-type'),
            question: document.getElementById('question'),
            pinyinHint: document.getElementById('pinyin-hint'),
            wordType: document.getElementById('word-type'),
            optionsGrid: document.getElementById('options-grid'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            levelCompleteOverlay: document.getElementById('level-complete-overlay'),
            levelCompleteText: document.getElementById('level-complete-text'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            gameCard: document.querySelector('.game-card')
        };
    },

    /**
     * Load all unit data
     */
    async loadUnits() {
        const unitFiles = ['unit1', 'unit2', 'unit3'];

        for (const file of unitFiles) {
            try {
                const response = await fetch(`data/${file}.json`);
                const data = await response.json();
                this.allWords = this.allWords.concat(data);
            } catch (e) {
                console.error(`Error loading ${file}:`, e);
            }
        }
    },

    /**
     * Organize words by lesson number
     */
    organizeByLesson() {
        this.lessonWords = {};

        this.allWords.forEach(word => {
            const lesson = word.lesson || 1;
            if (!this.lessonWords[lesson]) {
                this.lessonWords[lesson] = [];
            }
            this.lessonWords[lesson].push(word);
        });

        this.lessons = Object.keys(this.lessonWords)
            .map(n => parseInt(n))
            .sort((a, b) => a - b);

        console.log(`Loaded ${this.allWords.length} words in ${this.lessons.length} lessons`);
    },

    /**
     * Generate sentences from words that can form meaningful combinations
     */
    generateSentences() {
        // Predefined sentence patterns using lesson words
        this.sentences = [
            // Lesson 1 sentences
            { lesson: 1, turkish: "Merhaba", parts: ["你好"], pinyin: "Nǐ hǎo" },
            { lesson: 1, turkish: "Ben öğrenciyim", parts: ["我", "是", "学生"], pinyin: "Wǒ shì xuésheng" },
            { lesson: 1, turkish: "O öğretmen", parts: ["她", "是", "老师"], pinyin: "Tā shì lǎoshī" },
            { lesson: 1, turkish: "Sen öğretmen misin?", parts: ["你", "是", "老师", "吗"], pinyin: "Nǐ shì lǎoshī ma?" },
            { lesson: 1, turkish: "Teşekkürler", parts: ["谢谢"], pinyin: "Xièxie" },
            { lesson: 1, turkish: "Rica ederim", parts: ["不客气"], pinyin: "Bú kèqi" },

            // Lesson 2 sentences
            { lesson: 2, turkish: "O Çinli", parts: ["他", "是", "中国", "人"], pinyin: "Tā shì Zhōngguó rén" },
            { lesson: 2, turkish: "Tanıştığımıza memnun oldum", parts: ["很高兴", "认识", "你"], pinyin: "Hěn gāoxìng rènshi nǐ" },
            { lesson: 2, turkish: "Ben de", parts: ["我", "也", "是"], pinyin: "Wǒ yě shì" },
            { lesson: 2, turkish: "Hangi ülkedensin?", parts: ["你", "是", "哪", "国", "人"], pinyin: "Nǐ shì nǎ guó rén?" },

            // Lesson 3 sentences
            { lesson: 3, turkish: "Bu ne?", parts: ["这", "是", "什么"], pinyin: "Zhè shì shénme?" },
            { lesson: 3, turkish: "O kim?", parts: ["那", "是", "谁"], pinyin: "Nà shì shéi?" },
            { lesson: 3, turkish: "Bu bir kitap", parts: ["这", "是", "书"], pinyin: "Zhè shì shū" },
            { lesson: 3, turkish: "O benim arkadaşım", parts: ["他", "是", "我", "的", "朋友"], pinyin: "Tā shì wǒ de péngyou" },

            // Lesson 4 sentences
            { lesson: 4, turkish: "Kütüphane nerede?", parts: ["图书馆", "在", "哪儿"], pinyin: "Túshūguǎn zài nǎr?" },
            { lesson: 4, turkish: "Özür dilerim", parts: ["对不起"], pinyin: "Duìbuqǐ" },
            { lesson: 4, turkish: "Sorun değil", parts: ["没关系"], pinyin: "Méi guānxi" },
            { lesson: 4, turkish: "Bilmiyorum", parts: ["我", "不", "知道"], pinyin: "Wǒ bù zhīdào" },

            // Lesson 5 sentences
            { lesson: 5, turkish: "Boş vaktin var mı?", parts: ["你", "有", "空儿", "吗"], pinyin: "Nǐ yǒu kòngr ma?" },
            { lesson: 5, turkish: "Hoş geldiniz", parts: ["欢迎"], pinyin: "Huānyíng" },
            { lesson: 5, turkish: "Gelmek ister misin?", parts: ["你", "去", "吗"], pinyin: "Nǐ qù ma?" },
        ];

        console.log(`Generated ${this.sentences.length} sentences`);
    },

    /**
     * Get current lesson number
     */
    getCurrentLesson() {
        return this.lessons[this.currentLessonIndex] || 1;
    },

    /**
     * Get words for current lesson
     */
    getCurrentLessonWords() {
        return this.lessonWords[this.getCurrentLesson()] || [];
    },

    /**
     * Get sentences for current lesson
     */
    getCurrentLessonSentences() {
        const lesson = this.getCurrentLesson();
        return this.sentences.filter(s => s.lesson <= lesson);
    },

    /**
     * Load saved progress
     */
    loadProgress() {
        const progress = Storage.getProgress();
        this.currentLessonIndex = progress.currentLessonIndex || 0;
        this.currentWordIndex = progress.currentWordIndex || 0;

        if (this.currentLessonIndex >= this.lessons.length) {
            this.currentLessonIndex = 0;
        }

        const lessonWords = this.getCurrentLessonWords();
        if (this.currentWordIndex >= lessonWords.length) {
            this.currentWordIndex = 0;
        }

        const settings = Storage.getSettings();
        this.quizMode = settings.quizMode || 'mixed';
    },

    /**
     * Save current progress
     */
    saveProgress() {
        const progress = Storage.getProgress();
        progress.currentLessonIndex = this.currentLessonIndex;
        progress.currentWordIndex = this.currentWordIndex;
        Storage.saveProgress(progress);
    },

    /**
     * Setup the game
     */
    setupGame() {
        this.updateLevelDisplay();
        this.updateCharacterBar();
        this.currentPhase = 'teach';
        this.wordsLearnedInSession = 0;
        this.showNextItem();
    },

    /**
     * Update level indicator
     */
    updateLevelDisplay() {
        this.elements.currentLevel.textContent = this.getCurrentLesson();
    },

    /**
     * Update character bar
     */
    updateCharacterBar() {
        const bar = this.elements.characterBar;
        bar.innerHTML = '';

        const progress = Storage.getProgress();
        const learnedChars = new Set(progress.learnedCharacters || []);

        const lessonWords = this.getCurrentLessonWords();
        const currentChar = lessonWords[this.currentWordIndex]?.character;

        const lessonChars = new Set();
        lessonWords.forEach(word => {
            [...word.character].forEach(char => lessonChars.add(char));
        });

        lessonChars.forEach(char => {
            const item = document.createElement('span');
            item.className = 'char-item';
            item.textContent = char;

            // Find word info for this character
            const wordInfo = lessonWords.find(w => w.character.includes(char));

            if (learnedChars.has(char)) {
                item.classList.add('learned');
            }
            if (currentChar && currentChar.includes(char)) {
                item.classList.add('current');
            }

            // Add tooltip on click
            if (wordInfo) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    this.showCharTooltip(e, wordInfo);
                });
            }

            bar.appendChild(item);
        });
    },

    /**
     * Update progress bar
     */
    updateProgressBar() {
        const lessonWords = this.getCurrentLessonWords();
        const total = lessonWords.length;
        const current = this.currentWordIndex;

        const percentage = total > 0 ? (current / total) * 100 : 0;
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${current} / ${total}`;
    },

    /**
     * Show next item based on current state
     */
    showNextItem() {
        const lessonWords = this.getCurrentLessonWords();

        // Check if lesson is complete
        if (this.currentWordIndex >= lessonWords.length) {
            this.showLevelComplete();
            return;
        }

        // Check if we need to show a review
        if (this.reviewQueue.length > 0 && this.wordsLearnedInSession % this.reviewInterval === 0 && this.wordsLearnedInSession > 0) {
            this.showReview();
            return;
        }

        // Check if we should show a sentence
        if (this.wordsLearnedInSession > 0 && this.wordsLearnedInSession % this.wordsBeforeSentence === 0) {
            const sentences = this.getCurrentLessonSentences();
            if (sentences.length > 0) {
                this.showSentenceBuilding();
                return;
            }
        }

        // Show quiz directly (no separate teaching phase)
        this.currentWord = lessonWords[this.currentWordIndex];
        this.updateProgressBar();
        this.updateCharacterBar();
        this.showQuizCard();
    },

    /**
     * Check if word is first time being shown
     */
    isFirstTimeWord(character) {
        const progress = Storage.getProgress();
        const learnedChars = progress.learnedCharacters || [];
        // Check if any character in the word has been learned
        for (const char of character) {
            if (learnedChars.includes(char)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Show tooltip for character
     */
    showCharTooltip(event, wordInfo) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.char-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'char-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-char">${wordInfo.character}</div>
            <div class="tooltip-pinyin">${wordInfo.pinyin}</div>
            <div class="tooltip-meaning">${wordInfo.meaning}</div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;

        // Remove on click outside
        setTimeout(() => {
            document.addEventListener('click', function removeTooltip(e) {
                if (!tooltip.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', removeTooltip);
                }
            });
        }, 100);
    },

    /**
     * Show quiz card - with answer visible for first-time words
     */
    showQuizCard() {
        const word = this.currentWord;
        const isFirstTime = this.isFirstTimeWord(word.character);
        this.currentQuestionType = 'chinese-to-turkish'; // Always show Chinese first

        // Show character with pinyin
        this.elements.question.innerHTML = `<span class="chinese-text">${word.character}</span>`;
        this.elements.pinyinHint.textContent = word.pinyin;
        this.elements.pinyinHint.classList.remove('hidden');

        if (isFirstTime) {
            // First time: Show answer inline
            this.elements.questionType.textContent = '📚 YENİ KELİME';
            this.elements.wordType.innerHTML = `
                <span class="type-badge">${word.type || 'word'}</span>
                <div class="inline-meaning">${word.meaning}</div>
            `;
        } else {
            // Review: Hide answer
            this.elements.questionType.textContent = '❓ Bu ne demek?';
            this.elements.wordType.innerHTML = `<span class="type-badge">${word.type || 'word'}</span>`;
        }

        this.generateQuizOptions(isFirstTime);
    },

    /**
     * Show sentence building exercise
     */
    showSentenceBuilding() {
        const sentences = this.getCurrentLessonSentences();
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];

        this.elements.questionType.textContent = '🔤 CÜMLE KUR';
        this.elements.question.innerHTML = `<span class="turkish-text">${sentence.turkish}</span>`;
        this.elements.pinyinHint.textContent = sentence.pinyin;
        this.elements.pinyinHint.classList.remove('hidden');
        this.elements.wordType.innerHTML = '';

        // Create sentence building UI
        const grid = this.elements.optionsGrid;
        const shuffledParts = [...sentence.parts].sort(() => Math.random() - 0.5);

        // Add some distractors
        const progress = Storage.getProgress();
        const learnedChars = progress.learnedCharacters || [];
        const distractors = this.getRandomDistractors(sentence.parts, 2);
        const allOptions = [...shuffledParts, ...distractors].sort(() => Math.random() - 0.5);

        grid.innerHTML = `
            <div class="sentence-builder">
                <div class="sentence-result" id="sentence-result">
                    <span class="placeholder-text">Karakterleri sırayla seçin...</span>
                </div>
                <div class="sentence-options" id="sentence-options">
                    ${allOptions.map(part => `
                        <button class="sentence-part-btn chinese" data-part="${part}">${part}</button>
                    `).join('')}
                </div>
                <div class="sentence-actions">
                    <button class="small-btn" id="clear-sentence-btn">Temizle</button>
                    <button class="primary-btn" id="check-sentence-btn">Kontrol Et</button>
                </div>
            </div>
        `;

        this.setupSentenceBuilderEvents(sentence);
    },

    /**
     * Get random distractors for sentence building
     */
    getRandomDistractors(correctParts, count) {
        const progress = Storage.getProgress();
        const learnedChars = progress.learnedCharacters || [];

        // Get words that are not in the correct sentence
        const distractors = [];
        const lessonWords = this.getCurrentLessonWords();

        for (const word of lessonWords) {
            if (!correctParts.includes(word.character) && distractors.length < count) {
                distractors.push(word.character);
            }
        }

        return distractors;
    },

    /**
     * Setup sentence builder events
     */
    setupSentenceBuilderEvents(sentence) {
        const resultDiv = document.getElementById('sentence-result');
        const optionsDiv = document.getElementById('sentence-options');
        const selectedParts = [];

        // Part selection
        optionsDiv.querySelectorAll('.sentence-part-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('used')) return;

                const part = btn.dataset.part;
                selectedParts.push(part);
                btn.classList.add('used');

                // Update result display
                if (selectedParts.length === 1) {
                    resultDiv.innerHTML = '';
                }
                const partSpan = document.createElement('span');
                partSpan.className = 'selected-part';
                partSpan.textContent = part;
                partSpan.dataset.index = selectedParts.length - 1;
                partSpan.addEventListener('click', () => {
                    // Remove this part
                    const idx = parseInt(partSpan.dataset.index);
                    selectedParts.splice(idx, 1);
                    partSpan.remove();
                    btn.classList.remove('used');

                    // Reindex remaining
                    resultDiv.querySelectorAll('.selected-part').forEach((sp, i) => {
                        sp.dataset.index = i;
                    });

                    if (selectedParts.length === 0) {
                        resultDiv.innerHTML = '<span class="placeholder-text">Karakterleri sırayla seçin...</span>';
                    }
                });
                resultDiv.appendChild(partSpan);
            });
        });

        // Clear button
        document.getElementById('clear-sentence-btn').addEventListener('click', () => {
            selectedParts.length = 0;
            resultDiv.innerHTML = '<span class="placeholder-text">Karakterleri sırayla seçin...</span>';
            optionsDiv.querySelectorAll('.sentence-part-btn').forEach(btn => {
                btn.classList.remove('used');
            });
        });

        // Check button
        document.getElementById('check-sentence-btn').addEventListener('click', () => {
            const isCorrect = selectedParts.join('') === sentence.parts.join('');

            if (isCorrect) {
                this.showFeedback(true);
                setTimeout(() => {
                    this.hideFeedback();
                    this.wordsLearnedInSession++; // Count sentence as progress
                    this.showNextItem();
                }, 800);
            } else {
                this.showFeedback(false);
                // Show correct answer
                resultDiv.innerHTML = `
                    <div class="correct-answer">
                        <span class="label">Doğru cevap:</span>
                        <span class="answer">${sentence.parts.join('')}</span>
                    </div>
                `;
                setTimeout(() => {
                    this.hideFeedback();
                    this.showNextItem();
                }, 2000);
            }
        });
    },

    /**
     * Show review of previously learned word
     */
    showReview() {
        if (this.reviewQueue.length === 0) {
            this.showNextItem();
            return;
        }

        const reviewWord = this.reviewQueue.shift();
        this.currentWord = reviewWord;
        this.currentQuestionType = this.determineQuestionType();

        this.elements.questionType.textContent = '🔄 PEKİŞTİRME';

        if (this.currentQuestionType === 'chinese-to-turkish') {
            this.elements.question.innerHTML = `<span class="chinese-text">${reviewWord.character}</span>`;
        } else {
            this.elements.question.innerHTML = `<span class="turkish-text">${reviewWord.meaning}</span>`;
        }

        this.elements.pinyinHint.textContent = reviewWord.pinyin;
        this.elements.wordType.innerHTML = `<span class="type-badge review">pekiştirme</span>`;

        this.generateQuizOptions();
    },

    /**
     * Determine question type
     */
    determineQuestionType() {
        switch (this.quizMode) {
            case 'chinese-to-turkish':
                return 'chinese-to-turkish';
            case 'turkish-to-chinese':
                return 'turkish-to-chinese';
            case 'mixed':
            default:
                return Math.random() > 0.5 ? 'chinese-to-turkish' : 'turkish-to-chinese';
        }
    },

    /**
     * Generate quiz options - highlight correct for first-time
     */
    generateQuizOptions(isFirstTime = false) {
        const grid = this.elements.optionsGrid;
        grid.innerHTML = '';

        const correctAnswer = this.currentWord.meaning;

        const options = this.getRandomOptions(correctAnswer, 3);
        options.push(correctAnswer);
        this.shuffleArray(options);

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;

            // Highlight correct answer for first-time words
            if (isFirstTime && option === correctAnswer) {
                btn.classList.add('hint');
            }

            btn.addEventListener('click', () => this.handleQuizAnswer(option, correctAnswer, btn));
            grid.appendChild(btn);
        });
    },

    /**
     * Get random wrong options
     */
    getRandomOptions(correctAnswer, count) {
        const options = [];
        const isChineseAnswer = this.currentQuestionType === 'turkish-to-chinese';

        const pool = this.allWords
            .map(w => isChineseAnswer ? w.character : w.meaning)
            .filter(opt => opt !== correctAnswer);

        this.shuffleArray(pool);

        const usedOptions = new Set();
        for (let i = 0; i < pool.length && options.length < count; i++) {
            if (!usedOptions.has(pool[i])) {
                options.push(pool[i]);
                usedOptions.add(pool[i]);
            }
        }

        return options;
    },

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Handle quiz answer
     */
    handleQuizAnswer(selected, correct, btnElement) {
        const isCorrect = selected === correct;
        const allButtons = this.elements.optionsGrid.querySelectorAll('.option-btn');

        allButtons.forEach(btn => btn.disabled = true);

        Stats.recordAnswer(this.currentWord.character, isCorrect);

        if (isCorrect) {
            btnElement.classList.add('correct');
        } else {
            btnElement.classList.add('wrong');
            allButtons.forEach(btn => {
                if (btn.textContent === correct) {
                    btn.classList.add('correct');
                }
            });
        }

        this.showFeedback(isCorrect);

        if (isCorrect && this.currentPhase !== 'review') {
            this.markAsLearned(this.currentWord.character);
            // Add to review queue for later
            this.reviewQueue.push(this.currentWord);
        }

        setTimeout(() => {
            this.hideFeedback();

            if (isCorrect) {
                if (this.currentPhase !== 'review') {
                    this.currentWordIndex++;
                    this.wordsLearnedInSession++;
                    this.saveProgress();
                }
                this.currentPhase = 'teach';
            }

            this.showNextItem();
        }, isCorrect ? 800 : 1500);
    },

    /**
     * Mark character as learned
     */
    markAsLearned(character) {
        const progress = Storage.getProgress();
        if (!progress.learnedCharacters) {
            progress.learnedCharacters = [];
        }

        [...character].forEach(char => {
            if (!progress.learnedCharacters.includes(char)) {
                progress.learnedCharacters.push(char);
            }
        });

        Storage.saveProgress(progress);
    },

    /**
     * Show feedback overlay
     */
    showFeedback(isCorrect) {
        const overlay = this.elements.feedbackOverlay;
        overlay.classList.remove('correct', 'wrong');
        overlay.classList.add(isCorrect ? 'correct' : 'wrong');
        overlay.classList.add('show');

        const icon = overlay.querySelector('.feedback-icon');
        const text = overlay.querySelector('.feedback-text');

        if (isCorrect) {
            icon.textContent = '✓';
            text.textContent = 'Doğru!';
        } else {
            icon.textContent = '✗';
            text.textContent = 'Yanlış!';
        }
    },

    /**
     * Hide feedback overlay
     */
    hideFeedback() {
        this.elements.feedbackOverlay.classList.remove('show');
    },

    /**
     * Show level complete
     */
    showLevelComplete() {
        const overlay = this.elements.levelCompleteOverlay;
        const text = this.elements.levelCompleteText;

        text.textContent = `Ders ${this.getCurrentLesson()} başarıyla tamamlandı!`;
        overlay.classList.add('show');

        const progress = Storage.getProgress();
        if (!progress.completedLessons) {
            progress.completedLessons = [];
        }
        const currentLesson = this.getCurrentLesson();
        if (!progress.completedLessons.includes(currentLesson)) {
            progress.completedLessons.push(currentLesson);
        }
        Storage.saveProgress(progress);

        const nextBtn = this.elements.nextLevelBtn;

        if (this.currentLessonIndex >= this.lessons.length - 1) {
            nextBtn.textContent = 'Tüm Dersler Tamamlandı! 🎉';
            nextBtn.onclick = () => {
                overlay.classList.remove('show');
                this.currentLessonIndex = 0;
                this.currentWordIndex = 0;
                this.saveProgress();
                this.setupGame();
            };
        } else {
            nextBtn.textContent = 'Sonraki Ders';
            nextBtn.onclick = () => {
                overlay.classList.remove('show');
                this.currentLessonIndex++;
                this.currentWordIndex = 0;
                this.saveProgress();
                this.setupGame();
            };
        }
    },

    /**
     * Reset progress
     */
    resetProgress() {
        Storage.clearAll();
        Stats.clearStats();
        this.currentLessonIndex = 0;
        this.currentWordIndex = 0;
        this.reviewQueue = [];
        this.wordsLearnedInSession = 0;
        this.setupGame();
    },

    /**
     * Set quiz mode
     */
    setQuizMode(mode) {
        this.quizMode = mode;
        const settings = Storage.getSettings();
        settings.quizMode = mode;
        Storage.saveSettings(settings);
    }
};
