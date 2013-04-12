/*********************************************************8
 * EnemyBullet01.js & EnemyGun01.js
 * Creates bullet patterns for enemies, along with a bullet manager 
 * Basis of this was found at: http://phoboslab.org/xtype/xtype.js
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/

ig.module(
    'game.entities.EnemyBullet01'
)
    .requires(
        'game.entities.BaseWeapon'

)
    .defines(function () {
        /******************************************8
        * Enemy Bullet 
        ******************************************/
        EntityEnemyBullet01 = EntityBaseWeapon.extend({
            size: { x: 16, y: 2 },
            offset: { x: 1, y: 8 },
            animSheet: new ig.AnimationSheet('media/bullet_neon.png', 16, 16),
            maxVel: { x: 100, y: 70 },
            health: 100,
            speed: 10,
            angle: 60,
            maxSpeed: 80,
            bloodColorOffset: 1,
            type: ig.Entity.TYPE.C,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            /******************************************8
            * Initialization
            ******************************************/
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.addAnim('idle', 1, [0]);
                this.angle = this.angle;
            },
            update: function () {
                this.parent();
                this.speed = Math.min(this.maxSpeed, this.speed + ig.system.tick * 100);
                this.vel.x = Math.cos(this.angle) * this.speed;
                this.vel.y = Math.sin(this.angle) * this.speed;
                
                // Grabs player
                var player = ig.game.getEntitiesByType(EntityPlayer)[0];
                // Kills object if past certain bounds of screen
                if (player.pos.x - 600 > this.pos.x || this.pos.y > ig.system.height + 100 || this.pos.x < -100 || this.pos.y < -100) {
                    this.kill();
                }
            },
            handleMovementTrace: function (res) {
                this.parent(res);
                if (res.collision.y || res.collision.x) {

                    this.kill();
                }
            },
            
            /******************************************8
             * Checks for collision
             ******************************************/
            check: function (other) {
                other.receiveDamage(1, this);
                this.spawnParticles(4);
                this.kill();
            }
        });


        /******************************************8
        * Enemy Gun (Bullet Manager)
        ******************************************/
        EntityEnemyGun01 = ig.Entity.extend({
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.PASSIVE,
            name: 'Enemy Gun 01',
            
            bullets: 6,
            firingTimer: null,
            reloadTime: 2,

            /******************************************8
            * Initialization
            ******************************************/
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.firingTimer = new ig.Timer(Math.random() * this.reloadTime * 2);
                this.shootTimer = new ig.Timer(3.5);
            },

            /******************************************8
            * Update
            ******************************************/
            update: function () {
                this.parent();
                if (this.shootTimer.delta() > 0) {
                    var inc = 120 / (this.bullets - 1);

                    // The angle which the bullet leaves the weapon/enemy
                    var a2 = 110;
                    var radius = 5;
                    for (var i = 0; i < this.bullets; i++) {
                        var angle = a2 * Math.PI / 180;
                        var x = this.pos.x + 24 + Math.cos(angle) * radius;
                        var y = this.pos.y + 44 + Math.sin(angle) * radius;

                        // Attaches bullet to weapon
                        ig.game.spawnEntity(EntityEnemyBullet01, x - 25, y - 40, {
                            angle: angle
                        });
                        a2 += inc;
                    }
                    this.shootTimer.reset();
                }
            }
        });

    });

