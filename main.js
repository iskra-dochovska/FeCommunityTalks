import "./style.css";
import Phaser from "phaser";

//separating some constants to easily tweak them
const sizes = {
  width: 500,
  height: 500,
};

const speedDown = 300

//grabbing HTML elements
const gameStartDiv = document.querySelector("#gameStartDiv")
const gameStartBtn = document.querySelector("#gameStartBtn")
const gameEndDiv = document.querySelector("#gameEndDiv")
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan")
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan")

//the Scene is a self-contained module that manages everything that happens in that part of the game
class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game"); //naming the scene
    this.player 
    this.cursor
    this.playerSpeed = speedDown+50
    this.target
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.coinMusic
    this.bgMusic
    this.emitter //variable to collect particle effects
  }
  //loading game assets: background image, player image, target image, and sounds
  preload() {
    this.load.image("bg", "/assets/bg.png")
    this.load.image("basket", "/assets/basket.png")
    this.load.image("apple", "/assets/apple.png")
    this.load.image("money", "/assets/money.png")
    this.load.audio("coin", "/assets/coin.mp3")
    this.load.audio("bgMusic", "/assets/bgMusic.mp3")
  }

  create() {
    this.scene.pause("scene-game") //start the game in a paused state

    this.coinMusic = this.sound.add("coin")
    this.bgMusic = this.sound.add("bgMusic")
    this.bgMusic.play()

    //create and configure the player (basket) object
    this.add.image(0,0,"bg").setOrigin(0,0)
    this.player = this.physics.add.image(0,sizes.height-100,"basket").setOrigin(0,0)
    this.player.setImmovable(true) //prevents the player from being moved by physics
    this.player.body.allowGravity = false //prevents the player from falling off screen
    this.player.setCollideWorldBounds(true) //prevents the player from moving out of bounds
    this.player.setSize(80,15).setOffset(10,70) //adjusts the collision box size and position

    //create the target (apple)
    this.target = this.physics.add.image(0,0, "apple").setOrigin(0,0)
    this.target.setMaxVelocity(0, speedDown) //max falling speed

    //add collision detection between the player and the target
    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this)

    //capture keyboard input (arrow keys)
    this.cursor = this.input.keyboard.createCursorKeys()

    this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
      font: "25px Arial",
      fill: "#000000"
    })
    this.textTime = this.add.text(10, 10, "Remaning time:00", {
      font: "25px Arial",
      fill: "#000000"
    })

    //set a timer to call the gameOver method after 30 seconds
    this.timedEvent = this.time.delayedCall(30000,this.gameOver,[],this)

    //create particle effects for when the target is hit
    this.emitter = this.add.particles(0,0,"money",{
      speed: 100,
      gravityY: speedDown-200,
      scale: 0.04,
      duration: 100,
      emitting: false //disables automatic emission of particles when the emitter is created.
    })
    //make the emitter follow a particular game object
    this.emitter.startFollow(this.player, this.player.width/2, this.player.height/2, true)
  }

  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds()
    this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`)

    //reset the target's position if it falls off the screen
    if(this.target.y >= sizes.height){
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }

    //handle player movement based on cursor input
    const {left,right} = this.cursor

    if(left.isDown)
      this.player.setVelocityX(-this.playerSpeed);
    else if(right.isDown)
      this.player.setVelocityX(this.playerSpeed)
    else
      this.player.setVelocityX(0)
  }

  //return a random X position within the game width (used for the target's position)
  getRandomX()
    {return Math.floor(Math.random() * 480)}

  //called when the target hits the player
  targetHit()
  {
    this.emitter.start()
    this.coinMusic.play()
    this.target.setY(0)
    this.target.setX(this.getRandomX())
    this.points++
    this.textScore.setText(`Score: ${this.points}`)
  }

  //end the game and display the result
  gameOver() {
    this.sys.game.destroy(true);
    if (this.points >= 10) {
        gameWinLoseSpan.textContent = "Win!";
    } else {
        gameWinLoseSpan.textContent = "Lose!";
    }
    gameEndScoreSpan.textContent = this.points;
    gameEndDiv.style.display = "flex";
}
}

//game configuration settings
const config = {
  type: Phaser.WEBGL, //a JavaScript API used for rendering interactive 2D and 3D graphics within web browsers without the need for plugins
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade", //use the arcade physics engine
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [GameScene],
};

//create the Phaser game instance with the specified configuration
const game = new Phaser.Game(config);

//start the game when the start button is clicked
gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none"
  game.scene.resume("scene-game")
})