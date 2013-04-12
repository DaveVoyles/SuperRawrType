/*********************************************************8
 * bullet.js
 * Bullet to be used by player
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
    'game.entities.bullet'
)
    .requires(
    'game.entities.BaseWeapon'
)
    .defines(function () {
        EntityBullet = EntityBaseWeapon.extend({
            /******************************************8
             * Property Definitions
             ******************************************/
            name: 'bullet',
            _wmIgnore: true,
            size: { x: 16, y: 2 },
            offset: { x: 2, y: 9 },
            animSheet: new ig.AnimationSheet('media/bullet_neon.png', 16, 16),
            maxVel: { x: 500, y: 0 },
            fireRateWeak: 0.1,
            fireRateMid: 0.1,
            fireRateMiniShip: .5,
            bloodColorOffset: 5,
            inUse: false,
            type: ig.Entity.TYPE.C,
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.PASSIVE,



            /******************************************8
             * Init
             ******************************************/
            init: function (x, y, settings) {
                this.parent(x + (settings.flip ? -4 : 8), y + 8, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                ig.game.pool.addToPool(this, ig.game.pool.allBulletsArr);
                this.inUse = false;
                ig.game.bullet = this;
            },

            initialize: function () {
                this.addAnim('active', 0.5, [3, 2, 1, 0, 1, 2]);
                this.killTimer = new ig.Timer(.7);
            },


            /******************************************8
         * Handle movement
        ******************************************/
            handleMovementTrace: function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    // this.kill();
                    ig.game.Pool.removeEntity(this);
                }
            },

            /******************************************8
             * Update (Kills bullet after (x) time)
             ******************************************/
            update: function (killTimer) {
                if (this.inUse === true) {
                    this.killEntity(this.killTimer);
                    this.parent();
                }
            },

            /******************************************8
             * Checks for collision
             ******************************************/
            check: function (other) {
                other.receiveDamage(1, this);
                this.spawnParticles(4);
                // this.kill();
                ig.game.Pool.removeEntity(this);
            }
        });
    });
