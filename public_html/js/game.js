// Global constants
var PLAYGROUND_WIDTH = 480;
var PLAYGROUND_HEIGHT = 320;
var FLOOR_LEVEL = 260;
var REFRESH_RATE = 15;

var PLANE_SPEED = 10;		//	Px/frame
var OCTY_SPEED = 3;
var MISSILE_SPEED = 10;
var PLAYER_SPEED = 4;
var PLAYER_JUMP = 10;
var COIN_SPEED = 5;
var ENERGY_SPEED = 8;

// chance of appear
var PLANE_SPAWN = 0.3;
var OCTY_SPAWN = 0.8;
var COIN_SPAWN = 0.2;
var ENERGY_SPAWN = 0.3;
var PLANE_FIRE = 0.03;

// Points and damage
var PLANE_POINTS = 20;
var PLANE_DAMAGE = 40;
var OCTY_POINTS = 10;
var OCTY_DAMAGE = 20;
var COIN_POINTS = 5;
var ENERGY = 20;

var LEVEL = 1;
var LEVELUP = false;
var GOAL = 100;

// Constants for the gameplay	
var smallStarSpeed = 1; //pixels per frame
var mediumStarSpeed = 3; //pixels per frame
var bigStarSpeed = 5; //pixels per frame

// Animation holder
var playerAnimation = new Array();
var missile = new Array();
var enemies = new Array(); // There are two kind of enemies in the game "Plane" and "Octy"
var aidy = new Array();

// Game state
var playerHit = false;
var gameOver = false;

// Helper functions
// Restart the game
function restartgame() {
	window.location.reload();
}

// Explode player
function explodePlayer(playerNode) {
	playerNode.children().hide();
	playerNode.addSprite("explosion", {animation: playerAnimation["explode"], width: 50, height: 50});
	playerHit = true;
}

// Increase general speed
function speedUp(number) {
	//$("#test").html("<h5>" + number + "</h5>");
	var speed = number * 3;
	PLANE_SPEED += speed;
	OCTY_SPEED += speed;
	MISSILE_SPEED += speed;
	COIN_SPEED += speed;
	ENERGY_SPEED += speed;
	var points = number * 5;
	PLANE_POINTS += points;
	PLANE_DAMAGE += points;
	OCTY_POINTS += points;
	OCTY_DAMAGE += points;
	COIN_POINTS += points;
	ENERGY += points;
	var spawn = number * 0.1;
	PLANE_SPAWN += spawn;
	OCTY_SPAWN += (spawn+spawn);
	COIN_SPAWN += spawn;
	ENERGY_SPAWN += spawn;
	PLANE_FIRE += (spawn*spawn);
}

// Game objects:
function Player(node) {
	this.node = node;

	this.grace = false;
	this.score = 0;
	this.replay = 2;
	this.energy = 100;
	this.respawnTime = -1;

	// Add points
	this.points = function(number) {
		this.score += number;
	};

	// Damage the ship, return true if player die
	this.damage = function(number) {
		if (!this.grace) {
			this.energy -= number;

			if (this.energy <= 0) {
				return true;
			}
			return false;
		}
		return false;
	};

	// Respawn the ship, return true if Gameover
	this.respawn = function() {
		this.replay--;
		if (this.replay < 0) {
			return true;
		}

		this.grace = true;
		this.energy = 100;

		this.respawnTime = (new Date()).getTime();
		$(this.node).fadeTo(0, 0.3);
		return false;
	};

	// Check if respawn time is over
	this.update = function() {
		if ((this.respawnTime > 0) && (((new Date()).getTime() - this.respawnTime) > 3000)) {
			this.grace = false;
			$(this.node).fadeTo(500, 1);
			this.respawnTime = -1;
		}
	};

	// Gravity
	this.updateJump = function() {
		this.node.y(-PLAYER_JUMP, true);
		PLAYER_JUMP -= 0.5;
	};

	return true;
}

function Enemy(node) {
	this.node = $(node);
	this.energy = 70;
	this.speedx = 0;

	// Update enemy's position
	this.update = function() {
		this.node.x(this.speedx, true);
	};
}

function Plane(node) {
	this.node = $(node);
	Plane.prototype.speedx = -PLANE_SPEED;
}
Plane.prototype = new Enemy();

function Octy(node) {
	this.node = $(node);
	Octy.prototype.speedx = -OCTY_SPEED;
}
Octy.prototype = new Enemy();

