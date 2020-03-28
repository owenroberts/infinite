window.random = Cool.random; /* for p5 based map */

Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true
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
let map, cols = 20, rows = 20, min = 6, cell = { w: 256, h: 256 };

const cursor = document.getElementById('cursor');
cursor.src = '/css/walk.gif';
// cursor.ondragstart = ev => ev.preventDefault();


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
	Game.scene = 'map';
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
	console.timeEnd('map');
	
	player = new Player('/drawings/sprites/skully_3f.json', Game.width/2, Game.height/2);
	// player.debug = true;

	ui = {};
	ui.metrics = {};
	ui.metrics.health = new Text(3, 6, 'Health ' + player.health, 12, Game.lettering.metrics);
	ui.metrics.morality = new Text(232, 6, 'Morality ' + player.morality, 13, Game.lettering.metrics);

	ui.cursor = { x: 0, y: 0, down: false, state: 'walk' };
	ui.arrow = new Sprite(0, 0);
	ui.arrow.addJSON(Game.data.ui.arrow);
	ui.arrow.alive = false;
	// ui.cursor = new Sprite(0, 0);
	// ui.cursor.addJSON(Game.ui.cursor);
	// ui.cursor.animation.state = 'walk';

	ui.inventoryToggle = new Toggle({
		x: 100,
		y: -90,
		func: 'toggleInventory',
		json: Game.data.ui.inventory
	});

	/* place player in random room 
		player.x player.y is actual place on map
		player.position is where it draws on screen 
	*/
	const pos = Cool.random(map.nodes.filter(node => node.room)).room;
	const _x = Cool.random(pos.x + 1, pos.x + pos.w - 2);
	const _y = Cool.random(pos.y + 1, pos.y + pos.h - 2);
	player.x = Math.round(_x * cell.w); //- Game.width/2 - cell.w/2;
	player.y = Math.round(_y * cell.h); // - Game.height/2 - cell.h/2;

	wall = new Wall(player.x + 100, player.y);
	apple = new Food(player.x + 100, player.y, Game.data.food.apple, ['apple'])
}

function update() {

	if (Game.scene == 'map') {
			player.update();

		const offset = {
			x: -player.x + Game.width/2 ,
			y: -player.y + Game.height/2 
		};
		map.update(offset);
		// wall.update(offset);
		apple.update(offset);
		
		/* detect wall collisions */
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
	if (Game.scene == 'map') map.display();
	player.display();

	if (Game.scene == 'inventory') player.inventory.display();

	for (const metric in ui.metrics) {
		ui.metrics[metric].display();
	}
	ui.arrow.display();
	ui.inventoryToggle.display();


	apple.display();
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

function toggleInventory() {
	if (Game.scene == 'map') {
		Game.scene = 'inventory';
		ui.cursor.state = 'interact';
		cursor.src = '/css/pointer.gif';
	}
	else if (Game.scene = 'inventory') {
		ui.cursor.state = 'walk';
		cursor.src = '/css/walk.gif';
		Game.scene = 'map';
	}
}

function mouseMoved(x, y) {
	ui.cursor.x = x;
	ui.cursor.y = y;

	if (ui.inventoryToggle.over(x, y)) {
		ui.cursor.state = 'interact';
		cursor.src = '/css/pointer.gif';
	}

	if (ui.inventoryToggle.out(x, y)) {
		ui.cursor.state = 'walk';
		cursor.src = '/css/walk.gif';
	}
}

function mouseDown(x, y) {
	ui.cursor.down = true;

	if (ui.inventoryToggle.down(x, y)) {
		ui.cursor.state = 'interact';
		cursor.src = '/css/click.gif';
	}
	
}

function mouseUp(x, y) {
	ui.cursor.down = false;

	ui.inventoryToggle.up(x, y);
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