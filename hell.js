window.random = Cool.random; /* for p5 based map */

Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: false,
	scenes: ['map', 'inventory', 'message', 'loading', 'win']
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
					ui.message.x = leftAlign;
					ui.cursor.state = 'loading';
				break;
				case 'message':
					ui.message.x = leftAlign;
				break;
				case 'inventory':
					ui.message.x = centerAlign;
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

console.time('load data');
Game.load(
	{ 
		ui: 'data/ui.json', 
		sprites: 'data/sprites.json', 
		textures: 'data/textures.json',
		food: 'data/food.csv',
		scripture: 'data/scripture.csv',
		lettering: 'data/lettering.json'
	},
	Game.start
);

Game.lvl = 0;
let player, inventory;
let ui;
let map, cols = 20, rows = 20, minNodeSize = 5, maxNodeSize = 10, cell = { w: 256, h: 256 };
let grafWrap = 20, leftAlign = 6, centerAlign = 3 * 128 + 32, inventoryY = 260; // global ui?
let god;

/* debugging */
let wall;
let apple;

let mapAlpha = 0;
document.addEventListener('keydown', ev => {
	if (ev.which == 187) mapAlpha = Math.min(1, mapAlpha + 0.5);
	else if (ev.which == 189) mapAlpha = Math.max(0, mapAlpha - 0.5);
});

function start() {
	console.timeEnd('load data');
	
	Game.addLettering('metrics', Game.data.lettering.metrics);
	Game.addLettering('messages', Game.data.lettering.messages);

	Game.setBounds('top', Game.height/2);
	Game.setBounds('left', Game.width/2);
	Game.setBounds('right', cols * cell.w - Game.width/2);
	Game.setBounds('bottom', rows * cell.h - Game.height/2);
	
	map = new HellMap(cols, rows, minNodeSize, maxNodeSize);
	
	player = new Player(Game.data.sprites.player, Game.width/2, Game.height/2);
	inventory = new Inventory();
	Game.scenes.inventory.add(inventory);

	god = new Sprite(256, Game.height/2);
	god.center = true;
	god.addJSON(Game.data.sprites.god);
	Game.scenes.win.addToDisplay(god);

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
		'walk': 'css/walk.gif',
		'interact': 'css/pointer.gif',
		'click': 'css/click.gif',
		'eat': 'css/mouth.gif',
		'loading': 'css/loader.gif'
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
	Game.scenes.win.addToDisplay(ui.arrow);

	ui.inventoryOpen = new HellTextButton(750, 6, 'inventory', Game.lettering.metrics);
	ui.inventoryOpen.onClick = function() {
		Game.scene = 'inventory';
	};
	Game.scenes.map.addToDisplay(ui.inventoryOpen);
	Game.scenes.map.addToUI(ui.inventoryOpen);
	
	ui.inventoryExit = new HellTextButton(750, 6, 'exit', Game.lettering.metrics);
	ui.inventoryExit.onClick = function() {
		Game.scene = 'map';
		ui.message.setMsg('');
	};
	Game.scenes.inventory.addToDisplay(ui.inventoryExit);
	Game.scenes.inventory.addToUI(ui.inventoryExit);

	ui.message = new HellMessage(6, 6 + 32 * 3, '', grafWrap, Game.lettering.messages);
	ui.message.setMsg(`Welcome to Infinite Hell. \nYou are in ${Game.lvlName}. \nYou are morally neutral. \nYou must perform a moral act you may find your way to Heaven. \nIf you sin, you will descend further into Hell.`);
	Game.scene = 'message';

	ui.message.next = loadNextMap;

	/* debugging */
	// wall = new Wall(player.x + 100, player.y);
	// apple = new HellItem(player.x + 100, player.y, Game.data.food.apple, ['apple'])
}

function loadNextMap() {
	ui.message.continue.setMsg('Continue');
	Game.scene = 'loading';
	ui.message.setMsg(`Building ${Game.lvlName} ...`);
	setTimeout(buildMap, 100);
}

function buildMap() {
	console.time('map');
	map.build(function() {
		ui.message.setMsg('');
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

function sizeCanvas() {

	Game.width = window.innerWidth;
	Game.height = window.innerHeight;
	Game.canvas.width = window.innerWidth * Game.dpr;
	Game.canvas.height =  window.innerHeight * Game.dpr;
	Game.ctx.scale(Game.dpr, Game.dpr);
	Game.canvas.style.zoom = 1 / Game.dpr;
	Game.ctx.miterLimit = 1;
	Game.ctxStrokeColor = undefined;

	player.position.x = Game.width/2;
	player.position.y = Game.height/2;
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
	Game.scenes[Game.scene].mouseMoved(x, y);
}

function mouseDown(x, y) {
	ui.cursor.down();
	Game.scenes[Game.scene].mouseDown(x, y);
}

function mouseUp(x, y) {
	ui.cursor.up();
	Game.scenes[Game.scene].mouseUp(x, y);
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