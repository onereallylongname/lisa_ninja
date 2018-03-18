var windX = 500;
var windY = 700;
var BG;
var drops;
var justClicked = false;
var lives;
var points;
var userScore = 0;
var maxPoints;
var speedGeral;
var cestoImg;
var difLevel;

var MAX_LINE = 5;
var lastX = [];
var lastY = [];

var gameState;
var bottom;
var explodeImage;
var	smokeImage;

var items = {};
var itemKeys;
var gameItems = {};

var menuButtons = [];
var gameOverButtons = []; 
var sounds = {};
var font;

var mobile = false;


function preload(){
	// load items
	items = loadJSON("prod.json");
	font = loadFont('font/SEVESBRG.ttf');
	sounds["bomb"] = loadSound('sound/bomb.mp3');
	sounds["prod"] = loadSound('sound/prod.mp3');
	sounds["sword"] = loadSound('sound/sword.mp3');
	sounds["sword"].setVolume(0.8);
	sounds["sad"] = loadSound('sound/sad.mp3');
	sounds["sad"].setVolume(0.8);
	//sounds["chaching"] = loadSound('sound/chaching.mp3');
	//sounds["chaching"].setVolume(0.0001);
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	 mobile = true;
	 windX = screen.width;
	 windY = screen.height;
	}
	
}

document.addEventListener('touchstart', function(e) {e.preventDefault()}, false);
document.addEventListener('touchmove', function(e) {e.preventDefault()}, false);

function setup(){
	gameCanvas = createCanvas(windX, windY);
	gameCanvas.parent('div_GameCanvas');
	BG = createGraphics(windX, windY);
	BG.rectMode(CENTER); 
	BG.textAlign(CENTER);
	
	// load images
	itemKeys = Object.keys(items);
	//console.log(itemKeys);
	for(i = 0; i < itemKeys.length; i++){
		items[itemKeys[i]].img = loadImage(items[itemKeys[i]].img);
	}
	
	gameItems["bomb"] = new Item();
	gameItems["bomb"].add(-50, "bomb","img/bomb.png");
	
	explodeImage = loadImage("img/booom.png");
	smokeImage = loadImage("img/smoke.png");
	cestoImg = loadImage("img/cesto-compras.png");
	
	BG.textFont(font);
	
	gameState = new GameState();
	gameState.state = "menu";
	gameState.startMenu();
	gameState.startGame();
	gameState.startGameOver();
  
}

function draw() {
	gameState[gameState.state]();
	image(BG, 0, 0);
}

function touchMoved() {//mouseDragged(){//mouseClicked() {
	
	let cx = mouseX;
	let cy = mouseY;
	
	if(mobile && !(touches === undefined)){
			let first = touches[0];
			cx = first[0];
			cy = first[1];
	}
	
	for (var i = drops.n - 1; i >= 0; i--) {
		//if(((mouseX - drops.list[i].x) < drops.list[i].r /2 ) && ((mouseY - drops.list[i].y) < drops.list[i].r /2) && drops.list[i].active){
		if(!drops.list[i].explode && (dist(mouseX, mouseY, drops.list[i].x, drops.list[i].y) <= drops.list[i].r) && drops.list[i].active) {
			drops.list[i].addPoints(-2);
			drops.list[i].explodeNow();
			//console.log(i);
			break;
		}
	}
	return false;
}
function touchEnded(){
	if(gameState.state == "menu"){
		for(i=0; i < gameState.menuList.length; i++){
			if(gameState.menuList[i].clicked()){
				gameState.menuList[i].sound.play();
				gameState.menuList[i].func();
				break;
			}
		}
	}else if(gameState.state == "gameOver"){
		for(i=0; i < gameState.gameOverList.length; i++){
			if(gameState.gameOverList[i].clicked()){
				gameState.gameOverList[i].sound.play();
				gameState.gameOverList[i].func();
				break;
			}
		}
	}
}

