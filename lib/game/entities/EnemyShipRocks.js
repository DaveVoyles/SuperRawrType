/*********************************************************8
 * EnemySpinningShip.js
 * Spinning ship which fires projectiles at player
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
	'game.entities.EnemyShipRocks'
)
.requires(
	'impact.entity',
    'game.entities.base-actor',
    'game.entities.RedBullet',
    'game.entities.EnemyBullet01',
    'game.entities.EnemyBullet02',
    'game.entities.PickupLevelUp',
    'game.entities.PickupBulletTime',
    'game.entities.PickupMiniShip'
)
.defines(function () {

    EntityEnemyShipRocks = EntityBaseActor.extend({
        /*************************\*****************8
         * Property Definitions
         ******************************************/
        animSheet: new ig.AnimationSheet('media/Enemies/EnemyShipRocks.png', 24, 27),
        size: { x: 11, y: 11 },
        _wmIgnore: false,
        offset: { x: +2, y: +4 },
        maxVel: { x: 100, y: 100 },
        flip: false,
        friction: { x: 150, y: 0 },
        health: 12,
        speed: 0, 
        autoDistKill: 400,
        bloodColorOffset: 4,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        shootTimer: null,
        vel: { x: 400, y: 200 },
        accel: { x: 0, y: 0 },
        friction: { x: 0, y: 0 },
        maxVel: { x: 400, y: 400 },

        /********************************************
          Initialize
         *******************************************/
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            var offset = 24;
            this.addAnim('fly', 0.1, [0, 1, 2, 3]);
            this.shootTimer = new ig.Timer(0);

            if (!ig.global.wm) { // Not in WM?
                // Attaches weapon (bullet manager)
                ig.game.spawnEntity(EntityEnemyGun02, this.pos.x, this.pos.y);
            }
        },

        /******************************************8
         * Update
         ******************************************/
        update: function () {

            this.parent();

            // Grabs player
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            // Limits how frequently and far enemies can fire
            if (this.shootTimer.delta() > 1 && this.distanceTo(player) < 400) {
                //  ig.game.spawnEntity(EntityBlueBullet, this.pos.x, this.pos.y);
                this.shootTimer.set((EntityBlueBullet.fireRate));
            }

            // Kills object if past certain bounds of screen
            if (player.pos.x - 600 > this.pos.x || this.pos.y > ig.system.height + 100 || this.pos.x < -100 || this.pos.y < -100) {
                this.bKilledByScreen = true;
                this.kill(this.bKilledByScreen);
            }
        },

        /******************************************8
         *Check (for damage done to others)
         ******************************************/
        check: function (other) {
            other.receiveDamage(10, this);
        },

        /******************************************8
         * receiveDamage
         ******************************************/
        receiveDamage: function (value) {
            this.parent(value);
            if (this.health > 0) {
                this.spawnParticles(1);
                this.Hit03_sfx.play();
            }
        },

        /******************************************8
         * Kill
         ******************************************/
        kill: function (bKilledBtScreen) {
            if (this.bKilledByScreen) {
                this.parent();
                return;
            } 
            ig.game.stats.kills++;
            this.spawnParticles(1);
            this.Explode01_sfx.play();
            this.lootDrop();
            this.parent();
        },
        
        /******************************************8
       * lootDrop
       * Randomly spawns loot for player
       ******************************************/
        lootDrop: function () {

            // Rolls a random number
            var rndNum = Math.random();

            // Chance that we can drop loot
            if (rndNum < 0.8) {
                // Roll another random to determine loot
                var rndDropNum = Math.random();

                if (rndDropNum < 0.4) {
                    ig.game.spawnEntity(EntityPickupBulletTime, this.pos.x, this.pos.y);
                }
                if (rndDropNum > 0.6) {
                    ig.game.spawnEntity(EntityPickupLevelUp, this.pos.x, this.pos.y);
                }
            }
        }
    });
});
