window.random = Cool.random; /* for p5 based map */

Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true,
	scenes: ['map', 'inventory', 'message']
});

Object.defineProperty(Game, 'scene', {
	set: function(scene) {
		if (scene != Game._scene) {
			Game._scene = scene;
			ui.cursor.state = scene == 'map' ? 'walk' : 'interact';
			ui.arrow.alive = false;
			ui.message.x = scene == 'message' ? 6 : 3 * 128 + 32;
		}
	},
	get: function() {
		return Game._scene;
	}
});

// Game.lettering('drawings/letters.json');
console.time('load game');
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
	console.timeEnd('load game');
	
	Game.addLettering('metrics', Game.data.lettering.metrics);
	Game.addLettering('messages', Game.data.lettering.messages);

	Game.setBounds('top', Game.height/2);
	Game.setBounds('left', Game.width/2);
	Game.setBounds('right', cols * cell.w - Game.width/2);
	Game.setBounds('bottom', rows * cell.h - Game.height/2);

	console.time('map');
	map = new HellMap(cols, rows);
	map.setup();
	map.addFood();
	Game.scenes.map.add(map);
	console.timeEnd('map');
	
	player = new Player(Game.data.sprites.player, Game.width/2, Game.height/2);
	Game.scenes.inventory.addToDisplay(player.inventory);
	// Game.scenes.map.add(player);
	// player.debug = true;

	/* place player in random room 
		player.x player.y is actual place on map
		player.position is where it draws on screen 
	*/
	const pos = Cool.random(map.nodes.filter(node => node.room)).room;
	// console.log(pos);

	const minX = pos.x * cell.w + player.width;
	const maxX = (pos.x + pos.w) * cell.h - player.width * 2;
	const minY = pos.y * cell.h + player.height;
	const maxY = (pos.y + pos.h) * cell.h - player.height * 2;

	player.x = Cool.random(minX, maxX); 
	player.y = Cool.random(minY, maxY); 

	// console.log(player.x, player.y);

	ui = {};
	ui.metrics = {};
	ui.metrics.level = new UIMetric(3, 6, () => {
		return Game.lvl == 0 ? 'Purgatory' : `${Game.lvl} ring of Hell`; 
	});
	ui.metrics.morality = new UIMetric(200, 6, () => {
		return `Morality ${player.morality}`;
	});
	ui.metrics.health = new UIMetric(450, 6, () => {
		return `Health ${player.health}`;
	});
	// hunger is message ...

	const introMessage = 'Welcome to Purgatory. \nYou are morally neutral. \nYou must perform a moral act you may find your way to Heaven. \nIf you sin, you will descend further into Hell.';
	ui.message = new HellMessage(6, 6 + 32 * 3, '', grafWrap, Game.lettering.messages);
	ui.message.setMsg(introMessage);
	Game.scenes.message.addToDisplay(ui.message);
	Game.scenes.inventory.addToDisplay(ui.message);

	// ui.cursor = { x: 0, y: 0, down: false, state: 'walk' };
	ui.cursor = new Cursor({
		'walk': '/css/walk.gif',
		'interact': '/css/pointer.gif',
		'click': '/css/click.gif',
		'eat': '/css/mouth.gif'
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

	ui.inventoryOpen = new HellButton({
		x: 100,
		y: -50,
		json: Game.data.ui.inventory,
		onClick: function() {
			Game.scene = 'inventory';
		}
	});
	Game.scenes.map.addUI(ui.inventoryOpen);
	/* need something just checking the cursor state */
	
	ui.inventoryExit = new HellButton({
		x: 100,
		y: -50,
		json: Game.data.ui.exit,
		onClick: function() {
			Game.scene = 'map';
			ui.message.setMsg('');
		}
	});
	Game.scenes.inventory.addUI(ui.inventoryExit);

	Game.scene = 'message';


	/* debugging */
	// wall = new Wall(player.x + 100, player.y);
	// apple = new Food(player.x + 100, player.y, Game.data.food.apple, ['apple'])
}

function update() {
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