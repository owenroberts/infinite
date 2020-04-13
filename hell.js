window.random = Cool.random; /* for p5 based map */

const gme = new Game({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true,
	scenes: ['map', 'inventory', 'message', 'loading', 'win']
});

Object.defineProperty(gme, 'scene', {
	set: function(scene) {
		if (scene != gme._scene) {
			gme._scene = scene;
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
			ui.arrow.isActive = false;
		}
	},
	get: function() {
		return gme._scene;
	}
});

Object.defineProperty(gme, 'lvlName', {
	get: function() {
		return gme.lvl == 0 ? 'Purgatory' : `Ring of Hell ${gme.lvl}`
	}
});

console.time('load data');
gme.load(
	{ 
		ui: 'data/ui.json', 
		sprites: 'data/sprites.json', 
		textures: 'data/textures.json',
		food: 'data/food.csv',
		scripture: 'data/scripture.csv',
		lettering: 'data/lettering.json'
	}
);

gme.lvl = 0;
let player, inventory;
let ui;
let map, cols = 30, rows = 30, minNodeSize = 8, maxNodeSize = 14, cell = { w: 256, h: 256 };
let grafWrap = 28, leftAlign = 6, centerAlign = 3 * 128 + 32, inventoryY = 260; // global ui?
let god;

const welcomeMessage = `Welcome to Infinite Hell. \nYou are in ${gme.lvlName}. \nYou are morally neutral. \n\nYou must perform a moral act to find your way to Heaven. \n\nIf you sin, you will descend further into Hell.`;

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
	
	gme.addLettering('metrics');
	gme.addLettering('messages');

	gme.setBounds('top', gme.height/2);
	gme.setBounds('left', gme.width/2);
	gme.setBounds('right', cols * cell.w - gme.width/2);
	gme.setBounds('bottom', rows * cell.h - gme.height/2);
	
	map = new HellMap(cols, rows, minNodeSize, maxNodeSize);
	
	player = new Player(gme.anims.sprites.player, gme.width/2, gme.height/2);
	inventory = new Inventory();
	gme.scenes.inventory.add(inventory);

	god = new Sprite(256, gme.height/2);
	god.center = true;
	god.addAnimation(gme.anims.sprites.god);
	gme.scenes.win.addToDisplay(god);

	ui = {};
	ui.metrics = {};
	ui.metrics.level = new UIMetric(3, 6, () => {
		return gme.lvlName; 
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

	ui.arrow = new Sprite(0, 0);
	ui.arrow.addAnimation(gme.anims.ui.arrow);
	ui.arrow.isActive = false;
	gme.scenes.map.addToDisplay(ui.arrow);
	gme.scenes.inventory.addToDisplay(ui.arrow);
	gme.scenes.message.addToDisplay(ui.arrow);
	gme.scenes.win.addToDisplay(ui.arrow);

	ui.inventoryOpen = new HellTextButton(750, 6, 'inventory', gme.anims.lettering.metrics);
	ui.inventoryOpen.onClick = function() {
		gme.scene = 'inventory';
	};
	gme.scenes.map.addToDisplay(ui.inventoryOpen);
	gme.scenes.map.addToUI(ui.inventoryOpen);
	
	ui.inventoryExit = new HellTextButton(750, 6, 'exit', gme.anims.lettering.metrics);
	ui.inventoryExit.onClick = function() {
		gme.scene = 'map';
		ui.message.set('');
	};
	gme.scenes.inventory.addToDisplay(ui.inventoryExit);
	gme.scenes.inventory.addToUI(ui.inventoryExit);

	ui.message = new HellMessage(6, 6 + 32 * 3, '', grafWrap, gme.anims.lettering.messages);
	ui.message.debug = true;
	ui.message.set(welcomeMessage);
	gme.scene = 'message';

	ui.message.next = loadNextMap;
	// loadNextMap();
}

function loadNextMap() {
	ui.message.continue.setMsg('Continue');
	gme.scene = 'loading';
	ui.message.set(`Building ${gme.lvlName} ...`);
	setTimeout(buildMap, 100);
}

function buildMap() {
	console.time('map');
	map.build(function() {
		ui.message.set('');
		gme.scene = 'map';
		console.timeEnd('map');
		if (player.died) player.reborn();
		player.spawn();
	});
}

function update() {
	if (gme.scene == 'map') {
		player.update();
		const offset = {
			x: -player.x + gme.width/2 ,
			y: -player.y + gme.height/2 
		};
		gme.scenes[gme.scene].update(offset);

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
	gme.scenes[gme.scene].display();
	player.display();
	// apple.display();
}

function sizeCanvas() {

	gme.width = window.innerWidth;
	gme.height = window.innerHeight;
	gme.canvas.width = window.innerWidth * gme.dpr;
	gme.canvas.height =  window.innerHeight * gme.dpr;
	gme.ctx.scale(gme.dpr, gme.dpr);
	gme.canvas.style.zoom = 1 / gme.dpr;
	gme.ctx.miterLimit = 1;
	gme.ctxStrokeColor = undefined;

	player.position.x = gme.width/2;
	player.position.y = gme.height/2;
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
	gme.scenes[gme.scene].mouseMoved(x, y);
}

function mouseDown(x, y) {
	ui.cursor.down();
	gme.scenes[gme.scene].mouseDown(x, y);
}

function mouseUp(x, y) {
	ui.cursor.up();
	gme.scenes[gme.scene].mouseUp(x, y);
}

/* re fuck ing work thi
	use document instead of canvas in Events
	test other shit
*/
document.addEventListener('mousedown', function(ev) {
	if (ui.cursor.state == 'walk')
		player.setTarget(ev.pageX - player.position.x, ev.pageY - player.position.y);
}, false);

gme.canvas.addEventListener('mousemove', function(ev) {
	cursor.style.left = `${ev.offsetX}px`;
	cursor.style.top = `${ev.offsetY}px`;
}, false);