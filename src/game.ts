import Phaser from "phaser";
import { CONFIG } from "./config";

window.addEventListener("load", () => {
    const game = new Phaser.Game(CONFIG);
    console.info("Started main game:", game);
});
