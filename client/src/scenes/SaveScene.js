import * as Phaser from 'phaser';
import { loadSlot, deleteSlot, saveSlot } from "../database/saveSystem.js";

export class SaveScene extends Phaser.Scene {
    constructor() {
        super('SaveScene');
    }

    init(data) {
        this.saveData = data?.saveData || null;
        this.fromPause = data?.fromPause || false;
    }

    create() {
        const centerX = this.cameras.main.width / 2;

        this.add.text(centerX, 80, "Select Slot to Save", {
            fontSize: '40px',
            color: '#00ff00'
        }).setOrigin(0.5);

        for (let i = 1; i <= 3; i++) {
            this.createSlot(centerX, 180 + i * 120, i);
        }
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

        const existingSave = await loadSlot(slot);

        if (!existingSave) {
            label.setText(`Slot ${slot} - EMPTY`);
            deleteBtn.setVisible(false);
        } else {
            label.setText(`Slot ${slot} - Level ${existingSave.level}`);
        }

        
        box.on('pointerdown', async () => {
            if (!this.saveData) {
                this.showMessage("Nothing to Save");
                return;
            }

            
            this.registry.set('activeSlot', slot);

            const dataToSave = {
                ...this.saveData,
                slot: slot
            };

            await saveSlot(slot, dataToSave);

            this.showMessage(`Saved to Slot ${slot}`);

            this.time.delayedCall(1000, () => {
                if (this.fromPause) {
                    const lab = this.scene.get('LabScene');

                    if (lab) {
                        lab.closePauseMenu?.();
                        lab.isPaused = false;
                        lab.canMove = true;
                        lab.isJournalModalOpen = false;

                        // Restore gameplay systems when returning from pause-save flow.
                        lab.physics?.resume();
                        if (lab.input?.keyboard) {
                            lab.input.keyboard.enabled = true;
                            lab.input.keyboard.resetKeys();
                        }
                    }

                    this.scene.stop();
                    this.scene.resume('LabScene');
                } else {
                    this.scene.start('Start');
                }
            });
        });

        deleteBtn.on('pointerdown', async (event) => {
            event.stopPropagation();
            await deleteSlot(slot);
            this.scene.restart();
        });
    }

    showMessage(msg) {
        const text = this.add.text(
            this.cameras.main.width / 2,
            600,
            msg,
            { fontSize: '24px', color: '#ff0000' }
        ).setOrigin(0.5);

        this.time.delayedCall(2000, () => text.destroy());
    }
}