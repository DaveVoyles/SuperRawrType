/*********************************************************8
 * enemyOrb.js
 * Simple, stationary ship, fires single shot blue projectiles
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
	'game.entities.enemyShip01'
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

    EntityEnemyShip01 = EntityBaseActor.extend({
        /*************************\*****************8
         * Property Definitions
         ******************************************/
        animSheet: new ig.AnimationSheet('media/enemyOrb.png#ff9c00', 15, 15),
        size: { x: 11, y: 11 },
        _wmIgnore: false,
        offset: { x: +2, y: +4 },
        maxVel: { x: 100, y: 100 },
        flip: false,
        friction: { x: 150, y: 0 },
        health: 4,
        speed: -50,
        velocity: 80,
        autoDistKill: 300,
        bloodColorOffset: 4,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        shootTimer: null,

        /********************************************
          Initialize
         *******************************************/
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('fly', 0.1, [0, 1, 2, 3, 4, 3, 2, 1]);
            this.shootTimer = new ig.Timer(0);       
            this.timer = new ig.Timer(2);
        },

        /******************************************8
         * Update
         ******************************************/
        update: function () {

            this.parent();

            // Grabs player
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            // Limits how frequently and far enemies can fire
            // Change the number to adjust rate-of-fire
            if (this.shootTimer.delta() > 1.8 && this.distanceTo(player) < 400) {
                ig.game.spawnEntity(EntityBlueBullet, this.pos.x, this.pos.y);
                this.shootTimer.set((EntityBlueBullet.fireRate));
            }

            // Kills object if past certain bounds of screen
            if (player.pos.x - 600 > this.pos.x || this.pos.y > ig.system.height + 100 || this.pos.x < -100 || this.pos.y < -100) {
                this.bKilledByScreen = true;
                this.kill(this.bKilledByScreen);
            }

            // Generic movement
            this.vel.x = this.velocity;
    
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
            if (this.health > 0)
                this.spawnParticles(1);
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
                if (rndDropNum > 0.7) {
                    ig.game.spawnEntity(EntityPickupLevelUp, this.pos.x, this.pos.y);
                }
            }
        }

    });
});
