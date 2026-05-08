import * as Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    init(data) {
        this.gameState = data?.gameState || null;
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

       //overlay
        this.add.rectangle(centerX, centerY, 600, 400, 0x000000, 0.7);

        this.add.text(centerX, centerY - 120, "PAUSED", {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        //resume
        const resumeBtn = this.add.text(centerX, centerY - 40, "Resume", {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        resumeBtn.on('pointerdown', () => {
            this.closePause();
        });

        //save
        const saveBtn = this.add.text(centerX, centerY + 40, "Save Game", {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#006600',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        saveBtn.on('pointerdown', () => {
            this.scene.launch('SaveScene', {
                saveData: this.gameState,
                fromPause: true
            });

            this.scene.pause('LabScene');
        });
        const controlsBtn = this.add.text(centerX, centerY + 120, "Controls", {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#003366',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        //controls
        controlsBtn.on('pointerover', () => controlsBtn.setColor('#00ccff'));
        controlsBtn.on('pointerout', () => controlsBtn.setColor('#ffffff'));

        controlsBtn.on('pointerdown', () => {
            this.scene.launch('ControlsScene');
            this.scene.pause('PauseScene'); // pause this menu while viewing controls
        });
    }

    closePause() {
        this.scene.stop();// close PauseScene
        this.scene.resume('LabScene'); // resume gameplay
    }
}