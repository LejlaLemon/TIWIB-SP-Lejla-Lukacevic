import * as Phaser from 'phaser';
import labImg from '../assets/images/Lab.png';
import { saveSlot } from "../database/saveSystem.js";

export class LabScene extends Phaser.Scene {
    constructor() {
        super('LabScene');
    }

    init(data) {
        this.incomingSave = data?.saveData || null;
        this.isLoadingSave = !!data?.saveData;
    }

    preload() {
        this.load.image('lab', labImg);

        this.load.spritesheet('player', '/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image('pauseIcon', '/pause.png');
        this.load.image('journal1','/Journal1.JPG');
        this.load.image('journal2','/Journal2.JPG');
        this.load.image('journal3','/Journal3.JPG');
        this.load.image('eyeGlow', '/EyesGlow.png');
    }

    create() {

        this.journalsCollected = 0;
        this.totalJournals = 3;

        this.objectiveText = this.add.text(20, 20,
            `Objective: Collect the journal entries: ${this.journalsCollected}/${this.totalJournals}`,
            {
                fontSize: '20px',
                color: '#00ff00'
            }
        )
        .setDepth(2000)
        .setScrollFactor(0)
        .setVisible(false);

        this.input.keyboard.enabled = true;

        this.time.delayedCall(0, () => {
            if (this.input && this.input.keyboard) {
                this.input.keyboard.enabled = true;
            }
        });

        this.currentSlot = this.registry.get('activeSlot') || 1;

        console.log("Active Slot:", this.currentSlot);

        const music = this.sound.get('menuMusic');
        if (music) music.stop();

        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'lab');
        bg.setDisplaySize(width, height);

        this.pauseIcon = this.add.image(width - 20, 20, 'pauseIcon');

        if (this.pauseIcon) {
            this.pauseIcon
                .setOrigin(1, 0)
                .setScale(1)
                .setDepth(1000);

            this.pauseIcon.setInteractive({ useHandCursor: true });

            this.pauseIcon.on('pointerdown', () => {
                if (this.isJournalModalOpen) return;
                this.togglePause();
            });
        }

        this.isPaused = false;

        this.togglePause = () => {
            this.isPaused = !this.isPaused;

            if (this.isPaused) {
                this.physics.pause();
                this.openPauseMenu();
            } else {
                this.physics.resume();
                this.closePauseMenu();
            }
        };

        this.openPauseMenu = () => {
            const { width, height } = this.scale;

            this.overlay = this.add.rectangle(
                width / 2,
                height / 2,
                width,
                height,
                0x000000,
                0.6
            ).setDepth(1000);

            const createBtn = (y, label, action) => {
                const btn = this.add.text(width / 2, y, label, {
                    fontSize: '32px',
                    color: '#00ff00'
                })
                .setOrigin(0.5)
                .setDepth(1001)
                .setInteractive({ useHandCursor: true });

                btn.on('pointerover', () => btn.setColor('#00aa00'));
                btn.on('pointerout', () => btn.setColor('#00ff00'));
                btn.on('pointerdown', action);

                return btn;
            };

            this.saveBtn = createBtn(260, "Save", () => {

                const data = {
                    level: 1,
                    position: {
                        x: this.player.x,
                        y: this.player.y
                    },
                    journalStates: this.journalStates,
                    journalsCollected: this.journalsCollected
                };

                this.scene.pause();

                this.scene.launch('SaveScene', {
                    saveData: data,
                    fromPause: true
                });
            });

            this.controlsBtn = createBtn(320, "Controls", () => {
                this.scene.pause();
                this.scene.launch('ControlsScene');
            });

            this.resumeBtn = createBtn(380, "Resume", () => {
                this.togglePause();
            });

            this.exitBtn = createBtn(440, "Exit to Menu", () => {
                this.scene.start('Start');
            });
        };

        this.closePauseMenu = () => {
            this.overlay?.destroy();
            this.saveBtn?.destroy();
            this.controlsBtn?.destroy();
            this.resumeBtn?.destroy();
            this.exitBtn?.destroy();

            if (this.input && this.input.keyboard) {
                this.input.keyboard.enabled = true;
            }
        };

        this.isDialogueOpen = false;

        this.showMessage = (msg) => {
            console.log(msg);
        };

        this.showDialogue = (lines, onComplete) => {
            if (this.isDialogueOpen || this.isJournalModalOpen || this.isPaused || !lines?.length) return;

            this.isDialogueOpen = true;
            const wasAbleToMove = this.canMove;
            this.canMove = false;
            this.player.setVelocity(0, 0);
            this.player.anims.stop();

            const { width, height } = this.scale;
            const ui = {};
            let idx = 0;

            const cleanup = () => {
                this.input.keyboard.off('keydown-ENTER', onEnter);
                ui.overlay?.destroy();
                ui.box?.destroy();
                ui.text?.destroy();
                ui.hint?.destroy();
            };

            const closeDialogue = () => {
                cleanup();
                this.isDialogueOpen = false;
                this.canMove = wasAbleToMove;
                onComplete?.();
            };

            const onEnter = () => {
                idx++;
                if (idx < lines.length) {
                    ui.text.setText(lines[idx]);
                    return;
                }
                closeDialogue();
            };

            ui.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(2500);
            ui.box = this.add.rectangle(width / 2, height - 130, 920, 170, 0x000000, 0.92)
                .setStrokeStyle(2, 0x00ff00)
                .setDepth(2501);
            ui.text = this.add.text(width / 2, height - 145, lines[0], {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 860 }
            }).setOrigin(0.5).setDepth(2502);
            ui.hint = this.add.text(width - 170, height - 60, 'Press ENTER', {
                fontSize: '16px',
                color: '#ffffff'
            }).setDepth(2502);

            this.input.keyboard.on('keydown-ENTER', onEnter);
        };

        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setScale(2.5);
        this.player.setOrigin(0.5, 0.05);
        this.player.setCollideWorldBounds(true);

