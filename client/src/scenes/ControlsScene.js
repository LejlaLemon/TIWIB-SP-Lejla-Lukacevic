import * as Phaser from 'phaser';

export class ControlsScene extends Phaser.Scene {
    constructor() {
        super('ControlsScene');
    }

    create() {
        const { width, height } = this.scale;

        // background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

        // title
        this.add.text(width / 2, 100, "CONTROLS", {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        // instructions
        const controlsText = [
            "Use WASD to move your character",
            "Use Left Mouse Button or E to interact",
            "Press ENTER to advance dialogues"
        ];

        this.add.text(width / 2, height / 2, controlsText.join("\n\n"), {
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // back button
        const backBtn = this.add.text(width / 2, height - 120, "Back", {
            fontSize: '32px',
            color: '#00ff00'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#00aa00'));
        backBtn.on('pointerout', () => backBtn.setColor('#00ff00'));

        backBtn.on('pointerdown', () => {
            this.scene.stop(); // close controls
            this.scene.stop('ControlsScene');
            this.scene.resume('LabScene'); // go back to pause menu state
        });
    }
}