import { Start } from './scenes/Start.js';
import {GameScene}from './scenes/GameScene.js';
import {ExtrasScene}from './scenes/ExtrasScene.js';
import { LabScene } from './scenes/LabScene.js';


const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start,GameScene,ExtrasScene,LabScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            