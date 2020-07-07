window.random = Cool.random; /* for p5 based map */

const gme = new HellGame({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true,
	scenes: ['map', 'pack', 'message', 'loading', 'win']
});

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

let player, pack;
let ui;
let map, cols = 30, rows = 30, minNodeSize = 8, maxNodeSize = 14, cell = { w: 256, h: 256 };
let grafWrap = 28, leftAlign = 6, centerAlign = 3 * 128 + 32, packY = 260; // global ui?
let god;

const welcomeMessage = `Welcome to Infinite Hell. \nYou are in ${gme.lvlName}. \nYou are morally neutral. \n\nYou must perform a moral act to find your way to Heaven. \n\nIf you sin, you will descend further into Hell.`;

/* debugging */
let wall;
let apple;

let mapAlpha = 0;
let mapCellSize = 20;
document.addEventListener('keydown', ev => {
	if (ev.code == 'Equal') mapAlpha = Math.min(1, mapAlpha + 0.5);
	else if (ev.code == 'Minus') mapAlpha = Math.max(0, mapAlpha - 0.5);
	else if (ev.code == 'Enter') ui.message.continue.onClick(); // to move message without mouse
});

function start() {

	gme.setBounds('top', gme.height / 2);
	gme.setBounds('left', gme.width / 2);
	gme.setBounds('right', cols * cell.w - gme.width / 2);
	gme.setBounds('bottom', rows * cell.h - gme.height / 2);
	
	map = new HellMap(cols, rows, minNodeSize, maxNodeSize);
	player = new Player(gme.anims.sprites.player, gme.width / 2, gme.height / 2);

	pack = new Pack();

	god = new Sprite(256, gme.height / 2);
	god.center = true;
	god.addAnimation(gme.anims.sprites.god);
	gme.scenes.add(god, 'win', 'display');

	ui = {};
	ui.metrics = {};

	// display current level
	ui.metrics.levelIcon = new UI({ x: 20, y: 22, animation: gme.anims.ui.hell_icon});
	gme.scenes.add(ui.metrics.levelIcon, ['map', 'pack', 'message'], 'display'); // json data?
	ui.metrics.level = new UIMetric(30, 8, () => {
		return ''+gme.lvl; 
	});

	// liked this as blue
	ui.metrics.hunger = new UIMetric(96, 8, () => {
		return player.hungerString;
	}, );
	ui.metrics.hunger.letters = gme.anims.lettering.messages; // use letters or lettering?


	// ui.metrics.morality = new UIMetric(270, 6, () => {
	// 	return `Morality ${player.morality}`;
	// });
	// ui.metrics.health = new UIMetric(540, 6, () => {
	// 	return `Health ${player.health}`;
	// });
	// hunger is message ...

	// ui.cursor = { x: 0, y: 0, down: false, state: 'walk' };
	// like Manager with callback ... 
	// cursor generic function and HellCursor?
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
	gme.scenes.add(ui.arrow, ['map', 'pack', 'message', 'win'], 'display');

	ui.packToggle = new HellToggle({ x: 72, y: 22, animation: gme.anims.ui.pack_icon, onClick: toggled => {
		if (toggled) gme.scene = 'pack';
		else {
			gme.scene = 'map';
			ui.message.set('');
		}
	} });
	gme.scenes.add(ui.packToggle, ['map', 'pack'], 'ui');

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
		map.addHellsGate();
	});
}

function update() {
	player.update();
	gme.scenes.current.update();
}

function draw() {
	gme.scenes.current.display();
	player.display();
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

/* remove key presses */
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

function mouseMoved(x, y) {
	ui.cursor.x = x; // for ui taps
	ui.cursor.y = y;
	gme.scenes.current.mouseMoved(x, y);

	// css image cursor
	cursor.style.left = `${x}px`;
	cursor.style.top = `${y}px`;
}

function mouseDown(x, y) {
	ui.cursor.down();
	gme.scenes.current.mouseDown(x, y);

	// cursor changes after uiDown from scene, prevents character from walking when ui clicked
	if (ui.cursor.state == 'walk')
		player.setTarget(x - player.position.x, y - player.position.y);
}

function mouseUp(x, y) {
	ui.cursor.up();
	gme.scenes.current.mouseUp(x, y);
}
