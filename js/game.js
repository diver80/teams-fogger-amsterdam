/**
 * Amsterdam Fogger: Team '26 Edition
 * Core Game Engine, Lane Management, Collision, Difficulty Scaling & Touch Controls
 */

(function () {
    'use strict';

    // Canvas & Dimensions setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Grid configuration
    const COLS = 13;
    const ROWS = 11;
    const TILE_WIDTH = 56;
    const TILE_HEIGHT = 48;
    const CANVAS_WIDTH = COLS * TILE_WIDTH;   // 728 px
    const CANVAS_HEIGHT = ROWS * TILE_HEIGHT; // 528 px

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Sprite renderer & Sound engine
    const sprites = new SpriteRenderer();
    const sounds = window.soundEngine;

    // Game States
    const STATE_MENU = 'MENU';
    const STATE_PLAYING = 'PLAYING';
    const STATE_GAMEOVER = 'GAMEOVER';
    const STATE_LEVELWIN = 'LEVELWIN';

    // Goal bays at RAI entrance (Row 0)
    const GOAL_BAYS = [
        { id: 0, col: 1, x: 0, y: 34, width: 64, height: 38, filled: false, icon: '🎤', title: 'KEYNOTE', shortName: 'HALL 1' },
        { id: 1, col: 4, x: 0, y: 34, width: 64, height: 38, filled: false, icon: '🎫', title: 'JIRA HUB', shortName: 'BOOTH 2' },
        { id: 2, col: 6, x: 0, y: 34, width: 64, height: 38, filled: false, icon: '📖', title: 'CONFLUENCE', shortName: 'LOUNGE' },
        { id: 3, col: 8, x: 0, y: 34, width: 64, height: 38, filled: false, icon: '📹', title: 'LOOM', shortName: 'STUDIO' },
        { id: 4, col: 11, x: 0, y: 34, width: 64, height: 38, filled: false, icon: '🤖', title: 'ROVO AI', shortName: 'ARENA' }
    ];

    // Compute exact X positions for goal bays
    GOAL_BAYS.forEach(bay => {
        bay.x = (bay.col * TILE_WIDTH) + (TILE_WIDTH - bay.width) / 2;
    });

    // Consultant character data
    const CHARACTERS = {
        agile_coach: {
            name: 'Agile Coach',
            desc: 'Birkenstocks & sticky notes. Fast hop cooldown.',
            hopSpeed: 0.10,
            scoreMultiplier: 1.0,
            specialText: 'Agile Pivot (Quick Hop)'
        },
        jira_admin: {
            name: 'Jira Admin',
            desc: 'Dark mode hoodie. Can Freeze Traffic (Space / Button)!',
            hopSpeed: 0.12,
            scoreMultiplier: 1.0,
            hasFreezeAbility: true,
            specialText: 'Sprint Blocker (Freeze 2.5s)'
        },
        solutions_architect: {
            name: 'Solutions Architect',
            desc: 'Navy blazer & lanyard. +25% Bonus Points on arrival.',
            hopSpeed: 0.12,
            scoreMultiplier: 1.25,
            specialText: '+25% Extra Points'
        }
    };

    class Game {
        constructor() {
            this.state = STATE_MENU;
            this.selectedCharacter = 'agile_coach';
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('ams_fogger_highscore') || '0', 10);
            this.level = 1;
            this.lives = 3;
            this.roundTime = 60; // 60 seconds per consultant run
            this.currentTime = 60;

            // Player state
            const initialX = 6 * TILE_WIDTH + (TILE_WIDTH - 38) / 2;
            const initialY = 10 * TILE_HEIGHT + (TILE_HEIGHT - 38) / 2;
            this.player = {
                gridX: 6,
                gridY: 10, // Starting at bottom hotel sidewalk
                x: initialX,
                y: initialY,
                targetX: initialX,
                targetY: initialY,
                startX: initialX,
                startY: initialY,
                width: 38,
                height: 38,
                facing: 'up',
                isHopping: false,
                hopTimer: 0,
                hopDuration: 0.11,
                highestRowReached: 10,
                shield: false,
                isInvulnerable: false,
                invulnerableTimer: 0,
                coffeeBoost: false,
                coffeeTimer: 0,
                abilityCharges: 1,
                isFrozen: false,
                freezeTimer: 0
            };

            // Traffic Lanes
            this.lanes = [];
            this.tramTimer = 10;
            this.tramActive = false;
            this.tram = null;
            this.collectibleTimer = 12;

            // Collectibles & Floating particles / text
            this.collectibles = [];
            this.floatingTexts = [];
            this.particles = [];
            this.weatherParticles = [];

            // Timing
            this.lastTime = performance.now();

            this.initLanes();
            this.bindEvents();
            this.updateUI();

            // Start animation loop
            requestAnimationFrame((time) => this.gameLoop(time));
        }

        initLanes() {
            // Row definitions:
            // Row 0: Goal bays (RAI entrance)
            // Row 1: RAI Plaza safe path
            // Row 2: Lane 6 - MAMIL Lycra Racers (Super Fast!)
            // Row 3: Lane 5 - Electric Fatbikes & VanMoofs (Fast)
            // Row 4: Lane 4 - Food Delivery Couriers (Fast)
            // Row 5: Row - Median Strip (Tram track, flowers, safe island)
            // Row 6: Lane 3 - Bakfietsen (Wide cargo bikes with kids/dogs)
            // Row 7: Lane 2 - Swapfiets & Office Commuters (Moderate)
            // Row 8: Lane 1 - Casual Omafiets (Slow, introductory)
            // Row 9: Sidewalk curb (Safe)
            // Row 10: Hotel Entrance starting line (Safe)

            const lvlFactor = 1 + (this.level - 1) * 0.16;

            this.lanes = [
                // Lane 1 (Row 8): Classic Omafiets - Moving Right
                {
                    row: 8,
                    y: 8 * TILE_HEIGHT,
                    direction: 1,
                    speed: 105 * lvlFactor,
                    type: 'omafiets',
                    bikeWidth: 54,
                    bikeHeight: 34,
                    spacing: 240 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                },
                // Lane 2 (Row 7): Swapfiets - Moving Left
                {
                    row: 7,
                    y: 7 * TILE_HEIGHT,
                    direction: -1,
                    speed: 145 * lvlFactor,
                    type: 'swapfiets',
                    bikeWidth: 54,
                    bikeHeight: 34,
                    spacing: 210 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                },
                // Lane 3 (Row 6): Bakfiets (Wide Cargo Bikes) - Moving Right
                {
                    row: 6,
                    y: 6 * TILE_HEIGHT,
                    direction: 1,
                    speed: 130 * lvlFactor,
                    type: 'bakfiets',
                    bikeWidth: 78,
                    bikeHeight: 36,
                    spacing: 290 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                },
                // Row 5: Central Tram Median (Trams handle separately)

                // Lane 4 (Row 4): Food Delivery Couriers - Moving Left
                {
                    row: 4,
                    y: 4 * TILE_HEIGHT,
                    direction: -1,
                    speed: 205 * lvlFactor,
                    type: 'courier',
                    bikeWidth: 56,
                    bikeHeight: 34,
                    spacing: 220 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                },
                // Lane 5 (Row 3): High-Speed Fatbikes & VanMoofs - Moving Right
                {
                    row: 3,
                    y: 3 * TILE_HEIGHT,
                    direction: 1,
                    speed: 250 * lvlFactor,
                    type: 'fatbike',
                    bikeWidth: 62,
                    bikeHeight: 34,
                    spacing: 230 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                },
                // Lane 6 (Row 2): MAMIL Lycra Peloton Racers - Moving Left (Ludicrous Speed!)
                {
                    row: 2,
                    y: 2 * TILE_HEIGHT,
                    direction: -1,
                    speed: 310 * lvlFactor,
                    type: 'racer',
                    bikeWidth: 56,
                    bikeHeight: 32,
                    spacing: 260 / lvlFactor,
                    bikes: [],
                    spawnTimer: 0
                }
            ];

            // Pre-seed bikes across lanes so road isn't empty at start
            this.lanes.forEach(lane => {
                const count = Math.ceil(CANVAS_WIDTH / lane.spacing);
                for (let i = 0; i < count; i++) {
                    const x = (i * lane.spacing + Math.random() * 40) % (CANVAS_WIDTH + 150) - 75;
                    lane.bikes.push(this.createBike(lane, x));
                }
            });

            this.tram = null;
            this.tramTimer = 8 + Math.random() * 8;
        }

        createBike(lane, x) {
            const colors = ['#0284c7', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#2563eb'];
            return {
                x: x,
                y: lane.y + (TILE_HEIGHT - lane.bikeHeight) / 2,
                width: lane.bikeWidth,
                height: lane.bikeHeight,
                speed: lane.speed * (0.92 + Math.random() * 0.16),
                direction: lane.direction,
                type: lane.type,
                color: colors[Math.floor(Math.random() * colors.length)],
                isRingingBell: false,
                bellTimer: Math.random() * 5 + 3
            };
        }

        bindEvents() {
            // Keyboard Controls
            window.addEventListener('keydown', (e) => {
                // Audio unlock on user interaction
                sounds.init();

                if (this.state === STATE_MENU) {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        this.startGame();
                        e.preventDefault();
                    }
                    return;
                }

                if (this.state === STATE_GAMEOVER || this.state === STATE_LEVELWIN) {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        if (this.state === STATE_GAMEOVER) {
                            this.resetFullGame();
                        } else {
                            this.startNextLevel();
                        }
                        e.preventDefault();
                    }
                    return;
                }

                if (this.state !== STATE_PLAYING) return;

                switch (e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        this.movePlayer(0, -1, 'up');
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.movePlayer(0, 1, 'down');
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.movePlayer(-1, 0, 'left');
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.movePlayer(1, 0, 'right');
                        e.preventDefault();
                        break;
                    case 'Space':
                        this.useSpecialAbility();
                        e.preventDefault();
                        break;
                }
            });

            // On-screen Virtual D-Pad buttons for mobile & touch
            const btnUp = document.getElementById('btnUp');
            const btnDown = document.getElementById('btnDown');
            const btnLeft = document.getElementById('btnLeft');
            const btnRight = document.getElementById('btnRight');
            const btnSpecial = document.getElementById('btnSpecial');

            const handleBtn = (dx, dy, dir) => {
                sounds.init();
                if (this.state === STATE_PLAYING) {
                    this.movePlayer(dx, dy, dir);
                } else if (this.state === STATE_MENU) {
                    this.startGame();
                } else if (this.state === STATE_GAMEOVER) {
                    this.resetFullGame();
                } else if (this.state === STATE_LEVELWIN) {
                    this.startNextLevel();
                }
            };

            const bindBtn = (el, dx, dy, dir) => {
                if (!el) return;
                const fire = (e) => {
                    e.preventDefault();
                    handleBtn(dx, dy, dir);
                };
                el.addEventListener('pointerdown', fire);
                el.addEventListener('click', (e) => e.preventDefault());
            };

            bindBtn(btnUp, 0, -1, 'up');
            bindBtn(btnDown, 0, 1, 'down');
            bindBtn(btnLeft, -1, 0, 'left');
            bindBtn(btnRight, 1, 0, 'right');

            if (btnSpecial) {
                const fireSpecial = (e) => {
                    e.preventDefault();
                    sounds.init();
                    this.useSpecialAbility();
                };
                btnSpecial.addEventListener('pointerdown', fireSpecial);
                btnSpecial.addEventListener('click', (e) => e.preventDefault());
            }

            // Touch Swipe handling on canvas
            let touchStartX = 0;
            let touchStartY = 0;
            canvas.addEventListener('touchstart', (e) => {
                sounds.init();
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                e.preventDefault();
            }, { passive: false });

            canvas.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 0) return;
                const touch = e.changedTouches[0];
                const dx = touch.clientX - touchStartX;
                const dy = touch.clientY - touchStartY;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);

                if (Math.max(absDx, absDy) > 24) {
                    if (absDx > absDy) {
                        handleBtn(dx > 0 ? 1 : -1, 0, dx > 0 ? 'right' : 'left');
                    } else {
                        handleBtn(0, dy > 0 ? 1 : -1, dy > 0 ? 'down' : 'up');
                    }
                } else {
                    // Tap = move forward if playing, else start/restart
                    if (this.state === STATE_PLAYING) {
                        this.movePlayer(0, -1, 'up');
                    } else if (this.state === STATE_MENU) {
                        this.startGame();
                    } else if (this.state === STATE_GAMEOVER) {
                        this.resetFullGame();
                    } else if (this.state === STATE_LEVELWIN) {
                        this.startNextLevel();
                    }
                }
                e.preventDefault();
            }, { passive: false });

            // UI Buttons (Audio mute, restart, character selects)
            const muteBtn = document.getElementById('muteBtn');
            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    sounds.init();
                    const isMuted = sounds.toggleMute();
                    muteBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
                    muteBtn.classList.toggle('muted', isMuted);
                });
            }

            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    sounds.init();
                    this.startGame();
                });
            }

            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    sounds.init();
                    this.resetFullGame();
                });
            }

            const nextLvlBtn = document.getElementById('nextLevelBtn');
            if (nextLvlBtn) {
                nextLvlBtn.addEventListener('click', () => {
                    sounds.init();
                    this.startNextLevel();
                });
            }

            // Character selector buttons
            const charCards = document.querySelectorAll('.character-card');
            charCards.forEach(card => {
                card.addEventListener('click', () => {
                    charCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedCharacter = card.dataset.char;
                    const charData = CHARACTERS[this.selectedCharacter];
                    this.player.hopDuration = charData.hopSpeed;
                    this.updateAbilityUI();
                });
            });
        }

        startGame() {
            this.state = STATE_PLAYING;
            this.score = 0;
            this.level = 1;
            this.lives = 3;
            this.currentTime = this.roundTime;
            this.resetGoals();
            this.initLanes();
            this.respawnPlayer(false);
            this.spawnCollectible();

            document.getElementById('startModal').style.display = 'none';
            document.getElementById('gameOverModal').style.display = 'none';
            document.getElementById('levelWinModal').style.display = 'none';

            sounds.startMusic();
            this.updateUI();
            this.updateAbilityUI();
            this.addFloatingText('RUSH TO THE RAI!', this.player.x + 10, this.player.y - 20, '#38bdf8');
        }

        resetFullGame() {
            this.startGame();
        }

        startNextLevel() {
            this.level++;
            this.state = STATE_PLAYING;
            this.resetGoals();
            this.initLanes();
            this.respawnPlayer(false);
            this.spawnCollectible();

            document.getElementById('levelWinModal').style.display = 'none';
            sounds.startMusic();
            this.updateUI();
            this.addFloatingText(`STAGE ${this.level}: RUSH HOUR INTENSIFIES!`, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2, '#facc15');
        }

        resetGoals() {
            GOAL_BAYS.forEach(bay => { bay.filled = false; });
        }

        respawnPlayer(lostLife = true) {
            this.player.gridX = 6;
            this.player.gridY = 10;
            const startX = 6 * TILE_WIDTH + (TILE_WIDTH - this.player.width) / 2;
            const startY = 10 * TILE_HEIGHT + (TILE_HEIGHT - this.player.height) / 2;
            this.player.x = startX;
            this.player.y = startY;
            this.player.startX = startX;
            this.player.startY = startY;
            this.player.targetX = startX;
            this.player.targetY = startY;
            this.player.facing = 'up';
            this.player.isHopping = false;
            this.player.hopTimer = 0;
            this.player.highestRowReached = 10;
            this.player.shield = false;
            this.player.isInvulnerable = false;
            this.player.invulnerableTimer = 0;
            this.player.coffeeBoost = false;
            this.player.coffeeTimer = 0;
            this.player.abilityCharges = 1;
            this.player.isFrozen = false;
            this.currentTime = this.roundTime;

            this.updateAbilityUI();
            if (lostLife) {
                this.updateUI();
            }
        }

        movePlayer(dx, dy, dir) {
            if (this.player.isHopping || this.player.gridY === 0) return;

            const targetGridX = this.player.gridX + dx;
            const targetGridY = this.player.gridY + dy;

            // Boundary checks
            if (targetGridX < 0 || targetGridX >= COLS) return;
            if (targetGridY < 0 || targetGridY >= ROWS) return;

            let targetX = targetGridX * TILE_WIDTH + (TILE_WIDTH - this.player.width) / 2;
            let targetY = targetGridY * TILE_HEIGHT + (TILE_HEIGHT - this.player.height) / 2;

            // Row 0 is the goal bay row. Must land inside one of the 5 open gates!
            if (targetGridY === 0) {
                const bay = this.findGoalBayAt(targetGridX);
                if (!bay || bay.filled) {
                    // Cannot enter wall or already filled gate
                    this.addFloatingText('GATE CLOSED / FILLED!', this.player.x, this.player.y - 10, '#ef4444');
                    sounds.playBikeBell();
                    return;
                }
                targetX = bay.x + (bay.width - this.player.width) / 2;
                targetY = bay.y + (bay.height - this.player.height) / 2;
            }

            this.player.facing = dir;
            this.player.gridX = targetGridX;
            this.player.gridY = targetGridY;
            this.player.startX = this.player.x;
            this.player.startY = this.player.y;
            this.player.targetX = targetX;
            this.player.targetY = targetY;
            this.player.isHopping = true;
            this.player.hopTimer = 0;

            sounds.playHop();

            // Forward progress score
            if (targetGridY < this.player.highestRowReached) {
                const points = (this.player.highestRowReached - targetGridY) * 15;
                this.addScore(points);
                this.player.highestRowReached = targetGridY;
            }
        }

        findGoalBayAt(gridX) {
            return GOAL_BAYS.find(bay => bay.col === gridX);
        }

        useSpecialAbility() {
            const char = CHARACTERS[this.selectedCharacter];
            if (!char.hasFreezeAbility) {
                this.addFloatingText('No active skill for this class!', this.player.x, this.player.y - 15, '#94a3b8');
                return;
            }

            if (this.player.abilityCharges <= 0) {
                this.addFloatingText('Cooldown! Used this life.', this.player.x, this.player.y - 15, '#ef4444');
                return;
            }

            this.player.abilityCharges--;
            this.player.isFrozen = true;
            this.player.freezeTimer = 2.8;
            sounds.playCollect();
            this.addFloatingText('🛑 JIRA SPRINT BLOCKED! BIKES HALTED!', CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT / 2, '#38bdf8');
            this.updateAbilityUI();
        }

        addScore(points) {
            const char = CHARACTERS[this.selectedCharacter];
            const finalPts = Math.round(points * (char.scoreMultiplier || 1.0));
            this.score += finalPts;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('ams_fogger_highscore', this.highScore.toString());
            }
            this.updateUI();
        }

        spawnCollectible() {
            if (this.collectibles.length >= 2) return;

            // Spawns on median or lower/upper road gaps
            const validRows = [5, 5, 9, 1, 6, 4];
            const r = validRows[Math.floor(Math.random() * validRows.length)];
            const c = Math.floor(Math.random() * (COLS - 2)) + 1;

            const types = ['stroopwafel', 'coffee', 'swagsocks', 'headphones'];
            const type = types[Math.floor(Math.random() * types.length)];

            this.collectibles.push({
                type: type,
                x: c * TILE_WIDTH + 14,
                y: r * TILE_HEIGHT + 12,
                width: 28,
                height: 28,
                row: r
            });
        }

        addFloatingText(text, x, y, color = '#ffffff') {
            this.floatingTexts.push({
                text: text,
                x: x,
                y: y,
                color: color,
                alpha: 1.0,
                life: 1.2
            });
        }

        addSplashParticles(x, y, count = 12, color = '#ef4444') {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 90 + 30;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    color: color,
                    alpha: 1.0,
                    life: 0.6
                });
            }
        }

        handlePlayerHit(hazardName) {
            // Check if player has Noise Canceling shield active
            if (this.player.shield) {
                this.player.shield = false;
                this.player.isInvulnerable = true;
                this.player.invulnerableTimer = 1.4;
                sounds.playBikeBell();
                this.addFloatingText('🛡️ SHIELD SAVED YOU!', this.player.x, this.player.y - 15, '#38bdf8');
                return;
            }

            sounds.playCrash();
            this.addSplashParticles(this.player.x + 20, this.player.y + 20, 20, '#ef4444');

            const dutchExclamations = [
                'PAS OP! (WATCH OUT!)',
                'KIJK UIT JE DOPPEN!',
                'COFFEE SPILLED EVERYWHERE!',
                'TAKEN OUT BY A BAKFIETS!',
                'JIRA TICKET ESCALATED TO CRITICAL!',
                'DING DING DING! OUCH!'
            ];
            const msg = dutchExclamations[Math.floor(Math.random() * dutchExclamations.length)];
            this.addFloatingText(msg, Math.max(20, Math.min(CANVAS_WIDTH - 220, this.player.x - 50)), this.player.y - 18, '#f43f5e');

            this.lives--;
            this.updateUI();

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.respawnPlayer(true);
            }
        }

        checkGoalArrival() {
            if (this.player.gridY === 0) {
                const bay = this.findGoalBayAt(this.player.gridX);
                if (bay && !bay.filled) {
                    bay.filled = true;
                    sounds.playGoal();
                    this.addSplashParticles(bay.x + 32, bay.y + 20, 25, '#34d399');

                    // Points for securing goal + time bonus
                    const timeBonus = Math.floor(this.currentTime) * 15;
                    const totalGained = 400 + timeBonus;
                    this.addScore(totalGained);

                    this.addFloatingText(`+${totalGained} CHECKED IN: ${bay.title}!`, bay.x - 20, bay.y + 10, '#34d399');

                    // Check if all 5 bays filled
                    const allFilled = GOAL_BAYS.every(b => b.filled);
                    if (allFilled) {
                        this.levelComplete();
                    } else {
                        // Respawn at hotel for next consultant
                        setTimeout(() => {
                            this.respawnPlayer(false);
                            this.spawnCollectible();
                        }, 500);
                    }
                }
            }
        }

        levelComplete() {
            this.state = STATE_LEVELWIN;
            sounds.stopMusic();
            sounds.playLevelUp();
            this.addScore(1500); // Level completion bonus

            document.getElementById('completedLevelNum').textContent = this.level.toString();
            document.getElementById('winScoreVal').textContent = this.score.toString();
            document.getElementById('levelWinModal').style.display = 'flex';
        }

        gameOver() {
            this.state = STATE_GAMEOVER;
            sounds.stopMusic();
            sounds.playGameOver();

            document.getElementById('finalScoreVal').textContent = this.score.toString();
            document.getElementById('bestScoreVal').textContent = this.highScore.toString();
            document.getElementById('gameOverModal').style.display = 'flex';
        }

        update(dt) {
            sprites.update(dt);

            // Weather rain effect in Level 4+
            if (this.level >= 4) {
                if (Math.random() < 0.35) {
                    this.weatherParticles.push({
                        x: Math.random() * CANVAS_WIDTH,
                        y: 0,
                        vx: -35,
                        vy: 420,
                        len: Math.random() * 8 + 6,
                        life: 1.2
                    });
                }
            }

            // Update Weather particles
            for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
                const wp = this.weatherParticles[i];
                wp.x += wp.vx * dt;
                wp.y += wp.vy * dt;
                wp.life -= dt;
                if (wp.y > CANVAS_HEIGHT || wp.life <= 0) {
                    this.weatherParticles.splice(i, 1);
                }
            }

            if (this.state !== STATE_PLAYING) {
                this.updateEntitiesOnly(dt);
                return;
            }

            // Countdown timer
            this.currentTime -= dt;
            if (this.currentTime <= 0) {
                this.handlePlayerHit('Time Out');
                return;
            }

            // Ability freeze timer
            if (this.player.isFrozen) {
                this.player.freezeTimer -= dt;
                if (this.player.freezeTimer <= 0) {
                    this.player.isFrozen = false;
                }
            }

            // Invulnerability timer after shield hit
            if (this.player.isInvulnerable) {
                this.player.invulnerableTimer -= dt;
                if (this.player.invulnerableTimer <= 0) {
                    this.player.isInvulnerable = false;
                }
            }

            // Periodic collectible replenishment
            this.collectibleTimer -= dt;
            if (this.collectibleTimer <= 0) {
                this.spawnCollectible();
                this.collectibleTimer = 14 + Math.random() * 8;
            }

            // Coffee sprint timer
            if (this.player.coffeeBoost) {
                this.player.coffeeTimer -= dt;
                if (this.player.coffeeTimer <= 0) {
                    this.player.coffeeBoost = false;
                }
            }

            // Player hop interpolation
            if (this.player.isHopping) {
                const hopDuration = this.player.coffeeBoost
                    ? this.player.hopDuration * 0.65
                    : this.player.hopDuration;

                this.player.hopTimer += dt;
                const progress = Math.min(1.0, this.player.hopTimer / hopDuration);

                this.player.x = this.player.startX + (this.player.targetX - this.player.startX) * progress;
                this.player.y = this.player.startY + (this.player.targetY - this.player.startY) * progress;

                if (progress >= 1.0) {
                    this.player.isHopping = false;
                    this.player.x = this.player.targetX;
                    this.player.y = this.player.targetY;
                    this.checkGoalArrival();
                }
            }

            // Traffic update & bike spawning
            const freezeFactor = this.player.isFrozen ? 0.08 : 1.0;

            this.lanes.forEach(lane => {
                lane.bikes.forEach(bike => {
                    bike.x += bike.speed * bike.direction * dt * freezeFactor;

                    // Bell ringing behavior
                    bike.bellTimer -= dt;
                    if (bike.bellTimer <= 0) {
                        bike.isRingingBell = true;
                        if (Math.abs(bike.x - this.player.x) < 200) {
                            sounds.playBikeBell();
                        }
                        bike.bellTimer = Math.random() * 6 + 4;
                        setTimeout(() => { bike.isRingingBell = false; }, 350);
                    }
                });

                // Wrap / recycle bikes
                lane.bikes.forEach(bike => {
                    if (lane.direction === 1 && bike.x > CANVAS_WIDTH + 100) {
                        bike.x = -lane.bikeWidth - Math.random() * 50;
                    } else if (lane.direction === -1 && bike.x < -lane.bikeWidth - 100) {
                        bike.x = CANVAS_WIDTH + Math.random() * 50;
                    }
                });
            });

            // GVB Tram on Central Median (Row 5)
            this.updateTram(dt, freezeFactor);

            // Collectible pickup checks
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                const item = this.collectibles[i];
                if (this.checkCollision(this.getPlayerHitbox(), item)) {
                    this.collectibles.splice(i, 1);
                    sounds.playCollect();

                    if (item.type === 'stroopwafel') {
                        this.addScore(200);
                        this.addFloatingText('+200 🧇 WARM STROOPWAFEL!', item.x - 30, item.y - 10, '#f59e0b');
                    } else if (item.type === 'coffee') {
                        this.addScore(100);
                        this.player.coffeeBoost = true;
                        this.player.coffeeTimer = 5.0; // 5 sec sprint
                        this.addFloatingText('+100 ☕ COFFEE SPRINT BOOST!', item.x - 30, item.y - 10, '#eab308');
                    } else if (item.type === 'swagsocks') {
                        this.addScore(500);
                        this.addFloatingText('+500 🧦 ATLASSIAN SWAG SOCKS!', item.x - 30, item.y - 10, '#38bdf8');
                    } else if (item.type === 'headphones') {
                        this.player.shield = true;
                        this.addFloatingText('🎧 NOISE CANCELING SHIELD ON!', item.x - 40, item.y - 10, '#38bdf8');
                    }
                }
            }

            // Hazard Collision Detection (Player vs Bikes & Tram)
            this.checkTrafficCollisions();

            // Update particles & floating texts
            this.updateParticles(dt);
        }

        updateEntitiesOnly(dt) {
            // Keep animations and background bikes moving smoothly in menus
            this.lanes.forEach(lane => {
                lane.bikes.forEach(bike => {
                    bike.x += bike.speed * bike.direction * dt * 0.8;
                    if (lane.direction === 1 && bike.x > CANVAS_WIDTH + 100) {
                        bike.x = -lane.bikeWidth - 30;
                    } else if (lane.direction === -1 && bike.x < -lane.bikeWidth - 100) {
                        bike.x = CANVAS_WIDTH + 30;
                    }
                });
            });
            this.updateParticles(dt);
        }

        updateTram(dt, freezeFactor) {
            this.tramTimer -= dt * freezeFactor;
            const tramRowY = 5 * TILE_HEIGHT;

            if (this.tramTimer <= 0 && !this.tram) {
                // Spawn a GVB Tram
                const dir = Math.random() > 0.5 ? 1 : -1;
                this.tram = {
                    x: dir === 1 ? -170 : CANVAS_WIDTH + 10,
                    y: tramRowY + 4,
                    width: 160,
                    height: 38,
                    speed: 240,
                    direction: dir,
                    type: 'tram',
                    isRingingBell: true
                };
                sounds.playTramBell();
                this.addFloatingText('🔔 GVB TRAM 4 INCOMING!', CANVAS_WIDTH / 2 - 80, tramRowY - 14, '#ef4444');
            }

            if (this.tram) {
                this.tram.x += this.tram.speed * this.tram.direction * dt * freezeFactor;
                if ((this.tram.direction === 1 && this.tram.x > CANVAS_WIDTH + 200) ||
                    (this.tram.direction === -1 && this.tram.x < -200)) {
                    this.tram = null;
                    this.tramTimer = 11 + Math.random() * 10;
                }
            }
        }

        getPlayerHitbox() {
            // Forgiving hitbox (slightly smaller than sprite) so near-misses feel fun!
            const padX = 8;
            const padY = 8;
            return {
                x: this.player.x + padX,
                y: this.player.y + padY,
                width: this.player.width - padX * 2,
                height: this.player.height - padY * 2
            };
        }

        checkCollision(boxA, boxB) {
            return (
                boxA.x < boxB.x + boxB.width &&
                boxA.x + boxA.width > boxB.x &&
                boxA.y < boxB.y + boxB.height &&
                boxA.y + boxA.height > boxB.y
            );
        }

        checkTrafficCollisions() {
            if (this.player.isInvulnerable) return;
            const playerBox = this.getPlayerHitbox();

            // Check bicycle collisions
            for (let lane of this.lanes) {
                for (let bike of lane.bikes) {
                    const bikeBox = {
                        x: bike.x + 4,
                        y: bike.y + 4,
                        width: bike.width - 8,
                        height: bike.height - 8
                    };

                    if (this.checkCollision(playerBox, bikeBox)) {
                        this.handlePlayerHit(bike.type);
                        return;
                    }
                }
            }

            // Check Tram collision
            if (this.tram) {
                const tramBox = {
                    x: this.tram.x + 6,
                    y: this.tram.y + 4,
                    width: this.tram.width - 12,
                    height: this.tram.height - 8
                };
                if (this.checkCollision(playerBox, tramBox)) {
                    this.handlePlayerHit('GVB Tram');
                    return;
                }
            }
        }

        updateParticles(dt) {
            // Particle bursts
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
                p.alpha = Math.max(0, p.life / 0.6);
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // Floating text messages
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.y -= 24 * dt;
                ft.life -= dt;
                ft.alpha = Math.max(0, ft.life / 1.2);
                if (ft.life <= 0) {
                    this.floatingTexts.splice(i, 1);
                }
            }
        }

        render() {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // 1. Background (Hotel, Bike lanes, Median, RAI entrance)
            sprites.drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_HEIGHT, 6);

            // 2. Goal Bays at RAI entrance
            sprites.drawGoalBays(ctx, GOAL_BAYS, CANVAS_WIDTH);

            // 3. Collectibles
            this.collectibles.forEach(item => {
                sprites.drawCollectible(ctx, item);
            });

            // 4. Bicycles on lower lanes (Row 8, 7, 6)
            this.lanes.filter(l => l.row >= 6).forEach(lane => {
                lane.bikes.forEach(bike => sprites.drawBicycle(ctx, bike));
            });

            // 5. GVB Tram on Central Median
            if (this.tram) {
                sprites.drawBicycle(ctx, this.tram);
            }

            // 6. Bicycles on upper fast lanes (Row 4, 3, 2)
            this.lanes.filter(l => l.row <= 4).forEach(lane => {
                lane.bikes.forEach(bike => sprites.drawBicycle(ctx, bike));
            });

            // 7. Player Consultant Character
            if (this.state === STATE_PLAYING || this.state === STATE_LEVELWIN) {
                const hopProgress = this.player.isHopping
                    ? Math.min(1.0, this.player.hopTimer / (this.player.coffeeBoost ? this.player.hopDuration * 0.65 : this.player.hopDuration))
                    : 0;

                sprites.drawConsultant(
                    ctx,
                    this.player.x,
                    this.player.y,
                    this.player.width,
                    this.player.height,
                    this.selectedCharacter,
                    this.player.facing,
                    this.player.isHopping,
                    hopProgress,
                    this.player.shield,
                    this.player.coffeeBoost,
                    this.player.isInvulnerable
                );
            }

            // 8. Rain weather effect
            if (this.weatherParticles.length > 0) {
                ctx.save();
                ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
                ctx.lineWidth = 1.5;
                this.weatherParticles.forEach(wp => {
                    ctx.beginPath();
                    ctx.moveTo(wp.x, wp.y);
                    ctx.lineTo(wp.x - 3, wp.y + wp.len);
                    ctx.stroke();
                });
                ctx.restore();
            }

            // 9. Particles (Impact splatters, confetti)
            this.particles.forEach(p => {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 10. Floating Alert Messages
            this.floatingTexts.forEach(ft => {
                ctx.save();
                ctx.fillStyle = ft.color;
                ctx.globalAlpha = ft.alpha;
                ctx.font = '900 13px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 6;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });

            // 11. HUD Overlay Bar inside Canvas (Timer & Level Tag)
            this.renderCanvasHUD();
        }

        renderCanvasHUD() {
            if (this.state !== STATE_PLAYING) return;

            // Timer gauge along top edge
            const timerRatio = Math.max(0, this.currentTime / this.roundTime);
            const timerWidth = (CANVAS_WIDTH - 20) * timerRatio;
            const timerY = 46;

            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.fillRect(10, timerY, CANVAS_WIDTH - 20, 5);

            // Green to Red gradient as time runs low
            ctx.fillStyle = timerRatio > 0.3 ? '#22c55e' : (timerRatio > 0.15 ? '#eab308' : '#ef4444');
            ctx.fillRect(10, timerY, timerWidth, 5);
            ctx.restore();
        }

        updateUI() {
            const scoreEl = document.getElementById('scoreDisplay');
            const highScoreEl = document.getElementById('highScoreDisplay');
            const levelEl = document.getElementById('levelDisplay');
            const livesEl = document.getElementById('livesContainer');

            if (scoreEl) scoreEl.textContent = this.score.toString();
            if (highScoreEl) highScoreEl.textContent = this.highScore.toString();
            if (levelEl) levelEl.textContent = `Stage ${this.level}`;

            if (livesEl) {
                livesEl.innerHTML = '';
                for (let i = 0; i < 3; i++) {
                    const badge = document.createElement('span');
                    badge.className = `life-badge ${i < this.lives ? 'active' : 'lost'}`;
                    badge.title = 'Conference Lanyard';
                    badge.textContent = '🪪';
                    livesEl.appendChild(badge);
                }
            }
        }

        updateAbilityUI() {
            const char = CHARACTERS[this.selectedCharacter];
            const btnSpecial = document.getElementById('btnSpecial');
            const abilityText = document.getElementById('abilityText');

            if (btnSpecial) {
                if (char.hasFreezeAbility) {
                    btnSpecial.style.display = 'flex';
                    btnSpecial.disabled = this.player.abilityCharges <= 0;
                } else {
                    btnSpecial.style.display = 'none';
                }
            }

            if (abilityText) {
                abilityText.textContent = char.specialText || 'Standard';
            }
        }

        gameLoop(time) {
            const dt = Math.min((time - this.lastTime) / 1000, 0.1);
            this.lastTime = time;

            this.update(dt);
            this.render();

            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    // Launch game when DOM is loaded
    window.addEventListener('DOMContentLoaded', () => {
        window.amsterdamGame = new Game();
    });

})();
