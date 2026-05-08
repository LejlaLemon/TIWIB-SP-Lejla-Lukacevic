import * as Phaser from 'phaser';
import { loadSlot, deleteSlot, saveSlot } from "../database/saveSystem.js";

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('LoadScene');
    }

    init(data) {
        this.fromPause = data?.fromPause || false;
        this.mode = data?.mode || null;
        this.newSave = data?.newSave || null;
    }

    create() {
        const centerX = this.cameras.main.width / 2;

        this.add.text(20, 20, 'Press ESC to go back to the main menu', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0, 0);

        this.add.text(centerX, 80, "Select Save Slot", {
            fontSize: '40px',
            color: '#00ff00'
        }).setOrigin(0.5);

        for (let i = 1; i <= 3; i++) {
            this.createSlot(centerX, 180 + i * 120, i);
        }

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop('LoadScene');

            if (this.fromPause) {
                this.scene.resume('LabScene');
            } else {
                this.scene.start('Start');
            }
        });
    }

    async createSlot(x, y, slot) {

        const box = this.add.rectangle(x, y, 320, 80, 0x111111)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(x, y, "Loading...", {
            fontSize: '22px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const deleteBtn = this.add.text(x + 230, y, "Delete", {
            fontSize: '20px',
            color: '#ff5555'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const saveData = await loadSlot(slot);

        //empty slot
        if (!saveData) {

            label.setText(`Slot ${slot} - EMPTY`);

          
            deleteBtn.setVisible(false);
            deleteBtn.disableInteractive();

            box.on('pointerdown', async () => {

                if (this.mode === 'newGame' && this.newSave) {

                    this.registry.set('activeSlot', slot);

                    const saveToStore = {
                        ...this.newSave,
                        level: 1
                    };

                    await saveSlot(slot, saveToStore);

                    this.scene.start('LabScene', {
                        saveData: saveToStore
                    });

                    return;
                }

                this.showMessage("No Save File");
            });

            return;
        }

       //filled slot
        label.setText(`Slot ${slot} - Level ${saveData.level}`);

        
        deleteBtn.setVisible(true);
        deleteBtn.setInteractive();

        box.on('pointerdown', () => {
            this.handleLoad(saveData, slot);
        });

        deleteBtn.on('pointerdown', async (pointer, localX, localY, event) => {

            if (event) event.stopPropagation();

            await deleteSlot(slot);

            this.scene.restart();
        });
    }

    handleLoad(save, slot) {

        this.registry.set('saveData', save);
        this.registry.set('activeSlot', slot);

        if (this.fromPause) {

            const lab = this.scene.get('LabScene');

            if (lab) {

                if (save.position && lab.player) {
                    lab.player.setPosition(save.position.x, save.position.y);
                }

                lab.isPaused = false;
                lab.canMove = true;
                lab.isLoadingSave = true;

                lab.physics.resume();
                lab.closePauseMenu?.();

                if (lab.input?.keyboard) {
                    lab.input.keyboard.enabled = true;
                    lab.input.keyboard.resetKeys();
                }
            }

            this.scene.stop('LoadScene');
            this.scene.resume('LabScene');

            return;
        }

        this.scene.start('LabScene', {
            saveData: save
        });
    }

    showMessage(msg) {
        const text = this.add.text(
            this.cameras.main.width / 2,
            600,
            msg,
            {
                fontSize: '24px',
                color: '#ff0000'
            }
        ).setOrigin(0.5);

        this.time.delayedCall(2000, () => text.destroy());
    }
}