class Before extends Phaser.scene {
    constructor() {
        super('Before');
        this.my = { sprite: {} };
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("Image", "demo.png");
        this.load.audio("music", "theme.ogg");
    }

    create() {
        if (!this.sound.get("music")) {
            this.music = this.sound.add("music", {
                loop: true,
                volume: 0.25
            });
            this.music.play({ seek: 53 });
        }
        let my = this.my;
        my.sprite.background = this.add.sprite(0, 0, "Image").setOrigin(0);
        my.sprite.background.setScale(0.55);
        this.add.text(100, 350, "Gallery Shooter", {fontSize: '48px', fill: '#000'});
        this.add.text(130, 420, "Press SPACE to Start", {fontSize: '32px', fill: '#000'});

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (this.spaceKey.isDown) {
            this.scene.start('Start');
        }
    }
}
