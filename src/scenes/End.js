class End extends Phaser.Scene {
    constructor() {
        super('End');
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    preload() {}

    create() {
        this.add.text(160, 250, "GAME OVER", {fontSize: '48px', fill: '#fff'});
        this.add.text(130, 320, `Final Score: ${this.finalScore}`, {fontSize: '32px', fill: '#fff'});
        this.add.text(100, 400, "Press SPACE to Return to Start", {fontSize: '24px', fill: '#fff'});

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (this.spaceKey.isDown) {
            this.scene.start('Before');
        }
    }
}