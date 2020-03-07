window.random = Cool.random; /* for p5 based map */


Game.init({
	width: window.innerWidth,
	height: window.innerHeight,
	lps: 10,
	mixedColors: true,
	checkRetina: true
});

// Game.lettering('drawings/letters.json');

Game.load(
	{ 
		ui: '/data/ui.json', 
		sprites: '/data/sprites.json', 
		textures: '/data/textures.json' 
	},
	Game.start
);

let player;
let map, cols = 20, rows = 20, min = 10, cell = { w: 256, h: 256 };

/* debugging */
let mapAlpha = 0.5;
document.addEventListener('keydown', ev => {
	if (ev.which == 187) mapAlpha = Math.min(1, mapAlpha + 0.25);
	else if (ev.which == 189) mapAlpha = Math.max(0, mapAlpha - 0.25);
})

function start() {
	Game.scene = 'map';

	Game.setBounds('top', -cell.h/2);
	Game.setBounds('left', -cell.w/2);
	Game.setBounds('right', cols * cell.w - Game.width - cell.w/2);
	Game.setBounds('bottom', rows * cell.h - Game.height - cell.h/2);

	map = new Map(cols, rows);
	
	player = new Player('/drawings/sprites/skully_2.json', Game.width/2, Game.height/2);

	const pos = Cool.random(map.nodes.filter(node => node.room)).room;
	console.log(pos);
	const _x = Cool.random(pos.x + 1, pos.x + pos.w - 2);
	const _y = Cool.random(pos.y + 1, pos.y + pos.h - 2);
	console.log(_x, _y);
	player.x = _x * cell.w;
	player.y = _y * cell.h;
	
}

function update() {
	// if (Game.scene == 'map')
		player.update();

	const offset = {
		x: -player.x,
		y: -player.y
	};
	// console.log(offset);
	map.update(offset);
	// for (const type in Game.sprites) {
	// 	for (const key in Game.sprites[type]) {
	// 		if (Game.sprites[type][key].scenes.includes(Game.scene))
	// 			Game.sprites[type][key].update(offset);
	// 	}
	// }

	/* gotta be a better way to do this just with sprite list, per scene? 
		sprites keep track of their own scenes to be used in multiple scenes */
}

function draw() {
	map.display();
	player.display();
	
	
	// for (const type in Game.sprites) {
	// 	for (const key in Game.sprites[type]) {
	// 		if (Game.sprites[type][key].scenes.includes(Game.scene)) {
	// 			Game.sprites[type][key].display();
	// 			console.log(type, key);
	// 		}

	// 	}
	// }

	// for (const key in Game.ui) {
	// 	console.log(key)
	// 	if (Game.ui[key].scenes.includes(Game.scene)) 
	// 		Game.ui[key].display();
	// }
}

/* events */
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