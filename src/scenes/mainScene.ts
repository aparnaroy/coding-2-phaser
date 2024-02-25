import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars?: Phaser.Physics.Arcade.Group;

    private score: number = 0;
    private scoreText?: Phaser.GameObjects.Text;

    private bombs?: Phaser.Physics.Arcade.Group;

    private gameOver = false;

    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        this.add.image(400, 300, "sky");

        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(
            400,
            568,
            "ground"
        ) as Phaser.Physics.Arcade.Sprite;
        ground.setScale(2).refreshBody();

        this.platforms.create(600, 400, "ground");
        this.platforms.create(50, 250, "ground");
        this.platforms.create(750, 220, "ground");

        this.player = this.physics.add.sprite(100, 450, "dude");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Specify spritesheet frames for the dude walking left, right, and turning
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Specify that the dude should collide with / be on the ground/platform
        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard?.createCursorKeys();

        // Add stars to scene
        this.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
        });

        this.stars.children.iterate((c) => {
            const child = c as Phaser.Physics.Arcade.Image;
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
        });

        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(
            this.player,
            this.stars,
            this.handleCollectStar,
            undefined,
            this
        );

        // Add scoring
        this.scoreText = this.add.text(16, 16, "score: 0", {
            fontSize: "32px",
            color: "#000",
        });

        // Add bombs
        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(
            this.player,
            this.bombs,
            this.handleHitBomb,
            undefined,
            this
        );
    }

    private handleHitBomb() {
        this.physics.pause();
        this.player?.setTint(0xff0000);
        this.player?.anims.play("turn");
        this.gameOver = true;
    }

    private handleCollectStar(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        star:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        // Make stars disappear when the player touches them
        const s = star as Phaser.Physics.Arcade.Image;
        s.disableBody(true, true);

        // Update score when stars are collected
        this.score += 10;
        this.scoreText?.setText(`Score: ${this.score}`);

        // If all the stars are collected, drop a bomb on the other side of the screen of the dude
        if (this.stars?.countActive(true) === 0) {
            this.stars.children.iterate((c) => {
                const child = c as Phaser.Physics.Arcade.Image;
                child.enableBody(true, child.x, 0, true, true);
                return true;
            });

            if (this.player) {
                const x =
                    this.player.x < 400
                        ? Phaser.Math.Between(400, 800)
                        : Phaser.Math.Between(0, 400);

                const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(
                    x,
                    16,
                    "bomb"
                );
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        }
    }

    update() {
        // If left key is pressed, start dude's left animation, ignore if playing is already true so we don't restart the animation
        if (this.cursors?.left.isDown) {
            this.player?.setVelocityX(-160);
            this.player?.anims.play("left", true);
        } else if (this.cursors?.right.isDown) {
            this.player?.setVelocityX(160);
            this.player?.anims.play("right", true);
        } else {
            this.player?.setVelocityX(0);
            this.player?.anims.play("turn");
        }

        // If up key pressed and dude is on ground, make dude jump
        if (this.cursors?.up.isDown && this.player?.body?.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
}
