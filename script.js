class FallingLettersGame {
    constructor() {
        this.targetWords = [
            "MELL",           
            "MELLSTROY",        
            "MELLSTROY.GAME"  
        ];
        this.currentTargetWord = this.targetWords[0];
        this.currentProgress = "_".repeat(this.currentTargetWord.length).split('');
        this.lives = 3;
        this.currentIndex = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.animations = new Map();
        this.letterInterval = null;
        this.mouseX = 0;
        this.backgroundMusic = null;
        this.musicEnabled = false;
        this.letterSpeed = 4.0;
        this.letterIntervalTime = 800;

        this.winVideo = null;
        this.winSecondVideo = null; // Добавляем видео для второго уровня
        this.loseVideo = null;
        this.finalWinVideo = null;
        
        this.keys = {};
        this.playerVelocity = 0;
        this.playerSpeed = 8;
        this.friction = 0.9;
        
        this.consecutiveMisses = 0;
        this.missesAllowed = 2;
        
        this.initializeLoader();
    }

    getAlphabetForLevel() {
        if (this.level === 1) {
            return 'MEL';
        } else if (this.level === 2) {
            return 'MELORSTY';
        } else {
            return 'AELMORSTY.';
        }
    }

    getLevelDescription(level) {
        const descriptions = {
            1: "MELL",
            2: "MELLSTROY", 
            3: "MELLSTROY.GAME"
        };
        return descriptions[level] || "MELLSTROY.GAME";
    }

    initializeVideos() {
        this.winVideo = document.getElementById('win-video');
        this.winSecondVideo = document.getElementById('win-second-video'); // ДОБАВЛЯЕМ
        this.loseVideo = document.getElementById('lose-video');
        this.finalWinVideo = document.getElementById('final-win-video');
        
        console.log('Initializing videos...');
        console.log('Win video found:', !!this.winVideo);
        console.log('Win second video found:', !!this.winSecondVideo); // ДОБАВЛЯЕМ
        console.log('Lose video found:', !!this.loseVideo);
        console.log('Final win video found:', !!this.finalWinVideo);
        
        if (this.winVideo) {
            this.winVideo.volume = 0.7;
            this.winVideo.preload = 'auto';
            this.winVideo.addEventListener('error', (e) => {
                console.log('Win video error:', e);
            });
        }
        
        // ДОБАВЛЯЕМ БЛОК ДЛЯ winSecondVideo
        if (this.winSecondVideo) {
            this.winSecondVideo.volume = 0.7;
            this.winSecondVideo.preload = 'auto';
            this.winSecondVideo.addEventListener('error', (e) => {
                console.log('Win second video error:', e);
            });
        }
        
        if (this.loseVideo) {
            this.loseVideo.volume = 0.7;
            this.loseVideo.preload = 'auto';
            this.loseVideo.addEventListener('error', (e) => {
                console.log('Lose video error:', e);
            });
        }

        if (this.finalWinVideo) {
            this.finalWinVideo.volume = 0.7;
            this.finalWinVideo.preload = 'auto';
            this.finalWinVideo.addEventListener('error', (e) => {
                console.log('Final win video error:', e);
            });
        }
    }

    initializeLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            const gameContainer = document.getElementById('game-container');
            
            loader.style.opacity = '0';
            
            setTimeout(() => {
                loader.style.display = 'none';
                gameContainer.style.display = 'block';
                
                this.initializeMusic();
                this.initializeVideos();
                this.initializeElements();
                this.setupEventListeners();
                this.setupKeyboardControls();
            }, 500);
            
        }, 3000);
    }

    initializeMusic() {
        this.backgroundMusic = document.getElementById('background-music');
        
        if (this.backgroundMusic) {
            const playMusic = () => {
                this.backgroundMusic.volume = 0.3;
                this.backgroundMusic.play().then(() => {
                    this.musicEnabled = true;
                    this.updateMusicButton();
                }).catch(error => {
                    console.log('Автовоспроизведение заблокировано:', error);
                    this.showMusicEnableButton();
                });
            };
            
            setTimeout(playMusic, 1000);
        }
    }

    showMusicEnableButton() {
        const musicButton = document.createElement('button');
        musicButton.id = 'enable-music-btn';
        musicButton.textContent = '🎵 Включить музыку';
        musicButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            padding: 12px 18px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255,107,107,0.4);
            transition: all 0.3s;
        `;
        
        musicButton.addEventListener('mouseenter', () => {
            musicButton.style.transform = 'translateY(-2px)';
            musicButton.style.boxShadow = '0 6px 20px rgba(255,107,107,0.6)';
        });
        
        musicButton.addEventListener('mouseleave', () => {
            musicButton.style.transform = 'translateY(0)';
            musicButton.style.boxShadow = '0 4px 15px rgba(255,107,107,0.4)';
        });
        
        musicButton.addEventListener('click', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.play().then(() => {
                    this.musicEnabled = true;
                    this.updateMusicButton();
                    musicButton.remove();
                }).catch(error => {
                    console.log('Не удалось включить музыку:', error);
                    alert('Не удалось включить музыку. Разрешите автовоспроизведение в настройках браузера.');
                });
            }
        });
        
        document.body.appendChild(musicButton);
    }

    initializeElements() {
        this.gameArea = document.getElementById('game-area');
        this.currentWordElement = document.getElementById('current-word');
        this.livesElement = document.getElementById('lives');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.player = document.getElementById('player');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        this.createMusicButton();
        this.updateDisplay();
    }

    createMusicButton() {
        this.musicBtn = document.createElement('button');
        this.musicBtn.id = 'music-btn';
        this.musicBtn.textContent = '🔇';
        this.musicBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
            transition: all 0.3s;
        `;
        
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
        this.musicBtn.addEventListener('mouseenter', () => {
            this.musicBtn.style.background = 'rgba(255,255,255,0.2)';
        });
        this.musicBtn.addEventListener('mouseleave', () => {
            this.musicBtn.style.background = 'rgba(255,255,255,0.1)';
        });
        
        document.querySelector('.controls').appendChild(this.musicBtn);
    }

    toggleMusic() {
        if (this.backgroundMusic) {
            if (this.musicEnabled) {
                this.backgroundMusic.pause();
                this.musicEnabled = false;
            } else {
                this.backgroundMusic.play().then(() => {
                    this.musicEnabled = true;
                }).catch(error => {
                    console.log('Не удалось включить музыку:', error);
                    this.showMusicEnableButton();
                });
            }
            this.updateMusicButton();
        }
    }

    updateMusicButton() {
        if (this.musicBtn) {
            this.musicBtn.textContent = this.musicEnabled ? '🔊' : '🔇';
            this.musicBtn.title = this.musicEnabled ? 'Выключить музыку' : 'Включить музыку';
        }
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
                this.keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
                this.keys.right = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
                this.keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
                this.keys.right = false;
            }
        });

        this.gameLoop();
    }

    gameLoop() {
        if (this.gameRunning && !this.gamePaused) {
            this.updatePlayerPosition();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    updatePlayerPosition() {
        let currentLeft = parseInt(this.player.style.left) || 0;
        
        if (this.keys.left) {
            this.playerVelocity = -this.playerSpeed;
        } else if (this.keys.right) {
            this.playerVelocity = this.playerSpeed;
        } else {
            this.playerVelocity *= this.friction;
            if (Math.abs(this.playerVelocity) < 0.5) this.playerVelocity = 0;
        }
        
        let newLeft = currentLeft + this.playerVelocity;
        
        const minLeft = 0;
        const maxLeft = this.gameArea.offsetWidth - this.player.offsetWidth;
        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        
        this.player.style.left = newLeft + 'px';
    }

    startGame() {
        this.resetGame();
        this.gameRunning = true;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        if (this.backgroundMusic && !this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                this.musicEnabled = true;
                this.updateMusicButton();
            }).catch(error => {
                console.log('Не удалось автоматически включить музыку:', error);
            });
        }
        
        this.letterInterval = setInterval(() => this.createFallingLetter(), this.letterIntervalTime);
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Продолжить' : 'Пауза';
        
        if (this.gamePaused) {
            if (this.backgroundMusic && this.musicEnabled) {
                this.backgroundMusic.pause();
            }
            this.animations.forEach((animation, letterElement) => {
                cancelAnimationFrame(animation);
            });
            clearInterval(this.letterInterval);
        } else {
            if (this.backgroundMusic && this.musicEnabled) {
                this.backgroundMusic.play().catch(error => {
                    console.log('Не удалось возобновить музыку:', error);
                });
            }
            this.letterInterval = setInterval(() => this.createFallingLetter(), this.letterIntervalTime);
            this.resumeAllAnimations();
        }
    }

    createFallingLetter() {
        if (!this.gameRunning || this.gamePaused) return;

        const limitedAlphabet = this.getAlphabetForLevel();
        const neededLetters = this.currentTargetWord.split('').filter((_, index) => 
            this.currentProgress[index] === '_'
        );
        
        let letter;
        
        const neededLetterChance = Math.min(0.98, 0.90 + (this.level - 1) * 0.02);
        
        if (neededLetters.length > 0 && Math.random() < neededLetterChance) {
            letter = neededLetters[Math.floor(Math.random() * neededLetters.length)];
        } else {
            letter = limitedAlphabet[Math.floor(Math.random() * limitedAlphabet.length)];
        }
        
        this.createLetterElement(letter);
    }

    createLetterElement(letter) {
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.style.left = Math.random() * (this.gameArea.offsetWidth - 40) + 'px';
        letterElement.style.top = '0px';
        
        const letterSize = Math.max(30, 40 - (this.level - 1) * 2);
        letterElement.style.width = letterSize + 'px';
        letterElement.style.height = letterSize + 'px';
        letterElement.style.lineHeight = letterSize + 'px';
        letterElement.style.fontSize = (letterSize * 0.7) + 'px';
        
        if (letter === this.currentTargetWord[this.currentIndex]) {
            letterElement.style.boxShadow = '0 0 20px #4ecdc4';
            letterElement.style.border = '2px solid #4ecdc4';
            letterElement.style.background = '#4ecdc4';
        } else if (this.currentTargetWord.includes(letter) && this.currentProgress[this.currentTargetWord.indexOf(letter)] === '_') {
            letterElement.style.background = '#ffd166';
        } else {
            letterElement.style.background = '#95a5a6';
            letterElement.style.color = '#2c3e50';
        }
        
        this.gameArea.appendChild(letterElement);

        const speed = this.letterSpeed || 4.0;
        this.animateLetter(letterElement, letter, speed);
    }

    animateLetter(letterElement, letter, speed) {
        const animate = () => {
            if (!this.gameRunning || this.gamePaused) {
                this.animations.set(letterElement, requestAnimationFrame(animate));
                return;
            }
            
            const top = parseInt(letterElement.style.top);
            letterElement.style.top = (top + speed) + 'px';

            if (this.isColliding(letterElement, this.player)) {
                this.animations.delete(letterElement);
                this.handleLetterCaught(letter, letterElement);
                return;
            }

            if (top > this.gameArea.offsetHeight) {
                this.animations.delete(letterElement);
                this.handleLetterMissed(letterElement);
                return;
            }

            this.animations.set(letterElement, requestAnimationFrame(animate));
        };
        
        this.animations.set(letterElement, requestAnimationFrame(animate));
    }

    resumeAllAnimations() {
        const letters = Array.from(this.gameArea.querySelectorAll('.letter'));
        letters.forEach(letterElement => {
            const letter = letterElement.textContent;
            const speed = this.letterSpeed || 4.0;
            
            if (this.animations.has(letterElement)) {
                cancelAnimationFrame(this.animations.get(letterElement));
            }
            
            this.animateLetter(letterElement, letter, speed);
        });
    }

    isColliding(elem1, elem2) {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        
        const letterReduction = 6;
        const letterCollisionLeft = rect1.left + letterReduction;
        const letterCollisionRight = rect1.right - letterReduction;
        const letterCollisionTop = rect1.top + letterReduction;
        const letterCollisionBottom = rect1.bottom - letterReduction;
        
        const playerCenterX = rect2.left + rect2.width / 2;
        const playerTop = rect2.top;
        
        const collisionZoneWidth = 100;
        const collisionZoneHeight = 90;
        const collisionZoneLeft = playerCenterX - 50;
        const collisionZoneTop = playerTop;
        
        const collision = !(letterCollisionRight < collisionZoneLeft ||
                        letterCollisionLeft > collisionZoneLeft + collisionZoneWidth ||
                        letterCollisionBottom < collisionZoneTop ||
                        letterCollisionTop > collisionZoneTop + collisionZoneHeight);
        
        return collision;
    }

    handleLetterCaught(caughtLetter, letterElement) {
        letterElement.remove();
        
        const expectedLetter = this.currentTargetWord[this.currentIndex];
        
        if (caughtLetter === expectedLetter) {
            this.consecutiveMisses = 0;
            this.currentProgress[this.currentIndex] = caughtLetter;
            this.currentIndex++;
            this.score += 10 * this.level;
            
            this.updateDisplay();
            this.showFeedback('Правильно! +' + (10 * this.level), 'correct');
            
            if (this.currentIndex === this.currentTargetWord.length) {
                this.levelUp();
            }
        } else {
            this.consecutiveMisses = 0;
            this.loseLife();
            this.showFeedback('Не та буква! -1 жизнь', 'game-over');
        }
    }

    handleLetterMissed(letterElement) {
        const missedLetter = letterElement.textContent;
        letterElement.remove();
        
        const expectedLetter = this.currentTargetWord[this.currentIndex];
        
        if (missedLetter === expectedLetter) {
            this.consecutiveMisses++;
            
            console.log(`Пропущена нужная буква "${expectedLetter}". Счетчик: ${this.consecutiveMisses}`);
            
            if (this.consecutiveMisses >= 2) {
                this.loseLife();
                this.consecutiveMisses = 0;
                this.showFeedback('Пропустил 2 нужные буквы подряд! -1 жизнь', 'game-over');
            } else {
                const remaining = 2 - this.consecutiveMisses;
                this.showFeedback(`Пропустил нужную! Осталось попыток: ${remaining}`, 'game-over');
            }
        }
    }

    showWinVideo() {
        return new Promise((resolve) => {
            if (!this.winVideo) {
                console.log('Win video not found');
                resolve();
                return;
            }
            
            let wasMusicPlaying = false;
            if (this.backgroundMusic && this.musicEnabled && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
                wasMusicPlaying = true;
            }
            
            const overlay = this.createVideoOverlay(this.winVideo, 'Победа! 🎉', resolve, wasMusicPlaying);
            document.body.appendChild(overlay);
            
            this.winVideo.style.display = 'block';
            this.winVideo.style.width = '80%';
            this.winVideo.style.maxWidth = '600px';
            this.winVideo.style.borderRadius = '15px';
            this.winVideo.style.margin = '0 auto';
            
            this.winVideo.currentTime = 0;
            
            const playPromise = this.winVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Win video started playing');
                }).catch(error => {
                    console.log('Error playing win video:', error);
                    this.closeVideoOverlay(overlay, this.winVideo, resolve, wasMusicPlaying);
                });
            }
            
            const onVideoEnd = () => {
                this.closeVideoOverlay(overlay, this.winVideo, resolve, wasMusicPlaying);
            };
            
            this.winVideo.addEventListener('ended', onVideoEnd);
        });
    }

    // ДОБАВЛЯЕМ НОВЫЙ МЕТОД ДЛЯ ВИДЕО ВТОРОГО УРОВНЯ
    showWinSecondVideo() {
        return new Promise((resolve) => {
            console.log('Attempting to show WIN SECOND video for level 2');
            
            const videoElement = this.winSecondVideo || this.winVideo;
            if (!videoElement) {
                console.log('Win second video not found, falling back to regular win video');
                this.showWinVideo().then(resolve);
                return;
            }
            
            let wasMusicPlaying = false;
            if (this.backgroundMusic && this.musicEnabled && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
                wasMusicPlaying = true;
            }
            
            const overlay = this.createVideoOverlay(videoElement, 'Отлично! Уровень 2! 🚀', resolve, wasMusicPlaying);
            document.body.appendChild(overlay);
            
            videoElement.style.display = 'block';
            videoElement.style.width = '80%';
            videoElement.style.maxWidth = '600px';
            videoElement.style.borderRadius = '15px';
            videoElement.style.margin = '0 auto';
            
            videoElement.currentTime = 0;
            
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Win second video started playing successfully');
                }).catch(error => {
                    console.log('Error playing win second video:', error);
                    this.closeVideoOverlay(overlay, videoElement, resolve, wasMusicPlaying);
                });
            }
            
            const onVideoEnd = () => {
                console.log('Win second video ended');
                this.closeVideoOverlay(overlay, videoElement, resolve, wasMusicPlaying);
            };
            
            videoElement.addEventListener('ended', onVideoEnd);
        });
    }

    showFinalWinVideo() {
        return new Promise((resolve) => {
            console.log('Attempting to show FINAL win video');
            
            // Используем финальное видео
            const videoElement = this.finalWinVideo;
            if (!videoElement) {
                console.log('Final win video not found, falling back to regular win video');
                // Если финальное видео не найдено, используем обычное
                this.showWinVideo().then(resolve);
                return;
            }
            
            let wasMusicPlaying = false;
            if (this.backgroundMusic && this.musicEnabled && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
                wasMusicPlaying = true;
            }

            videoElement.volume = 1.0; // Максимальная громкость
            videoElement.muted = false;
            
            const overlay = this.createVideoOverlay(videoElement, 'АБСОЛЮТНАЯ ПОБЕДА! 🏆', resolve, wasMusicPlaying);
            document.body.appendChild(overlay);
            
            videoElement.style.display = 'block';
            videoElement.style.width = '80%';
            videoElement.style.maxWidth = '600px';
            videoElement.style.borderRadius = '15px';
            videoElement.style.margin = '0 auto';
            
            videoElement.currentTime = 0;
            
            console.log('Playing final win video...');
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Final win video started playing successfully');
                }).catch(error => {
                    console.log('Error playing final win video:', error);
                    this.closeVideoOverlay(overlay, videoElement, resolve, wasMusicPlaying);
                });
            }
            
            const onVideoEnd = () => {
                console.log('Final win video ended');
                this.closeVideoOverlay(overlay, videoElement, resolve, wasMusicPlaying);
            };
            
            videoElement.addEventListener('ended', onVideoEnd);
        });
    }

    showLoseVideo() {
        return new Promise((resolve) => {
            if (!this.loseVideo) {
                console.log('Lose video not found');
                resolve();
                return;
            }
            
            let wasMusicPlaying = false;
            if (this.backgroundMusic && this.musicEnabled && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
                wasMusicPlaying = true;
            }
            
            const overlay = this.createVideoOverlay(this.loseVideo, 'Попробуй еще! 💪', resolve, wasMusicPlaying);
            document.body.appendChild(overlay);
            
            this.loseVideo.style.display = 'block';
            this.loseVideo.style.width = '80%';
            this.loseVideo.style.maxWidth = '600px';
            this.loseVideo.style.borderRadius = '15px';
            this.loseVideo.style.margin = '0 auto';
            
            this.loseVideo.currentTime = 0;
            
            const playPromise = this.loseVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Lose video started playing');
                }).catch(error => {
                    console.log('Error playing lose video:', error);
                    this.closeVideoOverlay(overlay, this.loseVideo, resolve, wasMusicPlaying);
                });
            }
            
            const onVideoEnd = () => {
                this.closeVideoOverlay(overlay, this.loseVideo, resolve, wasMusicPlaying);
            };
            
            this.loseVideo.addEventListener('ended', onVideoEnd);
        });
    }

    createVideoOverlay(videoElement, title, resolveCallback, wasMusicPlaying) {
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        
        overlay.innerHTML = `
            <div class="video-content">
                <h2 class="video-title">${title}</h2>
            </div>
            <button class="skip-button">Пропустить ▶</button>
        `;
        
        const videoContent = overlay.querySelector('.video-content');
        videoContent.appendChild(videoElement);
        
        const skipButton = overlay.querySelector('.skip-button');
        skipButton.onclick = () => {
            this.closeVideoOverlay(overlay, videoElement, resolveCallback, wasMusicPlaying);
        };
        
        return overlay;
    }

    closeVideoOverlay(overlay, videoElement, resolveCallback, wasMusicPlaying) {
        overlay.remove();
        videoElement.pause();
        videoElement.style.display = 'none';
        
        if (wasMusicPlaying && this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().catch(error => {
                console.log('Не удалось возобновить музыку после видео:', error);
            });
        }
        
        if (resolveCallback) {
            resolveCallback();
        }
    }

    // ДОБАВЛЯЕМ МЕТОД ДЛЯ КРАСИВЫХ СООБЩЕНИЙ О НАЧАЛЕ УРОВНЯ
    showLevelStartMessage(level) {
        const messages = {
            2: "Уровень 2\nСобери: MELLSTROY",
            3: "Уровень 3\nСобери: MELLSTROY.GAME"
        };
        
        const message = messages[level] || `Уровень ${level}\nСобери: ${this.getLevelDescription(level)}`;
        
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #667eea, #764ba2);
            padding: 30px 40px;
            border-radius: 20px;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 3px solid #ffd166;
            white-space: pre-line;
            animation: pulse 1.5s infinite;
        `;
        
        if (!document.querySelector('#pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        messageElement.textContent = message;
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 1500);
    }

    // ЗАМЕНЯЕМ МЕТОД levelUp
    levelUp() {
        this.gameRunning = false;
        clearInterval(this.letterInterval);
        
        console.log('Level up! Current level:', this.level, 'Target level:', this.targetWords.length);
        
        if (this.level === 3) {
            console.log('Showing FINAL win video for level 3');
            this.showFinalWinVideo().then(() => {
                this.showFinalWinMessage();
            });
        } else {
            // ОПРЕДЕЛЯЕМ КАКОЕ ВИДЕО ПОКАЗЫВАТЬ
            let videoPromise;
            if (this.level === 1 && this.winSecondVideo) {
                console.log('Showing WIN SECOND video for level 1 -> 2');
                videoPromise = this.showWinSecondVideo();
            } else {
                console.log('Showing regular win video for level:', this.level);
                videoPromise = this.showWinVideo();
            }
            
            videoPromise.then(() => {
                this.level++;
                
                if (this.level <= this.targetWords.length) {
                    this.currentTargetWord = this.targetWords[this.level - 1];
                } else {
                    this.currentTargetWord = this.targetWords[this.targetWords.length - 1];
                }
                
                this.currentProgress = "_".repeat(this.currentTargetWord.length).split('');
                this.currentIndex = 0;
                
                // ИСПОЛЬЗУЕМ КРАСИВОЕ СООБЩЕНИЕ ВМЕСТО showFeedback
                this.showLevelStartMessage(this.level);
                
                const levelBonus = this.level * 25;
                this.score += levelBonus;
                
                if (this.level % 3 === 0 && this.lives < 3) {
                    this.lives++;
                    this.showFeedback(`Бонус: +1 жизнь!`, 'correct');
                }
                
                const baseSpeed = 4.0;
                const baseInterval = 1000;
                this.letterSpeed = baseSpeed + (this.level - 1) * 1.2;
                
                const intervalReduction = 200 + (this.level - 1) * 40;
                this.letterIntervalTime = Math.max(300, baseInterval - intervalReduction);
                
                // ЗАДЕРЖКА ПЕРЕД НАЧАЛОМ НОВОГО УРОВНЯ
                setTimeout(() => {
                    this.gameRunning = true;
                    this.letterInterval = setInterval(() => this.createFallingLetter(), this.letterIntervalTime);
                    this.updateDisplay();
                }, 1500);
            });
        }
    }

    showFinalWinMessage() {
        const finalScreen = document.createElement('div');
        finalScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            text-align: center;
            padding: 20px;
        `;
        
        finalScreen.innerHTML = `
            <div style="background: rgba(0,0,0,0.8); padding: 40px; border-radius: 20px; max-width: 600px;">
                <h1 style="font-size: 3rem; color: #ff6b6b; margin-bottom: 20px; text-shadow: 0 0 20px rgba(255,107,107,0.5);">
                    🏆 ПОБЕДА! 🏆
                </h1>
                <h2 style="font-size: 2.5rem; color: #4ecdc4; margin-bottom: 30px;">
                    Ты выиграл, молодец Боров!
                </h2>
                <div style="font-size: 1.5rem; margin-bottom: 30px;">
                    <p>Финальный счет: <strong>${this.score}</strong></p>
                    <p>Пройдено уровней: <strong>${this.level}</strong></p>
                    <p>Осталось жизней: <strong>${this.lives}</strong></p>
                </div>
                <div style="font-size: 1.2rem; margin-bottom: 40px; color: #ffd166;">
                    "MELLSTROY.GAME" полностью собран!<br>
                    Ты настоящий чемпион! 💪
                </div>
                <button id="restart-final-btn" style="
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 25px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(255,107,107,0.4);
                ">
                    🎮 Играть снова
                </button>
            </div>
        `;
        
        document.body.appendChild(finalScreen);
        
        document.getElementById('restart-final-btn').addEventListener('click', () => {
            finalScreen.remove();
            this.resetGame();
        });
        
        this.createVictoryEffects();
    }

    createVictoryEffects() {
        const emojis = ['🎉', '🎊', '🏆', '⭐', '🔥', '💪', '🎮', '👑'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.cssText = `
                    position: fixed;
                    top: -50px;
                    left: ${Math.random() * 100}%;
                    font-size: ${20 + Math.random() * 30}px;
                    z-index: 10001;
                    pointer-events: none;
                    animation: fall ${3 + Math.random() * 5}s linear forwards;
                `;
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fall {
                        to {
                            transform: translateY(100vh) rotate(${360 * Math.random()}deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, 8000);
            }, i * 100);
        }
    }

    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameRunning = false;
        clearInterval(this.letterInterval);
        
        this.animations.forEach((animation, letterElement) => {
            cancelAnimationFrame(animation);
        });
        this.animations.clear();
        
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
        
        this.showLoseVideo().then(() => {
            alert(`Игра окончена!\nВаш счет: ${this.score}\nДостигнутый уровень: ${this.level}`);
            this.resetGame();
        });
    }

    showFeedback(message, className) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
            color: white;
            z-index: 100;
            padding: 10px 20px;
            border-radius: 10px;
            background: rgba(0,0,0,0.8);
        `;
        feedback.className = className;
        
        this.gameArea.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1500);
    }

    updateDisplay() {
        this.currentWordElement.textContent = this.currentProgress.join(' ');
        this.livesElement.innerHTML = `Жизни: ${'❤'.repeat(this.lives)}`;
        
        const nextLetter = this.currentTargetWord[this.currentIndex];
        const levelInfo = `Уровень ${this.level}: ${this.getLevelDescription(this.level)}`;
        
        this.scoreElement.innerHTML = `Счет: ${this.score} | ${levelInfo} | Собрано: ${this.currentWordElement.textContent} | Ждем: <span style="color: #4ecdc4; font-weight: bold;">${nextLetter}</span>`;
        
        this.levelElement.textContent = `Уровень: ${this.level}`;
        
        if (this.lives <= 1) {
            this.livesElement.classList.add('game-over');
        } else {
            this.livesElement.classList.remove('game-over');
        }
    }

    resetGame() {
        this.level = 1;
        this.currentTargetWord = this.targetWords[0];
        this.currentProgress = "_".repeat(this.currentTargetWord.length).split('');
        this.currentIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.letterSpeed = 4.0;
        this.letterIntervalTime = 800;

        this.keys = {};
        this.playerVelocity = 0;
        
        this.consecutiveMisses = 0;
        
        setTimeout(() => {
            const gameAreaWidth = this.gameArea.offsetWidth;
            const playerWidth = this.player.offsetWidth;
            const centerPosition = (gameAreaWidth - playerWidth) / 2;
            this.player.style.left = centerPosition + 'px';
            this.player.style.transform = 'none';
        }, 100);
        
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(error => {
                console.log('Не удалось возобновить музыку:', error);
            });
        }
        
        const letters = this.gameArea.querySelectorAll('.letter');
        letters.forEach(letter => letter.remove());
        
        this.animations.forEach((animation, letterElement) => {
            cancelAnimationFrame(animation);
        });
        this.animations.clear();
        
        this.updateDisplay();
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.pauseBtn.textContent = 'Пауза';
        
        clearInterval(this.letterInterval);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FallingLettersGame();
});