        // Initialize journal states before loading save data
        this.journalStates = {
            deskJournal: { resolved: false, collected: false },
            leftPaper: { resolved: false, collected: false },
            rightPaper: { resolved: false, collected: false }
        };

        this.areAllJournalsResolved = () => {
            return Object.values(this.journalStates).every(state => state.resolved);
        };

        if (this.textures.exists('eyeGlow') && !this.textures.exists('eyeGlowSS')) {
            const eyeTexture = this.textures.get('eyeGlow');
            const source = eyeTexture.source[0].image;
            const frameWidth = Math.floor(source.width / 2);
            const frameHeight = source.height;

            this.textures.addSpriteSheet('eyeGlowSS', source, {
                frameWidth,
                frameHeight
            });
        }

        this.showContainerObjective = () => {
            if (this.containerObjectiveShown) return;
            this.containerObjectiveShown = true;
            this.objectiveText?.setText("Objective: Go to the container");
            this.showMessage("All journal choices are locked in. Go to the container.");
        };

        if (this.incomingSave) {
            this.isLoadingSave = true;

            if (this.incomingSave.position) {
                this.player.setPosition(
                    this.incomingSave.position.x,
                    this.incomingSave.position.y
                );
            }

            // Restore journal states from save
            if (this.incomingSave.journalStates) {
                this.journalStates = this.incomingSave.journalStates;
            }

            // Restore collected journal count
            if (this.incomingSave.journalsCollected !== undefined) {
                this.journalsCollected = this.incomingSave.journalsCollected;
            }

            // Check if container objective should be shown
            if (this.areAllJournalsResolved()) {
                this.showContainerObjective();
            }

            // Update taken flags based on loaded journal states
            this.deskTaken = this.journalStates.deskJournal.collected;
            this.leftTaken = this.journalStates.leftPaper.collected;
            this.rightTaken = this.journalStates.rightPaper.collected;
        }

        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        this.keys.interact = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.canMove = false;
        this.isJournalModalOpen = false;
        this.isEndingModalOpen = false;
        this.containerObjectiveShown = false;

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 16 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', { start: 17, end: 25 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 26, end: 34 }),
            frameRate: 10,
            repeat: -1
        });

        this.walls = [];

        const createWall = (x, y, w, h) => {
            const rect = this.add.rectangle(x, y, w, h, 0xff0000, 0.3);
            rect.setVisible(false);
            this.physics.add.existing(rect, true);
            this.walls.push(rect);
        };

        createWall(640, 100, 1100, 200);
        createWall(80, 360, 160, 720);
        createWall(1200, 360, 160, 720);
        createWall(1050, 580, 200, 120);

        this.walls.forEach(wall => {
            this.physics.add.collider(this.player, wall);
        });

       //interactable journals
        this.nearInteractable = null;
        this.interactText = null;

        this.deskTaken = false;
        this.leftTaken = false;
        this.rightTaken = false;

        this.createInteractable = (x, y, w, h, name, onInteract) => {
            const obj = this.add.rectangle(x, y, w, h, 0x00ff00, 0.2);
            obj.setVisible(false);
            this.physics.add.existing(obj, true);
            obj.name = name;
            obj.onInteract = onInteract;
            return obj;
        };

        this.showEnding = (isGoodEnding) => {
            if (this.isEndingModalOpen) return;
            this.isEndingModalOpen = true;
            this.canMove = false;
            this.player.setVelocity(0, 0);
            this.player.anims.stop();

            const { width, height } = this.scale;

            if (isGoodEnding) {
                // Good ending
                // Fade to black immediately
                const fadeOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1).setDepth(3000);
                
                // Show the dialogue sequence after a brief delay
                this.time.delayedCall(500, () => {
                    const dialogueLines = [
                        "I put my hand on the container, closed my eyes and hope for the best.",
                        "???: Let's hope this works.",
                        "I've hold my breath as I think, think of how this creature would feel, move, act.",
                        "And as I do, I sense the essence of my power grow. That necklace. Flowing to my hands, feeling the warmth.",
                        "As minutes go by, I've heard this loud growl, the screams.",
                        "I've opened my eyes and saw it"
                    ];
                    
                    const displayedTexts = [];
                    let currentLine = 0;
                    
                    const showDialogueLine = () => {
                        if (currentLine < dialogueLines.length) {
                            // Create dialogue box
                            const box = this.add.rectangle(width / 2, height - 130, 920, 170, 0x000000, 0.92)
                                .setStrokeStyle(2, 0x00ff00)
                                .setDepth(3001);
                            const text = this.add.text(width / 2, height - 145, dialogueLines[currentLine], {
                                fontFamily: 'Arial',
                                fontSize: '24px',
                                color: '#ffffff',
                                align: 'center',
                                wordWrap: { width: 860 }
                            }).setOrigin(0.5).setDepth(3002);
                            const hint = this.add.text(width - 170, height - 60, 'Press ENTER', {
                                fontSize: '16px',
                                color: '#ffffff'
                            }).setDepth(3002);
                            
                            displayedTexts.push(box, text, hint);
                            
                            const onEnter = () => {
                                this.input.keyboard.off('keydown-ENTER', onEnter);
                                
                                displayedTexts.forEach(element => {
                                    if (element !== box && element !== text && element !== hint) return;
                                    element.destroy();
                                });
                                displayedTexts.length = 0; // Clear array
                                
                                currentLine++;
                                showDialogueLine();
                            };
                            
                            this.input.keyboard.on('keydown-ENTER', onEnter);
                        } else {
                            // All initial dialogue shown, show the eye glow
                            this.time.delayedCall(1000, () => {
                                const eyeGlowSprite = this.add.sprite(width / 2, height / 2 - 40, 'eyeGlowSS', 0)
                                    .setOrigin(0.5)
                                    .setScale(1)
                                    .setDepth(3001);

                                // Continue with more dialogue after eye glow
                                this.time.delayedCall(2000, () => {
                                    eyeGlowSprite.destroy();

                                    const continuedDialogue = [
                                        "???: I see those eyes...haunting me...like I'm some sort of prey.",
                                        "All of a sudden it grab me on my neck."
                                    ];

                                    const continuedDisplayedTexts = [];
                                    let continuedCurrentLine = 0;

                                    const showContinuedDialogue = () => {
                                        if (continuedCurrentLine < continuedDialogue.length) {
                                            // Create dialogue box
                                            const box = this.add.rectangle(width / 2, height - 130, 920, 170, 0x000000, 0.92)
                                                .setStrokeStyle(2, 0x00ff00)
                                                .setDepth(3001);
                                            const text = this.add.text(width / 2, height - 145, continuedDialogue[continuedCurrentLine], {
                                                fontFamily: 'Arial',
                                                fontSize: '24px',
                                                color: '#ffffff',
                                                align: 'center',
                                                wordWrap: { width: 860 }
                                            }).setOrigin(0.5).setDepth(3002);
                                            const hint = this.add.text(width - 170, height - 60, 'Press ENTER', {
                                                fontSize: '16px',
                                                color: '#ffffff'
                                            }).setDepth(3002);

                                            continuedDisplayedTexts.push(box, text, hint);

                                            const onEnter = () => {
                                                this.input.keyboard.off('keydown-ENTER', onEnter);
                                                
                                                continuedDisplayedTexts.forEach(element => {
                                                    if (element !== box && element !== text && element !== hint) return;
                                                    element.destroy();
                                                });
                                                continuedDisplayedTexts.length = 0;

                                                continuedCurrentLine++;
                                                showContinuedDialogue();
                                            };

                                            this.input.keyboard.on('keydown-ENTER', onEnter);
                                        } else {
                                            // Show the shaking red text
                                            this.time.delayedCall(500, () => {
                                                const shakingText1 = this.add.text(width / 2, height / 2 - 50, "WHAT DID YOU DO TO ME?!", {
                                                    fontSize: '36px',
                                                    color: '#ff0000',
                                                    fontStyle: 'bold',
                                                    align: 'center'
                                                }).setOrigin(0.5).setDepth(3001);

                                                // Add shaking effect
                                                this.tweens.add({
                                                    targets: shakingText1,
                                                    x: { from: width / 2 - 5, to: width / 2 + 5 },
                                                    duration: 50,
                                                    yoyo: true,
                                                    repeat: 10
                                                });

                                                const onEnterShake1 = () => {
                                                    this.input.keyboard.off('keydown-ENTER', onEnterShake1);
                                                    shakingText1.destroy();

                                                    const shakingText2 = this.add.text(width / 2, height / 2 - 50, "YOU MONSTER-", {
                                                        fontSize: '36px',
                                                        color: '#ff0000',
                                                        fontStyle: 'bold',
                                                        align: 'center'
                                                    }).setOrigin(0.5).setDepth(3001);

                                                    // Add shaking effect
                                                    this.tweens.add({
                                                        targets: shakingText2,
                                                        x: { from: width / 2 - 5, to: width / 2 + 5 },
                                                        duration: 50,
                                                        yoyo: true,
                                                        repeat: 10
                                                    });

                                                    const onEnterShake2 = () => {
                                                        this.input.keyboard.off('keydown-ENTER', onEnterShake2);
                                                        shakingText2.destroy();

                                                        // Continue with final dialogue
                                                        const finalDialogue = [
                                                            "As It said that, all of it's bones scattered... I failed again..",
                                                            "But this time I've heard footsteps getting closer and closer, now it's my chance to escape.",
                                                            "I've open the door and ran and ran, like my legs were falling apart..",
                                                            "I've kicked the front door, and saw the gate, but as I was getting closer and closer, I've seen a portal, and closed my eyes, seeing a strange alleyway",
                                                            "???: I'm back to my world... I'm safe!",
                                                            "???: I finally escaped that H*ll hole.."
                                                        ];

                                                        const finalDisplayedTexts = [];
                                                        let finalCurrentLine = 0;

                                                        const showFinalDialogue = () => {
                                                            if (finalCurrentLine < finalDialogue.length) {
                                                                // Create dialogue box
                                                                const box = this.add.rectangle(width / 2, height - 130, 920, 170, 0x000000, 0.92)
                                                                    .setStrokeStyle(2, 0x00ff00)
                                                                    .setDepth(3001);
                                                                const text = this.add.text(width / 2, height - 145, finalDialogue[finalCurrentLine], {
                                                                    fontFamily: 'Arial',
                                                                    fontSize: '24px',
                                                                    color: '#ffffff',
                                                                    align: 'center',
                                                                    wordWrap: { width: 860 }
                                                                }).setOrigin(0.5).setDepth(3002);
                                                                const hint = this.add.text(width - 170, height - 60, 'Press ENTER', {
                                                                    fontSize: '16px',
                                                                    color: '#ffffff'
                                                                }).setDepth(3002);

                                                                finalDisplayedTexts.push(box, text, hint);

                                                                const onEnterFinal = () => {
                                                                    this.input.keyboard.off('keydown-ENTER', onEnterFinal);
                                                                    // Clean up current dialogue
                                                                    finalDisplayedTexts.forEach(element => {
                                                                        if (element !== box && element !== text && element !== hint) return;
                                                                        element.destroy();
                                                                    });
                                                                    finalDisplayedTexts.length = 0;

                                                                    finalCurrentLine++;
                                                                    showFinalDialogue();
                                                                };
                                                            this.input.keyboard.on('keydown-ENTER', onEnterFinal);
                                                            } else {
                                                                // Show the final popup
                                                                this.time.delayedCall(1000, () => {
                                                                    // Show GOOD ENDING title
                                                                    const goodEndingTitle = this.add.text(width / 2, height / 2 - 150, "GOOD ENDING", {
                                                                        fontSize: '44px',
                                                                        color: '#00ff00',
                                                                        align: 'center'
                                                                    }).setOrigin(0.5).setDepth(3001);
                                                                      this.time.delayedCall(1550, () => {
                                                                        const lines = [
                                                                            "You're Free But You won't Escape The Past.",
                                                                            "We're ALWAYS watching.",
                                                                            "We Know Who You Are.",
                                                                            "The Good Ending,",
                                                                            "You Finally uncovered the truth."
                                                                        ];

                                                                        const textElements = [];
                                                                        let lineIndex = 0;

                                                                        const showNextLine = () => {
                                                                            if (lineIndex < lines.length) {
                                                                                const yPos = height / 2 - 20 + (lineIndex * 35);
                                                                                const textElement = this.add.text(width / 2, yPos, lines[lineIndex], {
                                                                                    fontSize: '32px',
                                                                                    color: '#00ff00',
                                                                                    align: 'center'
                                                                                }).setOrigin(0.5).setDepth(3001);
                                                                                textElements.push(textElement);

                                                                                lineIndex++;
                                                                                this.time.delayedCall(800, showNextLine); // 800ms delay between lines
                                                                            } else {
                                                                                // All lines shown, add continue button after a brief pause
                                                                                this.time.delayedCall(1000, () => {
                                                                                    const continueBtn = this.add.text(width / 2, height / 2 + 180, "Return to Menu", {
                                                                                        fontSize: '30px',
                                                                                        color: '#00ff00'
                                                                                    })
                                                                                    .setOrigin(0.5)
                                                                                    .setDepth(3001)
                                                                                    .setInteractive({ useHandCursor: true });

                                                                                    continueBtn.on('pointerover', () => continueBtn.setColor('#66ff66'));
                                                                                    continueBtn.on('pointerout', () => continueBtn.setColor('#00ff00'));
                                                                                    continueBtn.on('pointerdown', () => {
                                                                                        fadeOverlay.destroy();
                                                                                        goodEndingTitle.destroy();
                                                                                        textElements.forEach(element => element.destroy());
                                                                                        continueBtn.destroy();
                                                                                        this.scene.start('Start');
                                                                                    });
                                                                                });
                                                                            }
                                                                        };
                                                                        showNextLine();
                                                                    });
                                                                });
                                                            }
                                                        };
                                                        showFinalDialogue();
                                                    };
                                                    this.input.keyboard.on('keydown-ENTER', onEnterShake2);
                                                };
                                                this.input.keyboard.on('keydown-ENTER', onEnterShake1);
                                            });
                                        }
                                    };
                                    showContinuedDialogue();
                                });
                            });
                        }
                    };
                    showDialogueLine();
                });
            } else {
                // Bad ending
                // Fade to black immediately
                const fadeOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1).setDepth(3000);

                // Show the text sequence after a brief delay
                this.time.delayedCall(500, () => {
                    const textLines = [
                        "This isn't how this started.",
                        "Remember.",
                        "Try Again."
                    ];
                    const displayedTexts = [];
                    let currentLine = 0;
                    const displayText = () => {
                        if (currentLine < textLines.length) {
                            // Position quotes higher up from center
                            const text = this.add.text(width / 2, height / 2 - 80 + (currentLine * 40), textLines[currentLine], {
                                fontSize: '32px',
                                color: '#00ff00',
                                align: 'center'
                            }).setOrigin(0.5).setDepth(3001);
                            displayedTexts.push(text);
                            
                            this.time.delayedCall(1500, () => {
                                currentLine++;
                                displayText();
                            });
                        } else {
                            // All quotes shown, now show BAD ENDING title
                            const badEndingTitle = this.add.text(width / 2, height / 2 - 150, "BAD ENDING", {
                                fontSize: '44px',
                                color: '#ff5555',
                                align: 'center'
                            }).setOrigin(0.5).setDepth(3001);
                            
                            // Show the bad ending message after delay
                            this.time.delayedCall(1550, () => {
                                // Destroy the quote texts
                                displayedTexts.forEach(text => text.destroy());

                                const badEndingText = this.add.text(width / 2, height / 2 + 10,
                                    "You're just a person looking at the screen,\nbut you need to see the truth.", {
                                    fontSize: '24px',
                                    color: '#ffffff',
                                    align: 'center'
                                }).setOrigin(0.5).setDepth(3001);
                                
                                // Add continue button
                                const continueBtn = this.add.text(width / 2, height / 2 + 100, "Return to Menu", {
                                    fontSize: '30px',
                                    color: '#00ff00'
                                })
                                .setOrigin(0.5)
                                .setDepth(3001)
                                .setInteractive({ useHandCursor: true });

                                continueBtn.on('pointerover', () => continueBtn.setColor('#66ff66'));
                                continueBtn.on('pointerout', () => continueBtn.setColor('#00ff00'));
                                continueBtn.on('pointerdown', () => {
                                    fadeOverlay.destroy();
                                    badEndingTitle.destroy();
                                    badEndingText.destroy();
                                    continueBtn.destroy();
                                    this.scene.start('Start');
                                });
                            });
                        }
                    };
                    displayText();
                });
            }
        };
        this.beginJournalInteraction = (journalKey, dialogueLines, onAccept, journalImageKey) => {
            const state = this.journalStates[journalKey];
            if (!state || state.resolved || this.isJournalModalOpen || this.isPaused) return;

            this.isJournalModalOpen = true;
            const wasAbleToMove = this.canMove;
            this.canMove = false;
            this.player.setVelocity(0, 0);
            this.player.anims.stop();

            const { width, height } = this.scale;
            const ui = {};

            if (journalImageKey) {
                ui.image = this.add.image(width / 2, height / 2 - 100, journalImageKey)
                    .setOrigin(0.5)
                    .setDepth(2101);

                const maxWidth = width * 0.70;
                const maxHeight = height * 0.65;
                const scale = Math.min(maxWidth / ui.image.width, maxHeight / ui.image.height, 1);
                ui.image.setScale(scale);
            }

            const cleanupUi = () => {
                ui.overlay?.destroy();
                ui.box?.destroy();
                ui.text?.destroy();
                ui.hint?.destroy();
                ui.question?.destroy();
                ui.yesBtn?.destroy();
                ui.noBtn?.destroy();
                ui.image?.destroy();
            };

            const closeJournalFlow = () => {
                this.input.keyboard.off('keydown-ENTER', handleEnter);
                cleanupUi();
                this.isJournalModalOpen = false;
                this.canMove = wasAbleToMove;
                if (this.areAllJournalsResolved()) {
                    this.showContainerObjective();
                }
            };

            const showChoicePrompt = () => {
                ui.image?.destroy();
                ui.hint?.destroy();
                ui.text?.destroy();
                ui.question = this.add.text(width / 2, height - 170, "Pick up this journal?", {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5).setDepth(2103);

                ui.yesBtn = this.add.text(width / 2 - 100, height - 110, "YES", {
                    fontSize: '28px',
                    color: '#00ff00'
                })
                .setOrigin(0.5)
                .setDepth(2103)
                .setInteractive({ useHandCursor: true });

                ui.noBtn = this.add.text(width / 2 + 100, height - 110, "NO", {
                    fontSize: '28px',
                    color: '#ff5555'
                })
                .setOrigin(0.5)
                .setDepth(2103)
                .setInteractive({ useHandCursor: true });

                ui.yesBtn.on('pointerover', () => ui.yesBtn.setColor('#66ff66'));
                ui.yesBtn.on('pointerout', () => ui.yesBtn.setColor('#00ff00'));
                ui.noBtn.on('pointerover', () => ui.noBtn.setColor('#ff8888'));
                ui.noBtn.on('pointerout', () => ui.noBtn.setColor('#ff5555'));

                ui.yesBtn.on('pointerdown', () => {
                    state.resolved = true;
                    state.collected = true;
                    onAccept?.();
                    closeJournalFlow();
                });

                ui.noBtn.on('pointerdown', () => {
                    state.resolved = true;
                    state.collected = false;
                    this.showMessage("You left it where it was.");
                    closeJournalFlow();
                });
            };

            let idx = 0;
            ui.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(2100);
            ui.box = this.add.rectangle(width / 2, height - 130, 920, 170, 0x000000, 0.9)
                .setStrokeStyle(2, 0x00ff00)
                .setDepth(2102);
            ui.text = this.add.text(width / 2, height - 145, dialogueLines[idx], {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 860 }
            }).setOrigin(0.5).setDepth(2103);
            ui.hint = this.add.text(width - 170, height - 60, "Press ENTER", {
                fontSize: '16px',
                color: '#ffffff'
            }).setDepth(2103);

            const handleEnter = () => {
                idx++;
                if (idx < dialogueLines.length) {
                    ui.text.setText(dialogueLines[idx]);
                    return;
                }
                this.input.keyboard.off('keydown-ENTER', handleEnter);
                showChoicePrompt();
            };

            this.input.keyboard.on('keydown-ENTER', handleEnter);
        };
        // Desk interaction
        this.deskInteract = this.createInteractable(
            1050,
            580,
            200,
            120,
            'deskJournal',
            () => {
                this.beginJournalInteraction('deskJournal', [
                    "???: I've remembered now...",
                    "???: I've came here by accident, this necklace...whatever this is, caused this...or was it I who caused this?"
                ], () => {
                    if (this.deskTaken) return;
                    this.deskTaken = true;
                    this.journalsCollected++;
                    this.updateObjective();
                    this.showMessage("Journal 1 collected (Desk)");
                }, 'journal1');
            }
        );
        //left click interaction
        this.input.on('pointerdown', (pointer) => {
            if (!this.canMove || this.isPaused || this.isJournalModalOpen) return;
            // Avoid triggering a gameplay interact on the same click as the pause icon.
            if (this.pauseIcon) {
                const b = this.pauseIcon.getBounds?.();
                if (b && Phaser.Geom.Rectangle.Contains(b, pointer.worldX, pointer.worldY)) return;
            }
            this.nearInteractable?.onInteract?.();
        });
        // Journal 2 - left wall paper
        this.leftJournal = this.createInteractable(
            140,
            height / 2,
            80,
            120,
            'leftPaper',
            () => {
                this.beginJournalInteraction('leftPaper', [
                    "???: Those things...creatures? I don't know...but..they look..human... ",
                    "???: I feel like they're doing this for a reason but I can't remember...",
                    "???: But whatever they want...they're always watching me..."
                ], () => {
                    if (this.leftTaken) return;
                    this.leftTaken = true;
                    this.journalsCollected++;
                    this.updateObjective();
                    this.showMessage("Found Journal Entry #2 (Left Wall)");
                }, 'journal2');
            }
        );
        // Journal 3 - right wall paper
        this.rightJournal = this.createInteractable(
            1020,          
            height / 2,
            60,
            120,           
            'rightPaper',
            () => {
                this.beginJournalInteraction('rightPaper', [
                    "???: I remembered...they're objective...",
                    "???: Why do they need me. I'm scared of what will happen to our world...I can't watch it fall"
                ], () => {
                    if (this.rightTaken) return;
                    this.rightTaken = true;
                    this.journalsCollected++;
                    this.updateObjective();
                    this.showMessage("Found Journal Entry #3 (Right Wall)");
                }, 'journal3');
            }
        );
        // Container interaction
        this.container = this.createInteractable(
            width / 2,
            height / 2 - 150,
            140,
            100,
            'container',
            () => {
                if (this.isJournalModalOpen || this.isEndingModalOpen || this.isDialogueOpen) return;

                const allResolved = this.areAllJournalsResolved();
                const allCollected = this.journalsCollected === this.totalJournals;

                if (!allResolved) {
                    this.showDialogue([
                        "???: Not now. I feel like I'm missing something...",
                        "???: I should remember what am I missing..."
                    ]);
                    return;
                }

                if (allCollected) {
                    this.showDialogue([
                        "???: Now I remembered everything...",
                        "???: But I'm still missing something...A soul...his soul...",
                        "???: But I don't have enough time...Time to finish this...",
                        "???: Let's hope this works..."
                    ], () => this.showEnding(true));
                } else {
                    this.showDialogue([
                        "???: Cr*p. I don't remember what to do...what am I missing...?",
                        "???: I'm scared...I'm scared....help me...please..."
                    ], () => this.showEnding(false));
                }
            }
        );

        this.interactables = [
            this.deskInteract,
            this.leftJournal,
            this.rightJournal,
            this.container
        ].filter(obj => obj && obj.getBounds);
        if (
            !this.incomingSave ||
            (this.incomingSave.level === 1 && !this.incomingSave.position)
        ) {
            this.dialogues = [
                "???: Ugh Where Am I?",
                "???: Oh...Right...The Lab...",
                "???: My Experiment Is Done, I Need To Go To The Container...",
                "???: Let Hope This Works...",
                "???: But I Feel Like I'm Missing Something..."
            ];

            this.currentIndex = 0;

            this.box = this.add.rectangle(width / 2, height - 120, 900, 150, 0x000000)
                .setStrokeStyle(2, 0x00ff00)
                .setAlpha(0.8);

            this.text = this.add.text(width / 2, height - 120, this.dialogues[0], {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                wordWrap: { width: 800 }
            }).setOrigin(0.5);

            this.input.keyboard.on('keydown-ENTER', () => {
                if (!this.canMove && !this.isPaused && !this.isJournalModalOpen && !this.isDialogueOpen) {
                    this.nextDialogue();
                }
            });

            this.hint = this.add.text(width - 150, height - 40, "Press ENTER", {
                fontSize: '16px',
                color: '#ffffff'
            });
        } else {
            this.canMove = true;
            this.objectiveText.setVisible(true);
            this.updateObjective(); // Update objective text to reflect loaded journal states
        }
    }
    update() {
        if (this.isPaused) return;
        if (this.isEndingModalOpen) return;
        if (!this.canMove) {
            this.player.setVelocity(0);
            this.player.anims.stop();
            if (this.interactText) {
                this.interactText.setVisible(false);
            }
            return;
        }

        const speed = 200;

        this.player.setVelocity(0);

        if (this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('walk-left', true);
        }
        else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('walk-right', true);
        }
        else if (this.keys.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('walk-up', true);
        }
        else if (this.keys.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('walk-down', true);
        }
        else {
            this.player.anims.stop();
        }
        // Interaction system of the game
        if (this.canMove) {
            this.nearInteractable = null;

            const playerBounds = this.player.getBounds();
            const playerCenterX = playerBounds.x + playerBounds.width / 2;
            const playerCenterY = playerBounds.y + playerBounds.height / 2;
            let bestDistSq = Infinity;

            for (const obj of this.interactables) {
                const bounds = obj.getBounds();
                if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, bounds)) continue;

                // If multiple interact zones overlap, choose the closest one to the player.
                const objCenterX = bounds.x + bounds.width / 2;
                const objCenterY = bounds.y + bounds.height / 2;
                const dx = playerCenterX - objCenterX;
                const dy = playerCenterY - objCenterY;
                const distSq = dx * dx + dy * dy;

                if (distSq < bestDistSq) {
                    bestDistSq = distSq;
                    this.nearInteractable = obj;
                }
            }

            if (this.nearInteractable) {
                if (!this.interactText) {
                    this.interactText = this.add.text(
                        this.player.x,
                        this.player.y - 40,
                        "Press E or Click",
                        { fontSize: '16px', color: '#ffffff' }
                    ).setOrigin(0.5);
                } else {
                    this.interactText.setPosition(this.player.x, this.player.y - 40);
                    this.interactText.setVisible(true);
                }

                if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
                    this.nearInteractable.onInteract?.();
                }
            } else {
                if (this.interactText) {
                    this.interactText.setVisible(false);
                }
            }
        } else {
            if (this.interactText) {
                this.interactText.setVisible(false);
            }
        }
    }
    nextDialogue() {
        this.currentIndex++;

        if (this.currentIndex < this.dialogues.length) {
            this.text.setText(this.dialogues[this.currentIndex]);
        } else {
            this.box.destroy();
            this.text.destroy();
            this.hint.destroy();
            this.canMove = true;

            if (this.objectiveText) {
                this.objectiveText.setVisible(true).setAlpha(0);

                this.tweens.add({
                    targets: this.objectiveText,
                    alpha: 1,
                    duration: 800
                });
            }
        }
    }
    updateObjective() {
        if (!this.objectiveText) return;

        this.objectiveText.setText(
            `Collect the journal entries: ${this.journalsCollected}/${this.totalJournals}`
        );
    }
}