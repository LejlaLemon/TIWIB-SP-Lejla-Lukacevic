import * as Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const save = this.registry.get('saveData');
        if (save) {
            this.add.text(100, 100, `LOADED LEVEL: ${save.level}`, {
                fontSize: '32px',
                color: '#00ff00'
            });
        } else {
            this.add.text(100, 100, 'NEW GAME STARTED', {
                fontSize: '32px',
                color: '#00ff00'
            });
        }

        // ESC back to menu
        //will change this until I put a pause menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('Start');
        });
    }
}