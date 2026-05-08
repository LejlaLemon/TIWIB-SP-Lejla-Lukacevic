import * as Phaser from "phaser";
import { Start } from "./scenes/Start";
import { GameScene } from "./scenes/GameScene";
import { ExtrasScene } from "./scenes/ExtrasScene";
import { LabScene } from "./scenes/LabScene";
import { LoadScene } from "./scenes/LoadScene";
import { SaveScene } from './scenes/SaveScene';
import {ControlsScene} from './scenes/ControlsScene';

export const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    pixelArt: false,

    // ✅ ADD THIS BLOCK
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    scene: [Start, GameScene, LoadScene, ExtrasScene, LabScene,SaveScene,ControlsScene],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};