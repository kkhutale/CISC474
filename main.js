// Initialize the Phaser Game object 
var game = new Phaser.Game(256, 240, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update
  }, false, false);

var score = 0
var text
  
  function preload() {
    // // Load & Define assets
    game.load.spritesheet('bricks', 'tiles.png', 16, 16);
    game.load.spritesheet('enemy', 'gomba.png', 16, 16);
    game.load.spritesheet('mario', 'mario.png', 16, 16);
    game.load.spritesheet('coin', 'coins.png', 16, 16);
  
    game.load.tilemap('level', 'position.json', null, Phaser.Tilemap.TILED_JSON);
  }
  
  function create() {
    Phaser.Canvas.setImageRenderingCrisp(game.canvas)
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
  // // set background color
    game.stage.backgroundColor = '#b3e6ff';
  
    map = game.add.tilemap('level');
    map.addTilesetImage('tiles', 'bricks');
    map.setCollisionBetween(4, 12, true, 'solid');
  
    map.createLayer('background');
  
    layer = map.createLayer('solid');
    //moves world back and forth
    layer.resizeWorld();
  
    //set coins
    coins = game.add.group();
    //enable physics for coins
    coins.enableBody = true;
    map.createFromTiles(2, null, 'coin', 'stuff', coins);
   
  //set enemy
    enemy = game.add.group();
    //enable physics for goomba
    enemy.enableBody = true;
    map.createFromTiles(1, null, 'enemy', 'stuff', enemy);
    enemy.callAll('animations.add', 'animations', 'walk', [0, 1], 2, true);
    enemy.callAll('animations.play', 'animations', 'walk');
    enemy.setAll('body.bounce.x', 1);
    enemy.setAll('body.velocity.x', -20);
    enemy.setAll('body.gravity.y', 500);
  //set mario
    mario = game.add.sprite(16, game.world.height - 48, 'mario');
    //enable physics on the mario
    game.physics.arcade.enable(mario);
    //  Player physics properties. 
    mario.body.gravity.y = 370;
    mario.body.collideWorldBounds = true;
    // mario walking left and right.
    mario.animations.add('walkRight', [1, 2, 3], 10, true);
    mario.animations.add('walkLeft', [8, 9, 10], 10, true);
    mario.goesRight = true; 
//display score
  scoreText = game.add.text(0,0,'Score: 0', { font:"13px Arial", fill: "#000" })
  scoreText.fixedToCamera = true;
    game.camera.follow(mario);
    cursors = game.input.keyboard.createCursorKeys();
      
  }
  
  function update() {
    //  Setup collisions for mario,layer,enemy,coin
    game.physics.arcade.collide(mario, layer);
    game.physics.arcade.collide(enemy, layer);
    //  Call enemyattack() if mario overlaps with enemy
    game.physics.arcade.overlap(mario, enemy, enemyattack);
     //  Call coinCollect() if mario overlaps with coins
    game.physics.arcade.overlap(mario, coins, coinCollect);
  //Configure the controls
    if (mario.body.enable) {
      //  mario stop when not moving
      mario.body.velocity.x = 0;
      if (cursors.left.isDown) {
        mario.body.velocity.x = -90;
        mario.animations.play('walkLeft');
        mario.goesRight = false;
      } else if (cursors.right.isDown) {
        mario.body.velocity.x = 90;
        mario.animations.play('walkRight');
        mario.goesRight = true;
      } else {
        mario.animations.stop();
        if (mario.goesRight) mario.frame = 0;
        else mario.frame = 7;
      }
  // mario jumps
      if (cursors.up.isDown && mario.body.onFloor()) {
        mario.body.velocity.y = -190;

         // If no keys are pressed, stop the player
        mario.animations.stop();
      }
  
      if (mario.body.velocity.y != 0) {
        if (mario.goesRight) mario.frame = 5;
        else mario.frame = 12;
      }
    }

  }
  
  //reaction  of coin after coin and mario overlap
  function coinCollect(mario, coin) {
    coin.kill();
    score += 10;
    scoreText.setText('Score: '+score);
  
  }
  
  //reaction of gomba action after gomba and mario overlap
  function enemyattack(mario, goomba) {
    if (mario.body.touching.down) {
      goomba.animations.stop();
      goomba.frame = 2;
      goomba.body.enable = false;
      mario.body.velocity.y = -80;
      game.time.events.add(Phaser.Timer.SECOND, function() {
        goomba.kill();
        
      });
    } else {
      
      mario.frame = 6;
      mario.body.enable = false;
      mario.animations.stop();
      game.time.events.add(Phaser.Timer.SECOND * 3, function() {
        game.paused = true;
    
      });
    }
  }