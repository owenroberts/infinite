window.random = Cool.random; /* for p5 based map */

Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true,
	scenes: ['map', 'inventory', 'message', 'loading']
});

Object.defineProperty(Game, 'scene', {
	set: function(scene) {
		if (scene != Game._scene) {
			Game._scene = scene;
			ui.cursor.state = 'interact';
			switch(scene) {
				case 'map':
					ui.cursor.state = 'walk';
				break;
				case 'loading':
					ui.message.x = 6;
					ui.cursor.state = 'loading';
				break;
				case 'message':
					ui.message.x = 6;
				break;
				case 'inventory':
					ui.message.x = 3 * 128 + 32;
				break;
			}
			ui.arrow.alive = false;
		}
	},
	get: function() {
		return Game._scene;
	}
});

Object.defineProperty(Game, 'lvlName', {
	get: function() {
		return Game.lvl == 0 ? 'Purgatory' : `Ring of Hell ${Game.lvl}`
	}
});

// Game.lettering('drawings/letters.json');
console.time('load data');
Game.load(
	{ 
		ui: '/data/ui.json', 
		sprites: '/data/sprites.json', 
		textures: '/data/textures.json',
		food: '/data/food.csv',
		lettering: '/data/lettering.json'
	},
	Game.start
);

Game.lvl = 0;
let player;
let ui;
let map, cols = 16, rows = 16, min = 5, cell = { w: 256, h: 256 };
let grafWrap = 20;

/* debugging */
let wall;
let apple;

let mapAlpha = 0;
document.addEventListener('keydown', ev => {
	if (ev.which == 187) mapAlpha = Math.min(1, mapAlpha + 0.25);
	else if (ev.which == 189) mapAlpha = Math.max(0, mapAlpha - 0.25);
});

function start() {
	console.timeEnd('load data');
	
	Game.addLettering('metrics', Game.data.lettering.metrics);
	Game.addLettering('messages', Game.data.lettering.messages);

	Game.setBounds('top', Game.height/2);
	Game.setBounds('left', Game.width/2);
	Game.setBounds('right', cols * cell.w - Game.width/2);
	Game.setBounds('bottom', rows * cell.h - Game.height/2);

	
	map = new HellMap(cols, rows);
	
	player = new Player(Game.data.sprites.player, Game.width/2, Game.height/2);
	Game.scenes.inventory.addToDisplay(player.inventory);
	// Game.scenes.map.add(player);
	// player.debug = true;


	ui = {};
	ui.metrics = {};
	ui.metrics.level = new UIMetric(3, 6, () => {
		return Game.lvlName; 
	});
	ui.metrics.morality = new UIMetric(270, 6, () => {
		return `Morality ${player.morality}`;
	});
	ui.metrics.health = new UIMetric(540, 6, () => {
		return `Health ${player.health}`;
	});
	// hunger is message ...

	// ui.cursor = { x: 0, y: 0, down: false, state: 'walk' };
	ui.cursor = new Cursor({
		'walk': '/css/walk.gif',
		'interact': '/css/pointer.gif',
		'click': '/css/click.gif',
		'eat': '/css/mouth.gif',
		'loading': '/css/loader.gif'
	});
	ui.cursor.state = 'walk';
	// ui.cursor = new Sprite(0, 0);
	// ui.cursor.addJSON(Game.ui.cursor);
	// ui.cursor.animation.state = 'walk';


	ui.arrow = new Sprite(0, 0);
	ui.arrow.addJSON(Game.data.ui.arrow);
	ui.arrow.alive = false;
	Game.scenes.map.addToDisplay(ui.arrow);
	Game.scenes.inventory.addToDisplay(ui.arrow);
	Game.scenes.message.addToDisplay(ui.arrow);

	ui.inventoryOpen = new HellTextButton(10, -50, 'inventory', 9, Game.lettering.metrics);
	ui.inventoryOpen.onClick = function() {
		Game.scene = 'inventory';
	};
	Game.scenes.map.addUI(ui.inventoryOpen);
	
	ui.inventoryExit = new HellTextButton(100, -50, 'exit', 4, Game.lettering.metrics);
	ui.inventoryExit.onClick = function() {
		Game.scene = 'map';
		ui.message.setMsg('');
	};
	Game.scenes.inventory.addUI(ui.inventoryExit);

	ui.message = new HellMessage(6, 6 + 32 * 3, '', grafWrap, Game.lettering.messages);
	ui.message.setMsg(`Welcome to Infinite Hell. \nYou are in ${Game.lvlName}. \nYou are morally neutral. \nYou must perform a moral act you may find your way to Heaven. \nIf you sin, you will descend further into Hell.`);
	Game.scene = 'message';

	ui.message.next = function() {
		ui.message.continue.setMsg('Continue');
		Game.scene = 'loading';
		ui.message.setMsg('Building Purgatory...');
		setTimeout(buildMap, 100);
	};

	/* debugging */
	// wall = new Wall(player.x + 100, player.y);
	// apple = new Food(player.x + 100, player.y, Game.data.food.apple, ['apple'])
}

function buildMap() {
	console.time('map');
	map.build(function() {
		Game.scene = 'map';
		console.timeEnd('map');
		if (player.died) player.reborn();
		player.spawn();
	});
}


function update() {
	if (Game.scene == 'map') {
		player.update();
		const offset = {
			x: -player.x + Game.width/2 ,
			y: -player.y + Game.height/2 
		};
		Game.scenes[Game.scene].update(offset);

		let wallCollision = false;
		for (let i = 0; i < map.walls.length; i++) {
			const wall = map.walls[i];
			/* wall doesn't have collider should it? */
			if (wall.collide(player)) wallCollision = true;
		}
		if (wallCollision) player.back();
	}
}

function draw() {
	Game.scenes[Game.scene].display();
	player.display();
	// apple.display();
}

function keyDown(key) {
	switch (key) {
		case 'a':
		case 'left':
			player.inputKey('left', true);
			break;
		case 'w':
		case 'up':
			player.inputKey('up', true);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', true);
			break;
		case 's':
		case 'down':
			player.inputKey('down', true);
			break;

		case 'e':
			// socket.emit('key interact', true);
			break;
	}
}

function keyUp(key) {
	switch (key) {
		case 'a':
		case 'left':
			player.inputKey('left', false);
			break;
		case 'w':
		case 'up':
			player.inputKey('up', false);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', false);
			break;
		case 's':
		case 'down':
			player.inputKey('down', false);
			break;

		case 'e':
			// socket.emit('key interact', false);
			break;
	}
}

// function mouseClick(x, y) {
// 	console.log(player.position.x - x, player.position.y - y);
// }

function mouseMoved(x, y) {
	ui.cursor.x = x;
	ui.cursor.y = y;
	Game.scenes[Game.scene].uiOver(x, y);
}

function mouseDown(x, y) {
	ui.cursor.down();
	Game.scenes[Game.scene].uiDown(x, y);
}

function mouseUp(x, y) {
	ui.cursor.up();
	Game.scenes[Game.scene].uiUp(x, y);
}

/* re fuck ing work thi
	use document instead of canvas in Events
	test other shit
*/
document.addEventListener('mousedown', function(ev) {
	if (ui.cursor.state == 'walk')
		player.setTarget(ev.pageX - player.position.x, ev.pageY - player.position.y);
}, false);

Game.canvas.addEventListener('mousemove', function(ev) {
	cursor.style.left = `${ev.offsetX}px`;
	cursor.style.top = `${ev.offsetY}px`;
}, false);