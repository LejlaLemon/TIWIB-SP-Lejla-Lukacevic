import * as Phaser from 'phaser';
import { saveSlot } from "../database/saveSystem.js";

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.audio('menuMusic', '/audio/Whoosh.mp3');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const centerX = this.cameras.main.width / 2;
        //this is for the slots
        let nextSlot = this.registry.get('nextSlot') || 1;
        //fixed music
        let music = this.sound.get('menuMusic');

        if (!music) {
            music = this.sound.add('menuMusic', {
                loop: true,
                volume: 0.5
            });

            this.input.once('pointerdown', async () => {
                await this.sound.context.resume();

                if (!music.isPlaying) {
                    music.play();
                }
            });
        }

        //crt effects
        const scanlines = this.add.graphics();
        scanlines.fillStyle(0x000000, 0.08);

        for (let y = 0; y < 720; y += 3) {
            scanlines.fillRect(0, y, 1280, 1);
        }
        scanlines.setDepth(1000);

        //tittle
        this.add.text(centerX, 150, 'This Is Where It Begins', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00ff00'
        };

        const createButton = (y, label, action) => {
            const btn = this.add.text(centerX, y, label, buttonStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#00aa00'));
            btn.on('pointerout', () => btn.setColor('#00ff00'));
            btn.on('pointerdown', action);
        };


        createButton(360, 'Load Game', () => {
            this.scene.start('LoadScene', {
                fromPause: false,
                mode: 'load'
            });
        });
        createButton(300, 'New Game', async () => {

            const newSave = {
                level: 1,
                createdAt: Date.now()
            };
        
            const slotToUse = this.registry.get('nextSlot') || 1;
        
            // save into current slot
            await saveSlot(slotToUse, newSave);
        
            // update next slot (cycle 1 → 2 → 3)
            let next = slotToUse + 1;
            if (next > 3) next = 1;
        
            this.registry.set('nextSlot', next);
            this.registry.set('activeSlot', slotToUse);
        
            this.sound.stopByKey('menuMusic');
        
            this.scene.start('LabScene', {
                saveData: newSave
            });
        });

        //extras
        createButton(420, 'Extras', () => {
            this.scene.start('ExtrasScene');
        });

        //exit
        createButton(480, 'Exit', () => {
            this.add.text(centerX, 600, 'Close the tab to exit', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5);
        });
    }
}