import * as Phaser from 'phaser';

export class ExtrasScene extends Phaser.Scene {
    constructor() {
        super('ExtrasScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const centerX = this.cameras.main.width / 2;

        // Title
        this.add.text(centerX, 120, 'EXTRAS', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        // Content display
        this.contentText = this.add.text(centerX, 420, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#00ff00',
            align: 'center',
            wordWrap: { width: 700 },
            lineSpacing: 10
        }).setOrigin(0.5);

        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00ff00'
        };

        // Button creator (same as main menu)
        const createButton = (y, label, action) => {
            const btn = this.add.text(centerX, y, label, buttonStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#00aa00'));
            btn.on('pointerout', () => btn.setColor('#00ff00'));
            btn.on('pointerdown', action);
        };

        // Buttons
        createButton(200, 'Description', () => {
            this.contentText.setText(
                'You are playing as an unknown person, discovering lots of secrets.\nStuck in this house.\nyou have one task.\nfollow them'
            );
        });

        createButton(260, 'Developer Notes', () => {
            this.contentText.setText(
                'Built using Phaser.\nAssets: using GameMaker Studio 2\nfrontend: React and Vite \nbackend: Node.js with Express\nDataBase: FireBase'
            );
        });

        createButton(320, 'Credits', () => {
            this.contentText.setText(
                'Made By Lejla Lukacevic\nEngine: Phaser\n'
            );
        });

        // Go Back button
        createButton(550, 'Go Back', () => {
            this.scene.start('Start');
        });

        // ESC key also returns
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('Start');
        });
    }
}