//>> Objectos
function GameState(){
	
	this.state;
	this.menuList = [];
	this.gameOverList = [];
	
	this.startMenu = function(){
		gameState.menuList.push( new Button(windX/2,2*windY/3, 300, 100, 4, "start", 25, color(25, 149, 173),color(161, 214, 226), color(25, 149, 173), sounds["sword"], function(){gameState.startGame(); gameState.state = "gameOn";}));
		//		gameState.menuList.push( new Button(windX/2,2*windY/3, 300, 100, 4, "Menu", 25, color(25, 204, 44),color(255, 204, 0), color(255, 204, 0), function(){gameState.state = "menu";}));

	}
	
	this.menu = function(){
		BG.background(36, 48, 51);
		//BG.textSize(55);
		//BG.text(mobile, 250, 100);
		//BG.fill( color(161, 214, 226));
		BG.textSize(55);
		BG.text("Lisa Ninja", windX/2, windX/2);
		BG.fill( color(25, 149, 173));
		BG.text("Lisa Ninja", windX/2 + 3, windX/2 + 3);
		BG.fill( color(161, 214, 226));
		BG.textSize(34);
		BG.text("Your Points", windX/2, windX/2 + 60);
		BG.textSize(28);
		BG.text(userScore.toString(), windX/2, windX/2 + 100);
		BG.textSize(12);
		BG.text("Um jogo do Grupo Lisa", windX/2, windY - 30);
		
		
		for(i=0; i < gameState.menuList.length; i++){
			gameState.menuList[i].show();
		}
	}
	
	this.startGame = function(){
		lives = 3;
		points = 0;
		maxPoints = 0;		
		speedGeral = 3;
		bottom = windY - 40;
		difLevel = 3;

		let limitMax = 10
		let limit = 4;
		
		drops = new Drops(10);
		for (var i = 0; i < drops.n; i++) {
			drops.add( new Drop());
			drops.list[i].randomItem();
		}
		
		for(i = 0; i < MAX_LINE; i++){
			lastX[i] = mouseX;
			lastY[i] = mouseY;
		}
	}
	
	this.gameOn = function(){
		BG.background(36, 48, 51);
	
		/* if(mouseIsPressed && !justClicked){
			justClicked = true;
			
		} else if(!mouseIsPressed){
			justClicked = false;
		} */
		
		drops.update();
		
		// calc. speed
		points = floor(points);
		maxPoints = points > maxPoints ? points : maxPoints;
		//let tempCalcPoints = points < 2 ? 2 : floor(points);
		//speedGeral = constrain(log(tempCalcPoints * 0.55), 3, 15);
		speedGeral = exp(maxPoints/8000) + 2;

		BG.push();
			BG.tint(25, 55, 255);
			BG.image(cestoImg, 10, windY - 140, windX - 20, 220);
		BG.pop();
		BG.push();
			BG.textAlign(LEFT);
			BG.textSize(24);
			BG.fill(color(25, 149, 173));			
			BG.text("Points : " + points.toString(), 25, windY - 22);
			BG.text("Lives : " + lives.toString(), windX - 122, windY - 22);
		BG.pop();
		
		lastX.push(mouseX);
		lastY.push(mouseY);
		if(mouseIsPressed){
		BG.push();
			BG.strokeWeight(4)
			BG.noFill();
			BG.beginShape();
			for(i = 0; i < MAX_LINE; i++){
				BG.stroke(255);
				BG.vertex(lastX[i], lastY[i]);
			}
			BG.endShape();
		BG.pop();
		} 
		lastX.splice(0,1);
		lastY.splice(0,1);
		
		if(lives <= 0){
			gameState.state = "gameOver";
			sounds["sad"].play();
			userScore += points;
		}
		
	
	}
	
	this.startGameOver = function(){
		gameState.gameOverList.push( new Button(windX/2,2*windY/3, 300, 100, 4, "Menu", 25, color(25, 149, 173),color(161, 214, 226), color(25, 149, 173), sounds["sword"], function(){gameState.state = "menu";}));

	}
	
	this.gameOver = function(){
		BG.background(36, 48, 51, 25);
		BG.push();
			BG.fill( color(25, 149, 173));
			BG.textSize(55);
			BG.text("Game Over", windX/2, windX/2);
			BG.fill(  color(161, 214, 226));
			BG.textSize(34);
			BG.text(points.toString(), windX/2, windX/2 + 100);
		BG.pop();

		for(i=0; i < gameState.menuList.length; i++){
			gameState.gameOverList[i].show();
		}
	}
	
}


function Drops(n){
	this.list = [];
	this.n = n;
	
	////console.log("drop");
	
	this.add = function(drop){
		if(this.list.length < n){
			this.list.push(drop);
		}
	}
	
	this.update = function(){
		 for (var i = 0; i < this.list.length; i++) {
			 this.list[i].update();
		 }
	}
	
	this.show = function(){
		 for (var i = 0; i < this.list.length; i++) {
			 this.list[i].show();
		 }
	}
}

