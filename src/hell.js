// Tone.context.resume();
window.random = Cool.random; /* for p5 based map */

const gme = new HellGame({
	dps: 24,
	width: 960,
	height: 720,
	zoom: 1.25,
	multiColor: true,
	checkRetina: true,
	// debug: true,
	// stats: true,
	scenes: ['music', 'instructions', 'map', 'message', 'loading', 'win'],
	events: ['keyboard']
});

// iframe fix -- fucking itch bullshit
const title = document.getElementById('title');
function loadingAnimation() {
	let t = '~' + title.textContent + '~';
	title.textContent = t;
}

let loadingInterval;
if (window.parent !== window) {
	console.log('iframe detected');

	title.style.display = 'none';
	const startButton = document.createElement('button');
	startButton.textContent = 'start infinite hell';
	document.getElementById('splash').appendChild(startButton);
	startButton.onclick = function() {
		startButton.remove();
		title.style.display = 'block';
		loadingInterval = setInterval(loadingAnimation, 1000 / 12);
		andLoad();
	}
} else {
	loadingInterval = setInterval(loadingAnimation, 1000 / 12);
	andLoad();
}

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


function andLoad() {
	gme.load({ 
		ui: 'data/ui.json', 
		sprites: 'data/sprites.json', 
		textures: 'data/textures.json',
		items: 'data/items.csv',
		lettering: 'data/lettering.json'
	});
}


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

gme.start = function() {
	document.getElementById('splash').remove();

	map = new HellMap(12);
	player = new Player(gme.anims.sprites.player, gme.view.halfWidth, gme.view.halfHeight);

	god = new Sprite(256, gme.view.halfHeight);
	god.center = true;
	god.addAnimation(gme.anims.sprites.god);
	gme.scenes.add(god, 'win', 'display');

	const movementInstuctions = new Sprite(gme.view.halfWidth + 150, gme.view.halfHeight - 100)
	movementInstuctions.addAnimation(gme.anims.ui.instructions_movement);
	gme.scenes.instructions.addToDisplay(movementInstuctions);


	ui = new Scene();
	ui.metrics = {};

	// display current level
	const levelIcon = new UI({ x: -150, y: 22, animation: gme.anims.ui.hell_icon });
	ui.addToDisplay(levelIcon);
	
	ui.metrics.level = new UIMetric(levelIcon.x + 40, 8, () => {
		return gme.lvl.toString();
	});

	const moralityIcon = new UI({ x: -60, y: 22, animation: gme.anims.ui.morality_icon });
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
	// ui.message.continue.setMsg('Press X to begin');

	const border = new Texture({ frame: 'randomIndex', animation: gme.anims.ui.border });
	for (let x = 0; x < gme.width; x += gme.anims.ui.border.width) {
		border.addLocation(x, 42);
	}
	ui.addToDisplay(border);

	/* set up music ui */
	const welcome = new Text(leftAlign, 152, 'Welcome to Infinite Hell', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(welcome);

	const yesSound = new Text(leftAlign, 192, 'Press X to start game with sound', grafWrap, gme.anims.lettering.messages);
	// yesSound.letters.override.color = '#9cf29b';
	gme.scenes.music.addToDisplay(yesSound);

	const noSound = new Text(leftAlign, 232, 'Press Z to start game silently', grafWrap, gme.anims.lettering.messages);
	gme.scenes.music.addToDisplay(noSound);

	ui.console.xKey = () => { startMusic(true) };
	ui.console.zKey = () => { startMusic(false) };

	gme.scene = 'music';
};

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
	ui.console.setMsg('Press X to begin');
}

function loadNextMap() {
	gme.scene = 'loading';
	ui.message.set(`Building ${gme.lvlName} ...`);
	setTimeout(buildMap, 250); // wait a second but its actually fast
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
		gme.setBounds('top', gme.view.halfHeight);
		gme.setBounds('left', gme.view.halfWidth);
		gme.setBounds('right', map.cols * cellSize.w - gme.view.halfWidth);
		gme.setBounds('bottom', map.rows * cellSize.h - gme.view.halfHeight);
	});
}

gme.update = function(timeElapsed) {
	player.update(timeElapsed / gme.dps);
	gme.scenes.current.update();
};

gme.draw = function() {
	gme.scenes.current.display();
	player.display();

	// ui background
	gme.ctx.fillStyle = '#2c2c2c';
	gme.ctx.fillRect(0, 0, gme.view.width, 50);
	ui.display();
};


/* remove key presses */
gme.keyDown = function(key) {
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

		case 'x':
			ui.console.xKeyDown = true;
			break;

		case 'z':
			ui.console.zKeyDown = true;
			break;
	}
};

gme.keyUp = function(key) {
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

		case 'x':
			if (ui.console.xKeyDown && ui.console.xKey) {
				const temp = ui.console.xKey; // is this nuts?
				ui.console.xKey = undefined;
				
				ui.console.setMsg('');
				ui.console.xKeyDown = false;
				temp(); // might fuck things up ??
			}
			break;

		case 'z':
			if (ui.console.zKeyDown && ui.console.zKey) {
				const temp = ui.console.zKey; // is this nuts?
				ui.console.zKey = undefined;
				
				ui.console.setMsg('');
				ui.console.zKeyDown = false;
				temp(); // might fuck things up ??
			}
			break;
	}
};

// itch fix
window.addEventListener("keydown", function(ev) {
	if ([37, 38, 39, 40].includes(ev.which)) ev.preventDefault();
}, false);