function Aid(node) {
	this.node = $(node);
	this.speedx = 0;

	// Update aid's position
	this.update = function() {
		this.node.x(this.speedx, true);
	};
}

function Coin(node) {
	this.node = $(node);
	Coin.prototype.speedx = -COIN_SPEED;
}
Coin.prototype = new Aid();

function Energy(node) {
	this.node = $(node);
	Energy.prototype.speedx = -ENERGY_SPEED;
}
Energy.prototype = new Aid();


// ------------------------------------------
// --         the main declaration         --
// ------------------------------------------
$(function() {
	// Hide audio player
	$("#sound").hide();

	// Sets the id of the loading bar
	$.loadCallback(function(percent) {
		$("#loadingBar").width(200 * percent);
	});

	// Initialize the start button
	$("#startbutton").click(function() {
		$.playground().startGame(function() {
			$("#welcomeScreen").remove();
		});
	})

	// Aniomations declaration 
	// The background
	var background1 = new $.gQ.Animation({imageURL: "images/background1.png"});
	var background2 = new $.gQ.Animation({imageURL: "images/background2.png"});
	var background3 = new $.gQ.Animation({imageURL: "images/background3.png"});
	var background4 = new $.gQ.Animation({imageURL: "images/background4.png"});
	var background5 = new $.gQ.Animation({imageURL: "images/background5.png"});
	var background6 = new $.gQ.Animation({imageURL: "images/background6.png"});

	// Player spaceship animations
	playerAnimation["idle"] = new $.gameQuery.Animation({imageURL: "images/player_spaceship.png"});
	playerAnimation["explode"] = new $.gameQuery.Animation({imageURL: "images/player_explode.png", numberOfFrame: 4, delta: 50, rate: 200, type: $.gQ.ANIMATION_VERTICAL});
	playerAnimation["up"] = new $.gameQuery.Animation({imageURL: "images/boosterup.png", numberOfFrame: 7, delta: 14, rate: 60, type: $.gameQuery.ANIMATION_HORIZONTAL});
	playerAnimation["down"] = new $.gameQuery.Animation({imageURL: "images/boosterdown.png", numberOfFrame: 7, delta: 14, rate: 60, type: $.gameQuery.ANIMATION_HORIZONTAL});
	playerAnimation["boost"] = new $.gameQuery.Animation({imageURL: "images/booster1.png", numberOfFrame: 7, delta: 14, rate: 60, type: $.gameQuery.ANIMATION_VERTICAL});
	playerAnimation["booster"] = new $.gameQuery.Animation({imageURL: "images/booster2.png", numberOfFrame: 7, delta: 14, rate: 60, type: $.gQ.ANIMATION_VERTICAL});

	// Enemies animations
	// 1st kind
	enemies["plane"] = new Array();
	enemies["plane"]["idle"] = new $.gameQuery.Animation({imageURL: "images/plane.png", numberOfFrame: 4, delta: 42, rate: 80, type: $.gameQuery.ANIMATION_VERTICAL});
	enemies["plane"]["explode"] = new $.gameQuery.Animation({imageURL: "images/explode.png", numberOfFrame: 6, delta: 23, rate: 90, type: $.gameQuery.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});

	// 2nd kind of enemy
	enemies["octy"] = new Array();
	enemies["octy"]["idle"] = new $.gameQuery.Animation({imageURL: "images/octy.png", numberOfFrame: 4, delta: 50, rate: 200, type: $.gameQuery.ANIMATION_VERTICAL});
	enemies["octy"]["explode"] = new $.gameQuery.Animation({imageURL: "images/explode.png", numberOfFrame: 6, delta: 23, rate: 90, type: $.gameQuery.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});

	// Weapon missile
	missile["player"] = new $.gameQuery.Animation({imageURL: "images/player_missile.png", numberOfFrame: 6, delta: 10, rate: 90, type: $.gameQuery.ANIMATION_HORIZONTAL});
	missile["enemies"] = new $.gameQuery.Animation({imageURL: "images/enemy_missile.png", numberOfFrame: 6, delta: 10, rate: 90, type: $.gameQuery.ANIMATION_HORIZONTAL});
	missile["playerexplode"] = new $.gameQuery.Animation({imageURL: "images/player_missile_explode.png", numberOfFrame: 8, delta: 23, rate: 70, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK});
	missile["enemiesexplode"] = new $.gameQuery.Animation({imageURL: "images/enemy_missile_explode.png", numberOfFrame: 8, delta: 23, rate: 70, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK});

	// Aid animations
	aidy["coin"] = new Array();
	aidy["coin"]["idle"] = new $.gameQuery.Animation({imageURL: "images/coin.png", numberOfFrame: 1, delta: 0, rate: 0, type: $.gameQuery.ANIMATION_HORIZONTAL});
	aidy["coin"]["explode"] = new $.gameQuery.Animation({imageURL: "images/null.png", numberOfFrame: 6, delta: 23, rate: 90, type: $.gameQuery.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	aidy["energy"] = new Array();
	aidy["energy"]["idle"] = new $.gameQuery.Animation({imageURL: "images/energy.png", numberOfFrame: 1, delta: 0, rate: 0, type: $.gameQuery.ANIMATION_HORIZONTAL});
	aidy["energy"]["explode"] = new $.gameQuery.Animation({imageURL: "images/null.png", numberOfFrame: 6, delta: 23, rate: 90, type: $.gameQuery.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});

	// Initialize the game screen
	$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});
	$.playground()
			.addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
			.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
			.addGroup("p-MissileLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
			.addGroup("e-MissileLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
			.addGroup("aidLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
			.addGroup("overlay", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});

	// Initialize the background
	$("#background")
			.addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("background2", {animation: background2, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
			.addSprite("background3", {animation: background3, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("background4", {animation: background4, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
			.addSprite("background5", {animation: background5, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("background6", {animation: background6, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH});


	// Initialize the actors
	$("#actors")
			.addGroup("player", {posx: PLAYGROUND_WIDTH / 4, posy: FLOOR_LEVEL, width: 50, height: 50})
			.addSprite("playerBoostUp", {posx: 18, posy: 45, width: 14, height: 18})
			.addSprite("playerBody", {animation: playerAnimation["idle"], posx: 0, posy: 0, width: 50, height: 50})
			.addSprite("playerBooster", {animation: playerAnimation["boost"], posx: -32, posy: 22, width: 36, height: 14})
			.addSprite("playerBoostDown", {posx: 18, posy: -10, width: 14, height: 18});

	// Initialize player
	$("#player")[0].player = new Player($("#player"));

	// Initializr overlay
	$("#overlay").append("<div id='energyHUD'style='color: white; top: 15px; left: 15px; position: absolute; font-family: times, serif;'></div><div id='lifeHUD'style='color: white; top: 15px; left: 100px; position: absolute; right: 0px; font-family: times, serif;'></div><div id='levelHUD'style='color: white; top: 15px; left: 200px; position: absolute; right: 0px; font-family: times, serif;'></div><div id='scoreHUD'style='color: white; top: 15px; left: 400px; position: absolute; font-family: times, serif;'></div>");

	//This is for the background animation
	$.playground().registerCallback(function() {
		//Offset all the pane:
		var newPos = ($("#background1").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background1").x(newPos);

		newPos = ($("#background2").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background2").x(newPos);

		newPos = ($("#background3").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background3").x(newPos);

		newPos = ($("#background4").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background4").x(newPos);

		newPos = ($("#background5").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background5").x(newPos);

		newPos = ($("#background6").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background6").x(newPos);
	}, REFRESH_RATE);

	// Creation of enemies
	$.playground().registerCallback(function() {
		if (!gameOver) {
			if (Math.random() < PLANE_SPAWN) {
				var name = "enemy1_" + Math.ceil(Math.random() * 1000);
				$("#actors").addSprite(name, {animation: enemies["plane"]["idle"], posx: PLAYGROUND_WIDTH, posy: 30, width: 90, height: 42});
				$("#" + name).addClass("enemy");
				$("#" + name)[0].enemy = new Plane($("#" + name));
			} else if (Math.random() < OCTY_SPAWN) {
				var name = "enemy1_" + Math.ceil(Math.random() * 1000);
				$("#actors").addSprite(name, {animation: enemies["octy"]["idle"], posx: PLAYGROUND_WIDTH, posy: FLOOR_LEVEL, width: 50, height: 50});
				$("#" + name).addClass("enemy");
				$("#" + name)[0].enemy = new Octy($("#" + name));
			}
		}
	}, 1000);

	// Creation of aid
	$.playground().registerCallback(function() {
		if (!gameOver) {
			if (Math.random() < COIN_SPAWN) {
				var name = "coin_" + Math.ceil(Math.random() * 1000);
				$("#aidLayer").addSprite(name, {animation: aidy["coin"]["idle"], posx: PLAYGROUND_WIDTH, posy: 180, width: 50, height: 50});
				$("#" + name).addClass("aid");
				$("#" + name)[0].aid = new Coin($("#" + name));
			} else if (Math.random() < ENERGY_SPAWN) {
				var name = "energy_" + Math.ceil(Math.random() * 1000);
				$("#aidLayer").addSprite(name, {animation: aidy["energy"]["idle"], posx: PLAYGROUND_WIDTH, posy: 180, width: 50, height: 50});
				$("#" + name).addClass("aid");
				$("#" + name)[0].aid = new Energy($("#" + name));
			}
		}
	}, 1000);

	// Game flow/logic
	$.playground().registerCallback(function() {
		if (!gameOver) {
			$("#energyHUD").html("Energy: " + $("#player")[0].player.energy);
			$("#lifeHUD").html("Life: " + $("#player")[0].player.replay);
			$("#levelHUD").html("Level: " + LEVEL + "		Goal: " + GOAL);
			$("#scoreHUD").html("Score: " + $("#player")[0].player.score);
			//Update the movement of the ship:
			if (!playerHit) {
				$("#player")[0].player.update();
				if (jQuery.gameQuery.keyTracker[65]) { // Left (a)
					var nextpos = $("#player").x() - PLAYER_SPEED;
					if (nextpos > 0) {
						$("#player").x(nextpos);
					}
				}
				if (jQuery.gameQuery.keyTracker[68]) { // Right (d)
					var nextpos = $("#player").x() + PLAYER_SPEED;
					if (nextpos < PLAYGROUND_WIDTH - 60) {
						$("#player").x(nextpos);
					}
				}
				if ($("#player").y() >= FLOOR_LEVEL) {
					$("#player").y(FLOOR_LEVEL);
					if (jQuery.gameQuery.keyTracker[87]) { // Up (w)
						PLAYER_JUMP = 10;
						$("#player")[0].player.updateJump();
					}
				} else {
					$("#player")[0].player.updateJump();
				}
			} else {
				var posY = $("#player").y();
				var posX = $("#player").x() - 5;
				if (posX < 0) {
					//Does the player did get out of the screen?
					if ($("#player")[0].player.respawn()) {
						gameOver = true;
						$("#playground").append('<div style="position: absolute; top: 80px; left: 150px; color: white; font-family: times, serif;"><center><h1>Game Over</h1><br><a style="cursor: pointer;" id="restartbutton">Click here to restart the game!</a></center></div><div id="sound2" ><audio controls autoplay><source src="sound/b.mp3" type="audio/mpeg">Your browser does not support this audio format.</audio></div>');
						$("#sound").remove();
						$("#sound2").hide();
						$("#restartbutton").click(restartgame);
						$("#actors,#playerMissileLayer,#enemiesMissileLayer,#aidLayer").fadeTo(1000, 0);
						$("#background").fadeTo(5000, 0);
					} else {
						$("#explosion").remove();
						$("#player").children().show();
						$("#player").y(FLOOR_LEVEL);
						$("#player").x(PLAYGROUND_WIDTH / 4);
						playerHit = false;
					}
				} else {
					$("#player").y(posY);
					$("#player").x(posX);
				}
			}
			// Check score
			if ($("#player")[0].player.score >= GOAL) {
				LEVELUP = true;
				GOAL += GOAL * 1.5
			}

			// Update speed
			if (LEVELUP) {
				speedUp(LEVEL);
				LEVEL++;
				LEVELUP = false;
			}

			// Update enemies's movement
			$(".enemy").each(function() {
				var posX = $(this).x();
				if ((posX + 50) < 0) {
					$(this).remove();
					return;
				}
				this.enemy.update();
				//Test enemies's collisions
				var collided = $(this).collision("#playerBody,." + $.gQ.groupCssClass);
				if (collided.length > 0) {
					if (this.enemy instanceof Octy) {
						$(this).setAnimation(enemies["octy"]["explode"], function(node) {
							$(node).remove();
						});
						$(this).css("width", 38);
						$(this).css("height", 23);
						$(this).removeClass("enemy");
						$("#player")[0].player.points(OCTY_POINTS);
						// Player has been hit
						if ($("#player")[0].player.damage(OCTY_DAMAGE)) {
							explodePlayer($("#player"));
						}
					}
				}
				//Make enemies fire
				if (this.enemy instanceof Plane) {
					if (Math.random() < PLANE_FIRE) {
						var enemyposx = $(this).x();
						var enemyposy = $(this).y();
						var name = "e-Missile_" + Math.ceil(Math.random() * 1000);
						$("#e-MissileLayer").addSprite(name, {animation: missile["enemies"], posx: enemyposx, posy: enemyposy + 20, width: 10, height: 35});
						$("#" + name).addClass("e-Missiles");
					}
				}
			});

			// Update p-missiles's movement
			$(".p-Missiles").each(function() {
				var posY = $(this).y();
				if (posY > PLAYGROUND_HEIGHT || posY < 0) {
					$(this).remove();
					return;
				}
				$(this).y(-MISSILE_SPEED, true);
				// Test p-missiles's collisions
				var collided = $(this).collision(".enemy,." + $.gQ.groupCssClass);
				if (collided.length > 0) {
					// Enemy has been hit
					collided.each(function() {
						if (this.enemy instanceof Plane) {
							$(this).setAnimation(enemies["plane"]["explode"], function(node) {
								$(node).remove();
							});
							$(this).css("height", 23);
							$(this).css("width", 38);
							$(this).y(-7, true);
						}
						$(this).removeClass("enemy");
						$("#player")[0].player.points(PLANE_POINTS);
					});
					$(this).setAnimation(missile["playerexplode"], function(node) {
						$(node).remove();
					});
					$(this).css("width", 23);
					$(this).css("height", 38);
					$(this).y(-7, true);
					$(this).removeClass("p-Missiles");
				}
			});

			//Update e-missiles's movement
			$(".e-Missiles").each(function() {
				var posY = $(this).y();
				if (posY < 0) {
					$(this).remove();
					return;
				}
				$(this).y(MISSILE_SPEED, true);
				// Test e-missiles's collisions
				var collided = $(this).collision("#playerBody,." + $.gQ.groupCssClass);
				if (collided.length > 0) {
					// Player has been hit
					collided.each(function() {
						if ($("#player")[0].player.damage(PLANE_DAMAGE)) {
							explodePlayer($("#player"));
						}
					});
					$(this).setAnimation(missile["enemiesexplode"], function(node) {
						$(node).remove();
					});
					$(this).css("width", 23);
					$(this).css("height", 38);
					$(this).removeClass("e-Missiles");
				}
			});

			//Update aid's movement
			$(".aid").each(function() {
				var posX = $(this).x();
				if (posX < 0) {
					$(this).remove();
					return;
				}
				this.aid.update();
				//Test aid's collisions
				var collided = $(this).collision("#playerBody,." + $.gQ.groupCssClass);
				if (collided.length > 0) {
					if (this.aid instanceof Coin) {// Player got coin
						$(this).setAnimation(aidy["coin"]["explode"], function(node) {
							$(node).remove();
						});
						$(this).removeClass("aid");
						$("#player")[0].player.points(COIN_POINTS);
					} else if (this.aid instanceof Energy) {//Player got energy
						$(this).setAnimation(aidy["energy"]["explode"], function(node) {
							$(node).remove();
						});
						$(this).removeClass("aid");
						$("#player")[0].player.energy += ENERGY;
					}
				}
			});



		}
	}, REFRESH_RATE);

	//this is where the keybinding occurs
	$(document).keydown(function(e) {
		switch (e.keyCode) {
			case 13: // Shoot (Ctrl)
				var playerposx = $("#player").x();
				var playerposy = $("#player").y();
				var name = "p-Missle_" + Math.ceil(Math.random() * 1000);
				$("#p-MissileLayer").addSprite(name, {animation: missile["player"], posx: playerposx + 15, posy: playerposy - 10, width: 10, height: 35});
				$("#" + name).addClass("p-Missiles");
				break;
			case 65: // Left (a)
				$("#playerBooster").setAnimation();
				break;
			case 87: // Up (w)
				$("#playerBoostUp").setAnimation(playerAnimation["up"]);
				break;
			case 68: // Right (d)
				$("#playerBooster").setAnimation(playerAnimation["booster"]);
				break;
			case 83: // Down (s)
				$("#playerBoostDown").setAnimation(playerAnimation["down"]);
				break;
		}
	});
	//this is where the keybinding occurs
	$(document).keyup(function(e) {
		switch (e.keyCode) {
			case 65: //left (a)
				$("#playerBooster").setAnimation(playerAnimation["boost"]);
				break;
			case 87: //up (w)
				$("#playerBoostUp").setAnimation();
				break;
			case 68: //right (d)
				$("#playerBooster").setAnimation(playerAnimation["boost"]);
				break;
			case 83: //down (s)
				$("#playerBoostDown").setAnimation();
				break;
		}
	});
});