function Drop() {
  this.r;
  this.x;
  this.y;
  this.vel;
  this.velx ;
  this.val;
  this.type;
  this.active;
  this.explode;
  this.explodeTime;
  this.item;
  this.sound;
  
	this.start = function(x, y, vel, item, type, active, sound){
		this.r = 40;
		this.x = x - this.r / 2;
		this.y = y - this.r / 2;
		this.vel = vel;
		this.velx = random(-2, 2);
		this.type = type;
		this.active = active;
		this.explode = false;
		this.explodeTime = 60;
		this.item = item;
		this.sound = sound;
	}

	this.explodeNow = function(){
		this.sound.play();
		this.vel *= 0.1;
		this.velx = -0.2;
		this.explode = true;
	}
  this.show = function() {
	BG.push();
		if(this.explode){
			BG.tint(255, this.explodeTime * 4.5);  // Display at half opacity
			if(this.type == "good"){
				BG.image(smokeImage, this.x - this.r /2, this.y - this.r /2, this.r + 40 - this.explodeTime * 1.1, this.r + 40 - this.explodeTime * 1.1 );
			}else{
				BG.image(explodeImage, this.x - this.r /2, this.y - this.r /2, this.r + 40 - this.explodeTime * 1.1, this.r + 40 - this.explodeTime * 1.1 );
			}
		}else{
			BG.image(this.item.img, this.x - this.r /2, this.y - this.r /2, this.r, this.r  );
		}
	BG.pop();
  }

  this.move = function() {
	  
	 if(((this.x >= windX - 20) || (this.x <= 20)) && !this.explode){
		this.x = constrain(this.x, 21, windX - 21);
		this.velx *= -0.5;
		this.vel *= 0.9;
	}
	this.x += this.velx;

	this.y += this.vel;
  }

  this.update = function() {

	  if (this.active){
		  if(this.explode){
			 this.explodeTime--;
			 if(this.explodeTime <= 0){
				this.remove();
			 }
		  }
		this.move();
		this.show();
		this.offScreen();
	  }
  }
  
  this.offScreen = function(){
		if (this.y > bottom){
			if(this.type == "bad"){
				lives -= 1;
			}
			this.addPoints(0.1);
			this.remove();
		}
  }

  this.remove = function() {
		this.active = false;
		this.randomItem();
  }
  
  this.addPoints = function(correction){
	  //console.log("points", correction * this.item.val);
	  //sounds["chaching"].play();
	  points += correction * this.item.val;
  }
  
	 this.randomItem = function(){
		let type = "good";
		if (random(0,10) < difLevel){
			type = "bad"
			this.start(random(21, windX - 21),random(-400, -10), random(speedGeral - 1, speedGeral + 2), gameItems.bomb, type, true, sounds["bomb"]);
			return;
		}
		let tempKey = itemKeys[floor(random(0, itemKeys.length))];
		this.start(random(21, windX - 21),random(-400, -10), random(speedGeral - 1, speedGeral + 2), items[tempKey], type, true, sounds["prod"]); // trocar
	}

}

function Button(x, y, w, h, r, text, textSize, textColor, color, lineColor, sound, func){
	this.r = r;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.text = text;
	this.textSize = textSize;
	this.color = color;
	this.lineColor = lineColor;
	this.textColor = textColor;
	this.func = func;
	this.sound = sound;
	
	this.show = function(){
		BG.push();
			BG.strokeWeight(6);
			BG.stroke(this.lineColor);
			BG.fill(this.color);
			BG.rect(this.x, this.y, this.w, this.h, this.r, this.r, this.r, this.r);
			BG.noStroke();
			BG.fill(this.textColor);
			BG.textSize(this.textSize);
			BG.text(this.text, this.x, this.y + 7);
		BG.pop();
	}
	
	this.clicked = function(){
		return((mouseX > this.x - this.w/2) && (mouseX < this.x + this.w/2) && (mouseY > this.y - this.h/2) && (mouseY < this.y + this.h/2));
	}
}


function Item() {
	this.val;
	this.img;
	this.name;
	
	this.add = function(val, name, imgSource) {
		this.val = val;
		this.img = loadImage(imgSource);
		this.name = name;
	}
	
}
