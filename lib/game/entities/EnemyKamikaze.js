/*********************************************************8
 * EnemyKamikaze.js
 * Spinning ship which fires projectiles at player
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
	'game.entities.EnemyKamikaze'
)
.requires(
	'impact.entity',
    'game.entities.base-actor',
    'game.entities.PickupLevelUp',
    'game.entities.PickupBulletTime',
    'game.entities.PickupMiniShip',
    'game.entities.EnemySpinningShip'
)
.defines(function () {

    EntityEnemyKamikaze = EntityBaseActor.extend({
        /*************************\*****************8
         * Property Definitions
         ******************************************/
        animSheet: new ig.AnimationSheet('media/Enemies/EnemySpinningShip.png#f92635', 19, 24),
        name: 'Enemy Kamikaze',
        size: { x: 11, y: 11 },
        _wmIgnore: false,
        offset: { x: +2, y: +4 },
        maxVel: { x: 100, y: 100 },
        flip: false,
        friction: { x: 150, y: 0 },
        health: 2,
        speed: -25,
        velocity: 80,
        autoDistKill: 400,
        bloodColorOffset: 0,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,

        /********************************************
          Initialize
         *******************************************/
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('fly', 0.1, [0, 1, 2, 3, 4, 5, 6, 7]);

            //// Spawns Spinning ships to fight along side Kamikaze
            //if (!ig.global.wm) { // Not in WM?              
            //    this.gun = ig.game.spawnEntity(EntityEnemySpinningShip, this.pos.x + 20, this.pos.y + 20);
            //    this.gun = ig.game.spawnEntity(EntityEnemySpinningShip, this.pos.x + 20, this.pos.y - 20);
            //}
        },

        /******************************************8
         * Update
         ******************************************/
        update: function () {
            this.parent();

            // Grabs player
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            // Generic movement
            this.vel.x = this.velocity;

            /*========================================
            * Kamikaze AI
            *========================================*/
            if (this.distanceTo(player) < 200) {
                var angle = this.angleTo(ig.game.player);
                    x = Math.cos(angle);
                    y = Math.sin(angle);

                this.vel.x = x * this.speed;
                this.vel.y = y * this.speed;

                if (this.distanceTo(player) < 550) {
                    this.vel.x = -player.vel.x * 2.2;
                }
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
            this.kill();
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
        var rndNum=Math.random();
            
            // Chance that we can drop loot
        if (rndNum < 0.8) {
            // Roll another random to determine loot
            var rndDropNum = Math.random();
                
            if (rndDropNum < 0.3 ) {
                ig.game.spawnEntity(EntityPickupBulletTime, this.pos.x, this.pos.y);
            }
            if (rndDropNum > 0.8) {
                ig.game.spawnEntity(EntityPickupLevelUp, this.pos.x, this.pos.y);
            }
        }
    }
    });
});
