/**********************************************************************
 * player.js
 * Player (ship) to be used within 2D sidescrolling shooter
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************************/
ig.module(
    'game.entities.player'
)
    .requires(
        'impact.entity',
        'game.entities.bullet',
        'game.entities.particle',
        'game.entities.BaseWeapon',
        'game.entities.grenade',
        'game.entities.base-actor',
        'game.entities.explosiveBomb',
        'plugins.timeslower',
        'bootstrap.entities.particle-emitter',
        'game.entities.EnemySpawner'
)
    .defines(function () {
        EntityPlayer = EntityBaseActor.extend(
            {
                /******************************************8
                 * Property Definitions
                 ******************************************/
                animSheet: new ig.AnimationSheet('media/ship_sheet_flame1.png', 64, 32),
                statMatte: new ig.Image('media/stat-matte.png'),
                size: { x: 5, y: 5 },
                offset: { x: +43, y: +13 },
                maxVel: { x: 350, y: 200 },
                friction: { x: 300, y: 300 },
                speed: 200,
                bloodColorOffset: 1,
                name: 'player',
                health: 1,
                _wmScalable: true,
                _wmIgnore: false,

                /* Weapons */
                totalWeapons: 4,
                activeWeapon: "EntityBullet",
                fireDelay: null,
                bSlowTime: false,
                equiopedWeapn: null,

                /* Collision */
                type: ig.Entity.TYPE.A,
                checkAgainst: ig.Entity.TYPE.B,
                collides: ig.Entity.COLLIDES.PASSIVE,

                /* Respawning */
                invincible: true,
                invincibleTimer: null,
                invincibleDelay: 2,

                // SFX
                SlowMo01_sfx: new ig.Sound('media/SFX/SlowMo01.ogg'),
                SlowMo01_sfx: new ig.Sound('media/SFX/SlowMo01.mp3'),
                SlowMo01_sfx: new ig.Sound('media/SFX/SlowMo01.*'),

                Grenade02_sfx: new ig.Sound('media/SFX/Grenade02.ogg'),
                Grenade02_sfx: new ig.Sound('media/SFX/Grenade02.mp3'),
                Grenade02_sfx: new ig.Sound('media/SFX/Grenade02.*'),



                /******************************************8
                 * Initialization
                 * Sets up anim sequences
                 ******************************************/
                init: function (x, y, settings) {
                    this.parent(x, y, settings);
                    // Add animations
                    this.addAnim('idle', 1, [2]);
                    this.addAnim('speedBurst', 0.3, [7, 12]);
                    this.addAnim('bankLeft', 0.3, [6, 11]);
                    this.addAnim('bankRight', 0.3, [9, 14]);
                    this.addAnim('moveBack', 0.1, [6]);

                    // Used for constant fire
                    this.lastShootTimer = new ig.Timer(0);

                    // Creates a new slow timer for slowMo
                    this.myTimeSlower = new TimeSlower();

                    // Respawning
                    this.invincibleTimer = new ig.Timer();
                    this.makeInvincible();
                    this.respawnTimer = new ig.Timer();

                    this.currentWeapLevel = 1;

                    // Sets globally accessible player
                    ig.game.player = this;

                    // Not in WM?
                    if (!ig.global.wm) {
                        // Attaches enemy spawner to player
                        this.EnemySpawnerInst = ig.game.spawnEntity(EntityEnemySpawner, this.pos.x + 300, this.pos.y + 20);
                        this.Respawn_sfx.play();
                    }
                },

                /******************************************8
                 * Update - handles input, weapons, anims
                 ******************************************/
                update: function () {
                    var idleSpeed = 120;
                    var fastSpeed = 150;
                    var backSpeed = 80;

                    /*======================================
                     Weapons
                     ======================================*/
                    // Shooting
                    var isShooting = ig.input.state('shoot');
                    if (isShooting && this.lastShootTimer.delta() > 0) {

                        switch (this.activeWeapon) {
                            case ("EntityBullet"):
                                this.equipedWeap = ig.game.getEntityByName('bullet');
                                this.lastShootTimer.set(this.equipedWeap.fireRateWeak);
                                ig.game.bulletGen.useBullet(EntityBullet, this, null, +10, +2);
                                this.hit01_sfx.play();
                                break;
                            case ("EntityGrenade"):
                                equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x + 5, this.pos.y + 6);
                                this.lastShootTimer.set(equipedWeap.fireRateWeak);
                                this.Grenade02_sfx.play();
                                break;
                            case ("EntityExplosiveBomb"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x + 5, this.pos.y + 5);
                                this.lastShootTimer.set(equipedWeap.fireRateWeak);
                                break;
                        }
                    }


                    /*======================================
                     Allows player to hold shoot button for constant fire
                     =====================================*/
                    if (isShooting && !this.wasShooting) {
                        this.wasShooting = true;

                    }
                    else if (this.wasShooting && !isShooting) {
                        this.wasShooting = false;
                    }

                    if (ig.input.pressed('slowTime')) {
                        this.slowTime();
                        isSlowed = true;
                    }
                    else {
                        elseSlowed = false;
                    }

                    /*======================================
                     Toggles debug text
                    =======================================*/
                    if (ig.input.pressed('debugToggle')) {
                        ig.game.debugToggle = !ig.game.debugToggle;
                    }

                    /*======================================
                     Spawning companion moving ships 
                    ======================================*/
                    if (EntityMiniShip.prototype.currentShips < EntityMiniShip.prototype.maxShips) {
                        if (ig.input.pressed('spawnMiniShip')) {
                            ig.game.spawnEntity(EntityMiniShip, this.pos.x + 6, this.pos.y - 9);
                            console.log('spawning mini ship');
                        }
                    }

                    /*======================================
                     Character control inputs and speeds
                    =======================================*/
                    if (ig.input.state('upArrow')) {
                        this.vel.y = -idleSpeed;
                        this.accel.x = this.speed;
                        this.currentAnim = this.anims.bankLeft;
                    }
                    else if (ig.input.state('downArrow')) {
                        this.vel.y = idleSpeed;
                        this.accel.x = this.speed;
                        this.currentAnim = this.anims.bankRight;
                    }
                    if (ig.input.state('leftArrow')) {
                        this.vel.x = backSpeed;
                    }
                    else if (ig.input.state('rightArrow')) {
                        this.vel.x = fastSpeed;
                    }
                    else {
                        this.vel.x = idleSpeed;
                        this.currentAnim = this.anims.idle;
                    }

                    /*======================================
                     set the current animation, based on the player's speed
                     =====================================*/
                    //upArrow
                    if (this.vel.y < 0) {
                        this.currentAnim = this.anims.bankLeft;
                        //downArrow
                    } else if (this.vel.y > 20) {
                        this.currentAnim = this.anims.bankRight;
                    } else if (this.vel.y = 0) {
                        this.currentAnim = this.anims.idle;
                    }
                    else if (this.vel.x > idleSpeed) {
                        //rightArrow
                        this.currentAnim = this.anims.speedBurst;
                    } else if (this.vel.x > idleSpeed) {
                        //leftArrow
                        this.currentAnim = this.anims.moveBack;
                    } else {
                        this.currentAnim = this.anims.idle;
                    }

                    /*======================================
                     Weapon inventory
                     =====================================*/
                    if (ig.input.pressed('switch')) {
                        this.weapon++;
                        if (this.weapon >= this.totalWeapons)
                            this.weapon = 0;
                        switch (this.weapon) {
                            case (0):
                                this.activeWeapon = "EntityBullet";
                                break;
                            case (1):
                                this.activeWeapon = "EntityGrenade";
                                break;
                            case (2):
                                this.activeWeapon = "EntityExplosiveBomb";
                                break;
                        }
                    }

                    // Updates slow-mo ability
                    this.myTimeSlower.update();

                    // Timer for respawn 
                    if (this.invincibleTimer.delta() > this.invincibleDelay) {
                        this.invincible = false;
                        this.currentAnim.alpha - 1;
                    }

                    // Movement
                    this.parent();
                },

                /******************************************8
                 * Draw
                 ******************************************/
                draw: function () {
                    if (this.invincible) {
                        this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
                    }
                    this.parent();
                    //  myTimeSlower.draw(); // Not sure if I want to draw an overlay
                },

                /******************************************8
                 * Kills player, spawns particles, respawns
                 ******************************************/
                kill: function () {
                    // Get MiniShip
                    var miniShip = ig.game.getEntitiesByType(EntityMiniShip)[0];

                    //for (var i = 0; i < miniShip.length; i++){
                    //    miniShip[i].kill();
                    //    console.log('killing ships!');
                    //  //  console.log('Miniship:' + miniShip);
                    //}
                    //   console.log(miniShip[0]);           

                    ig.game.playerPosAtDeath = this.pos; // save the player position
                    this.spawnParticles(1);
                    this.parent();
                    this.onDeath();
                },

                /******************************************8
                * onDeath
                * Checks to see if lives has expired, and if 
                * so, calls StaffRollScreen.
               ******************************************/
                onDeath: function () {
                    ig.game.stats.deaths++;
                    ig.game.stats.lives--;
                    console.log(ig.game.stats.lives);
                    if (ig.game.stats.lives < 1) {

                        // TODO: Add screen fade so that transition is not so abrupt
                        ig.game.gameOver();
                    } else {
                        ig.game.spawnEntity(EntityPlayer, ig.game.playerPosAtDeath.x - 300, ig.game.playerPosAtDeath.y);
                    }
                },

                /******************************************8
                 * slowTime 
                 * Time to slow down, slow down scale, stay for (x)
                 * to 0.2 timescale, stay at 0.2 timescale for 3 seconds,
                 * return to timescale 1 gradually over (x) seconds.
                 ******************************************/
                slowTime: function () {
                    if (EntityPickupBulletTime.prototype.currentBulletTime <= EntityPickupBulletTime.prototype.maxBulletTime) {
                        this.myTimeSlower.alterTimeScale(0.4, 1, 3, 1);
                        this.SlowMo01_sfx.play();
                        EntityPickupBulletTime.prototype.currentBulletTime--;
                    }
                },

                /******************************************8
                 * makeInvincible 
                 ******************************************/
                makeInvincible: function () {
                    this.invincible = true;
                    this.invincibleTimer.reset();
                },

                /******************************************8
                 * receiveDamage
                 ******************************************/
                receiveDamage: function (amount, from) {
                    if (this.invincible) {
                        return;
                    }
                    this.parent(amount, from);
                },
            });
    });