Tone.context.resume();
window.random = Cool.random; /* for p5 based map */

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
	return array;
}

const gme = new HellGame({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 24,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: false,
	scenes: ['music', 'instructions', 'map', 'message', 'loading', 'win']
});

gme.load(
	{ 
		ui: 'data/ui.json', 
		sprites: 'data/sprites.json', 
		textures: 'data/textures.json',
		items: 'data/items.csv',
		lettering: 'data/lettering.json'
	}
);


// global sinner for keeping track of sinner when giving an item
let sound;
let player, god;

// map globals ... 
let mapSize = 12;
let ratio = window.innerWidth / window.innerHeight;

let map, cellSize = { w: 256, h: 256 };

// ui globals - grafwrap is for main message
let ui;
let grafWrap = 28, leftAlign = 6, centerAlign = grafWrap * 18, packY = 260; // global ui?

const welcomeMessage = `Welcome to Infinite Hell. \nYou are in ${gme.lvlName}. \nYou are morally neutral. \n\nYou must perform a moral act to find your way to Heaven. \n\nIf you sin, you will descend further into Hell.`;

/* debugging */
let mapAlpha = 0;
let mapCellSize = 20;
document.addEventListener('keydown', ev => {
	if (ev.code == 'Equal') mapAlpha = Math.min(1, mapAlpha + 0.5);
	else if (ev.code == 'Minus') mapAlpha = Math.max(0, mapAlpha - 0.5);
	// else if (ev.code == 'Enter') ui.message.continue.onClick(); // to move message without mouse
	else if (ev.code == 'Digit1') sound.playTheme();

});

function start() {
	
	map = new HellMap(Math.round(mapSize * ratio), mapSize, mapSize / 4, mapSize / 2 - 1);
	player = new Player(gme.anims.sprites.player, gme.width / 2, gme.height / 2);

	god = new Sprite(256, gme.height / 2);
	god.center = true;
	god.addAnimation(gme.anims.sprites.god);
	gme.scenes.add(god, 'win', 'display');

	ui = new Scene();
	ui.metrics = {};

	// display current level
	const levelIcon = new UI({ x: -180, y: 22, animation: gme.anims.ui.hell_icon });
	ui.addToDisplay(levelIcon);
	
	ui.metrics.level = new UIMetric(levelIcon.x + 40, 8, () => {
		return gme.lvl.toString();
	});

	const moralityIcon = new UI({ x: -90, y: 22, animation: gme.anims.ui.morality_icon });
	moralityIcon.animation.state = 'neutral';
	ui.addToDisplay(moralityIcon);
	
	ui.metrics.morality = new UIMetric(moralityIcon.x + 40, 4, () => {
		if (player.moralityScore == 0) moralityIcon.animation.state = 'neutral';
		else if (player.moralityScore < 0) moralityIcon.animation.state = 'bad';
		else if (player.moralityScore > 0) moralityIcon.animation.state = 'good';
		return player.moralityScore.toString();
	});

	// this is where all messages go now ... 
	ui.metrics.hunger = new UIMetric(20, 28, () => {
		return player.hungerString;
	});
	ui.metrics.hunger.letters = gme.anims.lettering.messages; // use letters or lettering?

	// this is where all messages go now ... 
	ui.console = new Text(leftAlign, 8, '', grafWrap * 2, gme.anims.lettering.messages);
	ui.addToDisplay(ui.console);
	ui.console.xKey = undefined; // god damn it

	ui.message = new HellMessage(6, 40, '', grafWrap, gme.anims.lettering.messages);
	ui.message.set(welcomeMessage);
	ui.message.continue.setMsg('Press X to begin');

	/* set up music ui */
	const welcome = new Text(leftAlign, 40, 'Welcome to Infinite Hell', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(welcome);

	const yesSound = new Text(leftAlign, 80, 'Press X to start game with sound', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(yesSound);

	const noSound = new Text(leftAlign, 120, 'Press Z to start game silently', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(noSound);

	ui.console.xKey = () => { startMusic(true) };
	ui.console.zKey = () => { startMusic(false) };

	gme.scene = 'music';
}

function startMusic(withMusic) {

	gme.scene = 'message';
	if (withMusic) {
		sound = new Sound();
	}
	ui.console.xKey = loadNextMap;
	ui.console.zKey = undefined;
}

function loadNextMap() {
	gme.scene = 'loading';
	ui.message.set(`Building ${gme.lvlName} ...`);
	setTimeout(buildMap, 250);
}

function buildMap() {
	map.build(function() {
		ui.message.set('');
		gme.scene = 'map';
		console.timeEnd('map');
		if (player.died) player.reborn();
		player.spawn();
		map.addAllMapItems();
		// add items after 
		gme.setBounds('top', gme.height / 2);
		gme.setBounds('left', gme.width / 2);
		gme.setBounds('right', map.cols * cellSize.w - gme.width / 2);
		gme.setBounds('bottom', map.rows * cellSize.h - gme.height / 2);
	});
}

function update() {
	player.update();
	gme.scenes.current.update();
}

function draw() {
	gme.scenes.current.display();
	player.display();

	// ui background
	gme.ctx.fillStyle = '#2c2c2c';
	gme.ctx.fillRect(0, 0, gme.width, 40);
	ui.display();
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

	// update ui?
}

/* remove key presses */
function keyDown(key) {
	switch (key) {
		// case 'a':
		case 'left':
			player.inputKey('left', true);
			break;
		// case 'w':
		case 'up':
			player.inputKey('up', true);
			break;
		// case 'd':
		case 'right':
			player.inputKey('right', true);
			break;
		// case 's':
		case 'down':
			player.inputKey('down', true);
			break;

		case 'x':
			ui.console.xKeyDown = true;
			break;

		case 'z':
			ui.console.zKeyDown = true;
			break;
	}
}

function keyUp(key) {
	switch (key) {
		// case 'a':
		case 'left':
			player.inputKey('left', false);
			break;
		// case 'w':
		case 'up':
			player.inputKey('up', false);
			break;
		// case 'd':
		case 'right':
			player.inputKey('right', false);
			break;
		// case 's':
		case 'down':
			player.inputKey('down', false);
			break;

		case 'x':
			if (ui.console.xKeyDown && ui.console.xKey) {
				const temp = ui.console.xKey; // is this nuts?
				ui.console.xKey = undefined;
				temp();
				ui.console.setMsg('');
				ui.console.xKeyDown = false;
			}
			break;

		case 'z':
			if (ui.console.zKeyDown && ui.console.zKey) {
				const temp = ui.console.zKey; // is this nuts?
				ui.console.zKey = undefined;
				temp();
				ui.console.setMsg('');
				ui.console.zKeyDown = false;
			}
			break;
	}
}