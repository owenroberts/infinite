// Tone.context.resume();
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
	dps: 24,
	width: 1280,
	height: 720,
	mixedColors: true,
	checkRetina: true,
	debug: true,
	stats: true,
	scenes: ['music', 'instructions', 'map', 'message', 'loading', 'win']
});

gme.load({ 
	ui: 'data/ui.json', 
	sprites: 'data/sprites.json', 
	textures: 'data/textures.json',
	items: 'data/items.csv',
	lettering: 'data/lettering.json'
});


// global sinner for keeping track of sinner when giving an item
let sound;
let player, god;

let map, cellSize = { w: 256, h: 256 };

// ui globals - grafwrap is for main message
let ui;
let grafWrap = 28, leftAlign = 6, centerAlign = grafWrap * 18, packY = 260; // global ui?

const welcomeMessage = `You are in ${gme.lvlName}. \nYou are morally neutral. \n\nYou must perform a moral act to find your way to Heaven. \n\nIf you sin, you will descend further into Hell.`;

/* debugging */
let mapAlpha = 0;
let mapCellSize = 20;
document.addEventListener('keydown', ev => {
	if (ev.code == 'Equal') mapAlpha = Math.min(1, mapAlpha + 0.5);
	else if (ev.code == 'Minus') mapAlpha = Math.max(0, mapAlpha - 0.5);
	// else if (ev.code == 'Enter') ui.message.continue.onClick(); // to move message without mouse
});

function start() {
	
	map = new HellMap(12);
	player = new Player(gme.anims.sprites.player, gme.width / 2, gme.height / 2);

	god = new Sprite(256, gme.height / 2);
	god.center = true;
	god.addAnimation(gme.anims.sprites.god);
	gme.scenes.add(god, 'win', 'display');

	const movementInstuctions = new Sprite(gme.width / 2 + 150, gme.height / 2 - 100)
	movementInstuctions.addAnimation(gme.anims.ui.instructions_movement);
	gme.scenes.instructions.addToDisplay(movementInstuctions);


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
	ui.console = new Text(leftAlign, 4, '', grafWrap * 2, gme.anims.lettering.console);
	ui.addToDisplay(ui.console);
	ui.console.letters.override.color = '#9cf29b';
	ui.console.xKey = undefined; // god damn it

	ui.message = new HellMessage(6, 64, '', grafWrap, gme.anims.lettering.messages);
	ui.message.set(welcomeMessage);
	ui.message.continue.setMsg('Press X to begin');

	const border = new Texture({ frame: 'randomIndex', animation: gme.anims.ui.border });
	for (let x = 0; x < gme.width; x += gme.anims.ui.border.width) {
		border.addLocation(x, 32);
	}
	ui.addToDisplay(border);

	/* set up music ui */
	const welcome = new Text(leftAlign, 152, 'Welcome to Infinite Hell', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(welcome);

	const yesSound = new Text(leftAlign, 192, 'Press X to start game with sound', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(yesSound);

	const noSound = new Text(leftAlign, 232, 'Press Z to start game silently', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(noSound);

	ui.console.xKey = () => { startMusic(true) };
	ui.console.zKey = () => { startMusic(false) };

	gme.scene = 'music';
}

function startMusic(withMusic) {
	gme.scene = 'instructions';
	if (withMusic) {
		sound = new Sound();
		player.soundSetup();
	}
	ui.console.xKey = function() {
		player.playSFX('gate');
		loadNextMap();
	};
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

function update(timeElapsed) {
	player.update(timeElapsed / gme.dps);
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

// function sizeCanvas() {

// 	gme.width = window.innerWidth;
// 	gme.height = window.innerHeight;
// 	gme.canvas.width = window.innerWidth * gme.dpr;
// 	gme.canvas.height =  window.innerHeight * gme.dpr;
// 	gme.ctx.scale(gme.dpr, gme.dpr);
// 	gme.canvas.style.zoom = 1 / gme.dpr;
// 	gme.ctx.miterLimit = 1;
// 	gme.ctxStrokeColor = undefined;

// 	player.position.x = gme.width/2;
// 	player.position.y = gme.height/2;

// 	// update ui?
// }

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

window.addEventListener("keydown", function(ev) {
	if ([37, 38, 39, 40].includes(ev.which)) ev.preventDefault();
}, false);