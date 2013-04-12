/*********************************************************************8
 * StationaryShip.js
 * Small ship that helps the player and remains stationary
 * @copyright (c) 2013 Dave Voyles, under The MIT License (see LICENSE)
 *********************************************************************/
ig.module(
    'game.entities.StationaryShip'
)
    .requires(
        'game.entities.player'
)
    .defines(function()
    {
        EntityStationaryShip = EntityPlayer.extend({
        name: 'StationaryShip',
        parental:null,
        type:ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
        collides: ig.Entity.COLLIDES.PASSIVE,
        angle:0,
        bCanSpawnShip: true,
        bCanSpawnFirstShip: true,
        increase:0,
        totalWeapons: 4,
        activeWeapon: "EntityBullet",
        currentWeapLevel: 1,
        maxWeapLevels: 2,

            /******************************************8
             * Initialize
             ******************************************/
            init: function(x,y,settings){
               this.parent( x, y, settings );

               this.bCanSpawnShips = true;
               this.bCanSpawnFirstShip = true;

               // Used for constant fire
               this.lastShootTimer = new ig.Timer(0);
            },

            /******************************************8
             * Update
             ******************************************/
            update:function(x,y,settings){

                // Reference to player
                this.parental = ig.game.getEntitiesByType(EntityPlayer)[0];

                // Spawning offset location of ships vs. player
                var offsetX = 20;
                var offsetY = 40;


                    // Spawns above the player
                    x = this.parental.pos. x + offsetX;
                    y = this.parental.pos.y + offsetY;
                    this.bCanSpawnFirstShip = false;

//                    // Spawns below player
//                    x = this.parental.pos.x + offsetX;
//                    y = this.parental.pos.y - offsetY;
//                    this.bCanSpawnSecondShip = false;

                // Sets current position
                this.pos.x = x;
                this.pos.y = y;

                // Shooting
                var isShooting = ig.input.state('shoot');
                if (isShooting && this.lastShootTimer.delta() > 0) {

                    //  Level 1 weapons
                    if (this.currentWeapLevel == 1){
                        switch (this.activeWeapon){
                            case("EntityBullet"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x +6, this.pos.y -4);
                                this.lastShootTimer.set(equipedWeap.fireRateWeak);
                                break;
                            case("EntityGrenade"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x +5, this.pos.y +6);
                                this.lastShootTimer.set(equipedWeap.fireRateWeak);
                                break;
                            case("EntityExplosiveBomb"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x +5, this.pos.y +5);
                                this.lastShootTimer.set(equipedWeap.fireRateWeak);
                                break;
                        }
                    }

                    // Level 2 weapons
                    if (this.currentWeapLevel == 2){
                        switch (this.activeWeapon){
                            case("EntityBullet"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x, this.pos.y -13);
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x, this.pos.y +6);
                                this.lastShootTimer.set(equipedWeap.fireRateMid);
                                break;
                            case("EntityGrenade"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x +5, this.pos.y +5);
                                this.lastShootTimer.set(equipedWeap.fireRateMid);
                                break;
                            case("EntityExplosiveBomb"):
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x, this.pos.y -4 );
                                var equipedWeap = ig.game.spawnEntity(this.activeWeapon, this.pos.x, this.pos.y +13);
                                this.lastShootTimer.set(equipedWeap.fireRateMid);
                                break;
                        }
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

                /*======================================
                 Weapon inventory
                 =====================================*/
                if( ig.input.pressed('switch'))  {
                    this.weapon ++;
                    if(this.weapon >= this.totalWeapons)
                        this.weapon = 0;
                    switch(this.weapon){
                        case(0):
                            this.activeWeapon = "EntityBullet";
                            break;
                        case(1):
                            this.activeWeapon = "EntityGrenade";
                            break;
                        case(2):
                            this.activeWeapon = "EntityExplosiveBomb";
                            break;
                    }
                }
            },


            /******************************************8
             * Handle Movements
             ******************************************/
            handleMovementTrace: function( res ) {
                this.parent( res );
            },

            // This function is called when this entity overlaps anonther entity of the
            // checkAgainst group. I.e. for this entity, all entities in the B group.
            check: function( other ) {
                other.receiveDamage( 0, this );
                this.kill();
                this.bCanSpawnShips = true;
            }

    });
});