import { useEffect } from "react";
import * as Phaser from "phaser";
import { config } from "./phaserConfig";

export default function Game() {
    useEffect(() => {
        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true); // cleanup when React unmounts
        };
    }, []);

    return <div id="game-container"></div>;
}