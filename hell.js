window.random = Cool.random; /* for p5 based map */

Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: false
});

// Game.lettering('drawings/letters.json');
console.time('load game');
Game.load(
	{ 
		ui: '/data/ui.json', 
		sprites: '/data/sprites.json', 
		textures: '/data/textures.json',
		food: '/data/food.csv'
	},
	Game.start
);

let player;
let ui;
let map, cols = 20, rows = 20, min = 6, cell = { w: 256, h: 256 };
let wall;
Game.lvl = 0;

/* debugging */
let mapAlpha = 0;
document.addEventListener('keydown', ev => {
	if (ev.which == 187) mapAlpha = Math.min(1, mapAlpha + 0.25);
	else if (ev.which == 189) mapAlpha = Math.max(0, mapAlpha - 0.25);
});

function start() {
	console.timeEnd('load game');
	Game.scene = 'map';
	Game.addLettering('/drawings/lettering/messages.json', 'messages');
	Game.addLettering('/drawings/lettering/metrics.json', 'metrics');

	Game.setBounds('top', -cell.h/2);
	Game.setBounds('left', -cell.w/2);
	Game.setBounds('right', cols * cell.w - cell.w/2);
	Game.setBounds('bottom', rows * cell.h - cell.h/2);

	console.time('map');
	map = new HellMap(cols, rows);
	map.setup();
	map.addFood();
	console.timeEnd('map');
	
	player = new Player('/drawings/sprites/skully_3f.json', Game.width/2, Game.height/2);
	// player.debug = true;

	ui = {};
	ui.metrics = {};
	ui.metrics.health = new Text(3, 6, 'Health ' + player.health, 12, Game.lettering.metrics);
	ui.metrics.morality = new Text(232, 6, 'Morality ' + player.morality, 13, Game.lettering.metrics);

	ui.cursor = new Sprite(0, 0);
	ui.cursor.addJSON(Game.ui.cursor);
	ui.cursor.animation.state = 'walk';

	/* place player in random room */
	const pos = Cool.random(map.nodes.filter(node => node.room)).room;
	const _x = Cool.random(pos.x + 1, pos.x + pos.w - 2);
	const _y = Cool.random(pos.y + 1, pos.y + pos.h - 2);
	player.x = _x * cell.w; //- Game.width/2 - cell.w/2;
	player.y = _y * cell.h; // - Game.height/2 - cell.h/2;

}

function update() {
	
	player.update();
	
	/* detect wall collisions */
	let wallCollision = false;
	for (let i = 0; i < map.walls.length; i++) {
		const wall = map.walls[i];
		// if (player.collide(wall.scaled())) wallCollision = true;
	}


	if (wallCollision) player.back();
	
	const offset = {
		x: -player.x + Game.width/2 + player.width/2,
		y: -player.y + Game.height/2 + player.height/2
	};
	map.update(offset);
	// apple.update(offset);
}

function draw() {
	map.display();
	// wall.display();
	player.display();

	// apple.display();

	for (const metric in ui.metrics) {
		ui.metrics[metric].display();
	}

	ui.cursor.display();
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

function mouseClicked(x, y) {
}

function mouseMoved(x, y) {
	ui.cursor.position.x = x - ui.cursor.width/2;
	ui.cursor.position.y = y - ui.cursor.height/2;
}