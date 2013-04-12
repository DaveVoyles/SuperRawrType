/*********************************************************8
 * EnemySpinningShip.js
 * Spinning ship which fires projectiles at player
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
	'game.entities.EnemySpinningShip'
)
.requires(
	'impact.entity',
    'game.entities.base-actor',
    'game.entities.SpinningShipBullet',    
    'game.entities.RedBullet',
    'game.entities.PickupLevelUp',
    'game.entities.PickupBulletTime',
    'game.entities.PickupMiniShip'
)
.defines(function () {

    EntityEnemySpinningShip = EntityBaseActor.extend({
        /*************************\*****************8
         * Property Definitions
         ******************************************/
        animSheet: new ig.AnimationSheet('media/Enemies/EnemySpinningShip.png', 19, 24),
        name: 'Enemy Spinning Ship',
        size: { x: 11, y: 11 },
        _wmIgnore: false,
        offset: { x: +2, y: +4 },
        maxVel: { x: 100, y: 100 },
        flip: false,
        friction: { x: 150, y: 0 },
        health: 12,
        speed: -50,
        velocity: 80,
        autoDistKill: 400,
        bloodColorOffset: 2,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        shootTimer: null,

        /********************************************
          Initialize
         *******************************************/
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('fly', 0.1, [0,1,2,3,4,5,6,7 ]);
            this.shootTimer = new ig.Timer(1);

            if (!ig.global.wm) { // Not in WM?
                // Attaches weapon (bullet manager)
                this.gun = ig.game.spawnEntity(EntitySpinningShipGun, this.pos.x, this.pos.y);
            }
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
            
            // Keeps gun attached to Spinning ship
            this.gun.pos.x = this.pos.x;
            this.gun.pos.y = this.pos.y;
            
            ///*========================================
            //* AI 1
            //*========================================*/
            //// AI for player interactions
            //if (this.distanceTo(player) < 200) {
            //    this.vel.x = player.vel.x;
            //    this.vel.y = player.vel.y;             
            //}
            

            ///*========================================
            //* AI 2
            //*========================================*/            
            //if (this.distanceTo(player) < 200) {
            //    var angle = this.angleTo(ig.game.player);
            //    var x = Math.cos(angle);
            //    var y = Math.sin(angle);
                
            //    this.vel.x = x * this.speed;
            //    this.vel.y = y * this.speed;

            //    if (this.distanceTo(player) < 300) {
            //        this.vel.x = player.vel.x;
            //    }
            //}

            
            ///*========================================
            //* Kamikaze02 - Stop short of player
           // * Moves in OPPOSITE y direction
            //*========================================*/
            //if (this.distanceTo(player) < 250) {
            //    var angle = this.angleTo(ig.game.player);
            //    var x = Math.cos(angle);
            //    var y = Math.sin(angle);

            //    this.vel.x = x * this.speed;
            //    this.vel.y = y * this.speed;


            //    if (this.distanceTo(player) < 300) {
            //        this.vel.x = -player.vel.x;
            //    }

            //    if (this.distanceTo(player) < 100) {
            //        this.vel.x = player.vel.x;
            //    }
            //}
            
            /*========================================
            * Kamikaze02 - Stop short of player
            * Moves in SAME y direction (tracks player)
            *========================================*/
            if (this.distanceTo(player) < 300) {
                var angle = this.angleTo(ig.game.player);
                    x = Math.cos(angle);
                    y = Math.sin(angle);

                this.vel.x = x * this.speed;
                this.vel.y = y * this.speed;

                // Maintain distance from player, then begin to shoot
                if (this.distanceTo(player) < 250) {    
                    this.vel.x = player.vel.x;
                    this.vel.y = y * -this.speed * 7;

                    //  Gun will not shoot until within this distance   
                    this.gun.bCanShoot = true;
                }
            }

            //// Limits how frequently and far enemies can fire
            //if (this.shootTimer.delta() > 1 && this.distanceTo(player) < 400) {
            //    //  ig.game.spawnEntity(EntityBlueBullet, this.pos.x, this.pos.y);
            //    this.shootTimer.set((EntityBlueBullet.fireRate));
            //}

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
            this.gun.kill();    // Kills the gun that was attached to the ship
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
                ig.game.spawnEntity(EntityPickupMiniShip, this.pos.x, this.pos.y);
            }
            if (rndDropNum > 0.7) {
                ig.game.spawnEntity(EntityPickupBulletTime, this.pos.x, this.pos.y);
            }
        }
    }
    });
});
