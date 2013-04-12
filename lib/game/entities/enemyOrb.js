/*********************************************************8
 * enemyOrb.js
 * Simple, stationary green orb that fires 3 red bullets at a time
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
	'game.entities.enemyOrb'
)
.requires(
	'impact.entity',
    'game.entities.base-actor',
    'game.entities.RedBullet',
    'game.entities.EnemyBullet02',
    'game.entities.PickupLevelUp',
    'game.entities.PickupBulletTime',
    'game.entities.PickupMiniShip'
)
.defines(function(){

    EntityEnemyOrb = EntityBaseActor.extend({
        /******************************************8
         * Property Definitions
         ******************************************/
        animSheet: new ig.AnimationSheet('media/EnemyOrb.png', 15, 15),
        name: 'Enemy Orb',
        size: {x: 11, y:11},
        _wmIgnore: false,
        offset: {x: +2, y: +4},
        maxVel: {x: 100, y: 500},
        flip: false,
        friction: {x: 150, y: 200},
        health: 5,
        speed: 500,
        autoDistKill: 400,
        bloodColorOffset:1,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        shootTimer: null,
        bKilledByScreen: false,
        bIsAlive: true,

        /********************************************
          Initialize
         *******************************************/
        init: function( x, y, settings ) {
    	    this.parent( x, y, settings );
    	    this.addAnim('fly', 0.1, [0,1,2,3,4,3,2,1]);
    	    this.shootTimer = new ig.Timer(0);
            
            if (!ig.global.wm) { // Not in WM?
                // Attaches weapon (bullet manager)
                this.gun = ig.game.spawnEntity(EntityEnemyGun02, this.pos.x, this.pos.y);
            }
        },

        /******************************************8
         * Update
         ******************************************/
        update: function() {
            // The following if statement kills the entity as soon as it's no longer in view of the screen window
            var i = this.pos.x - ig.system.width;
            if (i > 0) {
                //        this.kill();
                this.parent();
            } else {
                this.parent();
                // Keeps gun attached to Spinning ship
                this.gun.pos.x = this.pos.x;
                this.gun.pos.y = this.pos.y;

                if (this.bIsAlive === false) {
                    this.gun.kill();
                }

                // Grabs player
                var player = ig.game.getEntitiesByType(EntityPlayer)[0];

                // Limits how frequently and far enemies can fire to keep bullet count down
                if (this.shootTimer.delta() > 1 && this.distanceTo(player) < 400) {

                    //  ig.game.spawnEntity(EntityBlueBullet, this.pos.x, this.pos.y);
                    this.shootTimer.set((EntityBlueBullet.fireRate));
                }

                // Kills object if past certain bounds of screen
                if (player.pos.x - 600 > this.pos.x || this.pos.y > ig.system.height + 100 || this.pos.x < -100 || this.pos.y < -100) {
                    this.bKilledByScreen = true;
                    this.kill(this.bKilledByScreen);
                }
            }
        },

        /******************************************8
         *Check (for damage done to others)
         ******************************************/
        check: function( other ) {
    	    other.receiveDamage( 10, this );
        },

        /******************************************8
         * receiveDamage
         ******************************************/
        receiveDamage: function(value){
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
            this.gun.kill();
            this.bIsAlive = false;
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
                    ig.game.spawnEntity(EntityPickupMiniShip, this.pos.x, this.pos.y);
                }
                if (rndDropNum > 0.8) {
                    ig.game.spawnEntity(EntityPickupLevelUp, this.pos.x, this.pos.y);
                }
            }
        }
    });
});
