class Start extends Phaser.scene {

    constructor() {
        super('Start');
        this.my = {sprite: {}};

        this.playerX = 320;
        this.playerY = 600;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("OceanBeach", "tiles_sheet.png");
        this.load.tilemapTiledJSON("map", "OceanBeach.json");
        this.load.image("Player", "dinghyLarge1.png");
        this.load.image("Cannon", "cannon.png");
        this.load.image("bullet", "cannonBall.png");
        this.load.image("Enemy", "enemy.png");
        this.load.image("Enemy2", "enemy2.png");
        this.load.image("Enemy3", "enemy3.png");
        this.load.image("Enemy4", "enemy4.png");
        this.load.image("Enemy5", "enemy5.png");
        this.load.image("Boss", "boss.png");

        this.load.image("splode1", "explosion3.png");
        this.load.image("splode2", "explosion2.png");
        this.load.image("splode3", "explosion1.png");

        this.load.audio("fire", "firenoise.ogg");
        this.load.audio("death", "enemydeath.ogg");
    }

    create() {
        let my = this.my;

        this.map = this.add.tilemap("map", 64, 64, 10, 15);

        this.tileset = this.map.addTilesetImage("OceanWorld", "OceanBeach");

        this.waterLayer = this.map.createLayer("OceanWater", this.tileset, 0, 0);
        this.beachLayer = this.map.createLayer("BeachSand", this.tileset, 0, 0);
        this.rockLayer = this.map.createLayer("RockStuff", this.tileset, 0, 0);

        this.anims.create({
            key: "splode",
            frames: [
                { key: "splode1" },
                { key: "splode2" },
                { key: "splode3" },
            ],
            frameRate: 20,
            repeat: 1,
            hideOnComplete: true
        });

        this.enemies = this.add.group();
        this.bullets = this.add.group();
        this.enemybullets = this.add.group();
        this.enemydirection = 1;
        this.enemyspeed = 0.25;
        this.bossDirection = 1;
        this.bossSpeed = 1;

        this.lastFired = 0;

        this.myScore = 0;
        
        this.currentWave = 1;
        this.enemyHealth = 1;
        this.waveInProgress = false;
        this.boss = null;

        this.my.text = {};
        this.my.text.score = this.add.text(40, 675, "Score: 0", {
            fontSize: "32px",
            fill: "#000000"
        });

        this.myLives = 3;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.my.text.lives = this.add.text(450, 675, "Lives: 3", {
            fontSize: "32px",
            fill: "#000000"
        });

        this.my.text.wave = this.add.text(240, 10, "Wave: 1", {
            fontSize: "32px",
            fill: "#000000"
        });

        this.spawnEnemies();
        
        my.sprite.player = this.add.sprite(this.playerX, this.playerY, "Player");
        my.sprite.player.angle = 90;
        my.sprite.player.setScale(1.5);
        my.sprite.cannon = this.add.sprite(this.playerX, this.playerY, "Cannon");
        my.sprite.cannon.angle = -90;

        this.time.addEvent({
            delay: 500,
            callback: () => {
                let enemies = this.enemies.getChildren().filter(e => e.active);
                if (enemies.length > 0) {
                    let shooter = Phaser.Utils.Array.GetRandom(enemies);
                    const now = this.time.now;
                    if (now - shooter.lastFired > 1000) {
                        let bullet = this.add.sprite(shooter.x, shooter.y + 20, "bullet");
                        bullet.setAngle(270);
                        this.enemybullets.add(bullet);
                        shooter.lastFired = now;
                    }
                }
            },
            loop: true
        });

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.boss && this.boss.active) {
                    this.bossShoot();
                }
            },
            loop: true
        });

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        

    }

    update() {
        let my = this.my;

        if (this.leftKey.isDown) {
            for (let part in my.sprite) {
                my.sprite.player.x -= 1.75;
            }
        } else if (this.rightKey.isDown) {
            for (let part in my.sprite) {
                my.sprite.player.x += 1.75;
            }
        }

        my.sprite.player.x = Phaser.Math.Clamp(my.sprite.player.x, 100, 540);

        my.sprite.cannon.x = my.sprite.player.x;
        my.sprite.cannon.y = my.sprite.player.y - 5; 

        const now = this.time.now;
        if (this.spaceKey.isDown && now - this.lastFired > 250 && !this.invincible) {
            this.lastFired = now;
            this.sound.play("fire", {
                volume: 0.25
            });
            let bullet = this.add.sprite(my.sprite.cannon.x, my.sprite.cannon.y - 10, "bullet");
            bullet.angle = 90;
            this.bullets.add(bullet);
        }


        this.enemies.getChildren().forEach(enemy => {
            enemy.x += this.enemydirection * this.enemyspeed;
        });

        if (this.boss && this.boss.active) {
            this.boss.x += this.bossDirection * this.bossSpeed;
        
            if (this.boss.x <= 100 || this.boss.x >= 540) {
                this.bossDirection *= -1;
            }
        }

        let reverse = false;
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.x <= 100 || enemy.x >= 540) {
                reverse = true;
            }
        });

        if (reverse) {
            this.enemydirection *= -1;
        }

        this.bullets.getChildren().forEach((bullet) => {
            this.enemies.getChildren().forEach((enemy) => {
                if (this.collides(enemy, bullet) && enemy.visible) {
                    bullet.destroy();
                    enemy.health -= 1;
                    this.sound.play("death", {
                        volume: 0.25
                    });
                    if (enemy.health <= 0) {
                        this.splode = this.add.sprite(enemy.x, enemy.y, "splode1").setScale(0.5).play("splode");
                        enemy.destroy();
                        this.sound.play("death", {
                            volume: 0.25
                        });
                        this.myScore += 100;
                        this.updateScore();
                    }
                }
            });
            bullet.y -= 5
            if (bullet.y < 0) {
                bullet.destroy();
            }

            if (this.boss && this.boss.active && this.collides(this.boss, bullet)) {
                bullet.destroy();
                this.boss.health -= 1;
                this.sound.play("death", { volume: 0.25 });
                if (this.boss.health <= 0) {
                    this.splode = this.add.sprite(this.boss.x, this.boss.y, "splode1").setScale(0.75).play("splode");
                    this.boss.destroy();
                    this.sound.play("death", { volume: 0.25 });
                    this.myScore += 500;
                    this.updateScore();
                }
            }
        });

        this.enemybullets.getChildren().forEach((bullet) => {
            if (bullet.vx !== undefined && bullet.vy !== undefined) {
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;
            } else {
                bullet.y += 3;
            }
            if (bullet.y > 720) {
                bullet.destroy();
            }

            if (!this.invincible && this.collides(my.sprite.player, bullet) && bullet.visible) {
                bullet.destroy();
                this.sound.play("death", {
                    volume: 0.25
                });
                this.myLives -= 1;
                this.updateLives();
                this.invincible = true;
                this.invincibleTimer = this.time.now + 3000;
            }
        });
        if (this.invincible && this.time.now > this.invincibleTimer) {
            this.invincible = false;
        }

        if (this.myLives <= 0) {
            this.scene.start('End', { score: this.myScore });
        }

        if (this.invincible) {
            if (this.time.now < this.invincibleTimer) {
                if ((this.time.now % 250) < 125) {
                    my.sprite.player.setAlpha(0.2);
                    my.sprite.cannon.setAlpha(0.2);
                } else {
                    my.sprite.player.setAlpha(1);
                    my.sprite.cannon.setAlpha(1);
                }
            } else {
                this.invincible = false;
                my.sprite.player.setAlpha(1);
                my.sprite.cannon.setAlpha(1);
            }
        }  else {
            my.sprite.player.setAlpha(1);
            my.sprite.cannon.setAlpha(1);
        }
        
        if (this.enemies.countActive() === 0 && !this.waveInProgress) {
            this.waveInProgress = true;
        
            this.time.delayedCall(2000, () => {
                this.currentWave++;
                if (this.currentWave % 3 === 1) {
                    this.enemyHealth++;
                }
                this.enemies.clear(true, true);
                if (this.currentWave % 3 === 0) {
                    this.boss = this.add.sprite(320, 100, "Boss");
                    this.boss.angle = 90;
                    this.boss.setScale(1.25);
                    this.boss.health = this.enemyHealth * 5;
                    this.boss.lastFired = 0;
                }
                this.updateWave();
                this.spawnEnemies();
                this.waveInProgress = false;
            });
        }
    }

    spawnEnemies() {
        const enemyRows = 2;
        const enemiesPerRow = 6;
        const spacingX = 80;
        const spacingY = 100;
        const startX = 125;
        const startY = 175;
    
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemiesPerRow; col++) {
                let enemysprite = "Enemy";
                let enemy = this.add.sprite(startX + col * spacingX, startY + row * spacingY, enemysprite);
                enemy.setScale(0.65);
                enemy.health = this.enemyHealth;
                enemy.lastFired = 0;
                if (enemy.health === 2) {
                    enemy.setTexture("Enemy2");
                } else if (enemy.health === 3) {
                    enemy.setTexture("Enemy3")
                } else if (enemy.health === 4) {
                    enemy.setTexture("Enemy4")
                } else if (enemy.health === 5) {
                    enemy.setTexture("Enemy5")
                }
                this.enemies.add(enemy);
            }
        }
    }
    bossShoot() {
        const mode = Phaser.Math.Between(0, 1) === 0 ? "targeted" : "spread";
    
        if (mode === "spread") {
            const angles = [-30, 0, 30];
            for (let angle of angles) {
                let rad = Phaser.Math.DegToRad(angle);
                let bullet = this.add.sprite(this.boss.x, this.boss.y + 20, "bullet");
                bullet.rotation = rad;
                bullet.vx = Math.sin(rad) * 3;
                bullet.vy = Math.cos(rad) * 3;
                this.enemybullets.add(bullet);
            }
        } else if (mode === "targeted") {
            const player = this.my.sprite.player;
            for (let i = 0; i < 3; i++) {
                this.time.delayedCall(i * 200, () => {
                    if (!this.boss.active) return;
                    const dx = player.x - this.boss.x;
                    const dy = player.y - this.boss.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const vx = (dx / len) * 3;
                    const vy = (dy / len) * 3;
                    let bullet = this.add.sprite(this.boss.x, this.boss.y + 20, "bullet");
                    bullet.vx = vx;
                    bullet.vy = vy;
                    this.enemybullets.add(bullet);
                });
            }
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
    
    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.myScore);
    }

    updateLives() {
        this.my.text.lives.setText("Lives: " + this.myLives);
    }

    updateWave() {
        this.my.text.wave.setText("Wave: " + this.currentWave);
    }
}
