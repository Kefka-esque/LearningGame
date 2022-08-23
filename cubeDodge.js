var gameStarted = false; // For having the player start the game, see bottom of this doc for use.
var myGamePiece; // Player
var myObstacles = []; // Obstacles
var score;
var myGameArea = { 		// Object for the play area
	canvas : document.createElement("canvas"), // Create a canvas
	music : document.getElementById("music"),
	start : function() {
		this.difficulty = 1; // For determining speed of player and obstacles, increases as more boss pieces spawn (not counting hte first)
		this.bossInterval = (Math.floor(Math.random() * (12 - 8) + 8) * 100) / 2; // Determines the frame the first boss spawns
		this.canvas.width = 480; 
		this.canvas.height = 270;
		this.context = this.canvas.getContext("2d"); // Contextualizing canvas for 2d defines available commands
		document.body.insertBefore(this.canvas, document.body.childNodes[0]); 
		this.interval = setInterval(updateGameArea, 20);
		this.frameNum = 0;
		window.addEventListener('keydown', function (e) { // Listen for keypress...
			myGameArea.key = (myGameArea.key || []);
			myGameArea.key[e.keyCode] = true;
		})
		window.addEventListener('keyup', function (e) {   // ...and react to keypress ending
			myGameArea.key[e.keyCode] = false; // For some reason this throws an error. It works though.
		})
	},
	clear : function() { // Clear the canvas so pieces can be moved
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop : function() { // Game over
		myGameArea.music.pause();
		var sound = document.getElementById("gameOver");
		sound.play();
		clearInterval(this.interval);
		alert('Game Over! Final Score: ' + (myGameArea.frameNum * myGameArea.difficulty));
		
	}
}

function everyInterval(n) {  // For doing something every n frames
	if ((myGameArea.frameNum / n) % 1 == 0){
		return true;}
	return false;
}

function startGame() { // Initialize the game 
	myGamePiece = new component(30, 30, "red", 10, 120); // Player
	score = new component("30px", "Consolas", "black", 20, 40, "text");
	myGameArea.music.play();
	myGameArea.start();
}

function component(width, height, color, x, y, type) { // Constructor for elements on the canvas
	this.type = type;
	this.width = width; // Dimensions for size		      
	this.height = height;
	this.x = x; // Position on the canvas
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.offScreen = false;
	this.offScreenFrameNum;
	this.update = function(){ // Draw on the canvas
		ctx = myGameArea.context;
		if (this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(this.text, this.x, this.y);
		} else {
			ctx.fillStyle = color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	this.newPos = function(){ // For moving a piece
		this.x += this.speedX;
		this.y += this.speedY;
	}
	this.crashWith = function(otherobj){  // Function to determine if pieces collide. It assumes pieces have
		var myleft = this.x;			  // collided, but returns false if their positions don't overlap
		var myright = this.x + this.width;
		var mytop = this.y;
		var mybottom = this.y + this.height;
		var otherleft = otherobj.x;
		var otherright = otherobj.x + otherobj.width;
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + otherobj.height;
		var crash = true;
		if ((mybottom < othertop) ||
			(mytop > otherbottom) ||
			(myright < otherleft) ||
			(myleft > otherright)) {
				crash = false;
		}
		return crash;
	}
}

function updateGameArea(){
	var x, y, size, gap, minHeight, maxHeight, minGap, maxGap, bossInterval; // We'll need these later on in this func
	for(i = 0; i < myObstacles.length; i += 1){ // Check for collision with any obstacle in play
		if (myGamePiece.crashWith(myObstacles[i])) {
			myGameArea.stop();
			return;
		}
	}
	if (myGamePiece.x > myGameArea.canvas.width ||
		myGamePiece.x < 0 ||
		myGamePiece.y > myGameArea.canvas.height ||
		myGamePiece.y < 0) { 
			if(myGamePiece.offScreen == false){
				myGamePiece.offScreen = true;
				myGamePiece.offScreenFrame = myGameArea.frameNum;
			}
		if(myGamePiece.offScreen == true && myGameArea.frameNum == (myGamePiece.offScreenFrame + 200)) { // If player piece has been offscreen for 4 seconds
			myGameArea.stop();
		}
	} 
	myGameArea.clear(); // Clear the canvas
	myGameArea.frameNum++;
	if (myGameArea.frameNum == 1 || everyInterval(150)) { // Spawn an obstacle every 3 seconds (150 frames),
		x = myGameArea.canvas.width;					  // and also spawn one initially
		minHeight = 20; 
		maxHeight = 200;
		size = Math.floor(Math.random()*(maxHeight-minHeight+1) + minHeight);
		minGap = 50;
		maxGap = 200;
		gap = Math.floor(Math.random()*(maxGap-minGap+1) + minGap);
		myObstacles.push(new component(10, size, "green", x, 0));
		myObstacles.push(new component(10, x - size - gap, "green", x, size+gap));
	}
	if (myGameArea.frameNum == myGameArea.bossInterval) { // Every 8-14 seconds spawn a horizontal obstacle 
		y = myGameArea.canvas.width; 
		minHeight = 40; // reminder: canvas width = 480, height = 270
		maxHeight = 380; // This seems to be a good number for a base, I may adjust in the future to be based on canvas.width instead of a hard int
		size = Math.floor(Math.random()*(maxHeight-minHeight+1) + minHeight);
		minGap = 50;
		maxGap = 100;
		gap = Math.floor(Math.random()*(maxGap-minGap+1) + minGap);
		myObstacles.push(new component(size, 10, "blue", 0, 0, "boss")); // reminder: component(width height color x y type)
		myObstacles.push(new component(y - size - gap, 10, "blue", size + gap, 0, "boss")); 
		myGameArea.bossInterval += (Math.floor(Math.random() * (15 - 8) + 8) * 100) / 2; // Determine next frame to spawn a boss piece
		if (myGameArea.frameNum > 550) { // Check that at least one boss piece has been spawned
			myGameArea.difficulty++; // Increase speed of pieces based on difficulty
		}	
	} 
	for (i = 0; i< myObstacles.length; i++) { // Move our obstacles
		if (myObstacles[i].type == "boss") { // If it is a boss piece it needs to move down not left
			myObstacles[i].y += myGameArea.difficulty;
		} else{
		
			myObstacles[i].x -= myGameArea.difficulty;
			}
		myObstacles[i].update();
	}
	myGamePiece.speedX = 0; // Reset player speed
	myGamePiece.speedY = 0;
	if (myGameArea.key && myGameArea.key[37]) { // Check for keypresses from arrow keys
		myGamePiece.speedX -= myGameArea.difficulty; } // and change piece speed to suit
	if (myGameArea.key && myGameArea.key[39]) {
		myGamePiece.speedX += myGameArea.difficulty; }
	if (myGameArea.key && myGameArea.key[38]) {
		myGamePiece.speedY -= myGameArea.difficulty; }
	if (myGameArea.key && myGameArea.key[40]) {
		myGamePiece.speedY += myGameArea.difficulty; }
	score.text="SCORE: " + (myGameArea.frameNum * myGameArea.difficulty) + " LEVEL: " + myGameArea.difficulty;
	score.update();
	myGamePiece.newPos(); // Move player based on speed value
	myGamePiece.update(); // Redraw player based on new position
}

function moveup(){				// These functions are for the movement buttons on screen, deprecated
	myGamePiece.speedY -= 1;
}
	
function movedown(){
	myGamePiece.speedY += 1;
}
	
function moveleft(){
	myGamePiece.speedX -= 1;
}
function moveright(){
	myGamePiece.speedX += 1;
}

function stopmove(){ 
	myGamePiece.speedX = 0;
	myGamePiece.speedY = 0;
}
// Hit space to start, fixes music not playing
document.addEventListener('keyup', event => {
  if (event.code === 'Space' && gameStarted == false) {
    startGame();
	gameStarted = true;
  }
})