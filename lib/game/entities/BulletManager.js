/*********************************************************8
 * BulletManager.js
 * Bullet Manager class
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************/
ig.module(
    'game.entities.BulletManager'
)
    .requires(
        'game.entities.BaseWeapon'
    )
    .defines(function() {
        EntityBulletManager = EntityBaseWeapon.extend({
            bInUse: false,
            pos: {x:x,y: y},
            
            /******************************************8
             * Property Definitions
             ******************************************/
            init: function (x, y, settings) {
                this.parent(x + (settings.flip ? -4 : 8), y + 8, settings);

            },

 
         /*
         * Spawn an object into use
         */
          spawn: function() {
            ig.game.spawnEntity(this, this.pos.x, this.pos.y);
            this.inUse = true;
        }



        });
    });
        