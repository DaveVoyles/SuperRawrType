
/*********************************************************8
 * PickupLevelup.js
 * Floating pickup, adds 1 to player's current weapon level
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
    'game.entities.PickupLevelUp'
)
    .requires(
        'impact.entity',
        'impact.sound',
        'game.entities.player',
        'game.entities.death-explosion'
    )
    .defines(function () {

        EntityPickupLevelUp = ig.Entity.extend({
            /*************************\*****************8
             * Property Definitions
             ******************************************/
            animSheet: new ig.AnimationSheet('media/PickupLevelUp.png', 17, 17),
            size: { x: 17, y: 17 },
            _wmIgnore: true,
            maxVel: { x: 100, y: 100 },
            friction: { x: 150, y: 0 },
            health: 100000,
            speed: -75,
            autoDistKill: 300,
            currentBulletTime: 2,
            maxBulletTime: 5,
            type: ig.Entity.TYPE.C,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            // SFX
            PickupBuletTime01_sfx: new ig.Sound('media/SFX/PickupLevelUp.ogg'),
            PickupBuletTime01_sfx: new ig.Sound('media/SFX/PickupLevelUp.mp3'),
            PickupBuletTime01_sfx: new ig.Sound('media/SFX/PickupLevelUp.*'),

            /******************************************8
            * Initialization
            * Sets up anim sequences
            ******************************************/
            init: function (x, y, settings) {

                this.parent(x, y, settings);
                // Add animations
                this.addAnim('idle', .1, [0, 1, 2, 3, 2, 1]);

            },

            /******************************************8
            * Update
            ******************************************/
            update: function () {
                this.parent();

                // Grabs player
                this.player = ig.game.getEntitiesByType(EntityPlayer)[0];

                // Kills object if past certain bounds of screen
                if (this.player.pos.x - 600 > this.pos.x || this.pos.y > ig.system.height + 100 || this.pos.x < -100 || this.pos.y < -100) {
                    this.kill();
                }
            },

            /******************************************8
             *Checks for collision 
             ******************************************/
            check: function (other) {
                other.receiveDamage(0, this);

                if (this.player.currentWeapLevel < this.player.maxWeapLevels) {
                    this.player.currentWeapLevel++;
                    console.log('Level up!');
                    this.PickupBuletTime01_sfx.play();
                    this.kill();
                } else if (player.currentWeapLevel = player.maxWeapLevels) {
                    return;
                }
            },

            /******************************************8
             * Kill 
             ******************************************/
            kill: function () {
                this.parent();
            }
        });
    });