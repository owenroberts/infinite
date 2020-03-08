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
console.time('load');
Game.load(
	{ 
		ui: '/data/ui.json', 
		sprites: '/data/sprites.json', 
		textures: '/data/textures.json' 
	},
	Game.start
);

let player;
let map, cols = 50, rows = 50, min = 12, cell = { w: 256, h: 256 };
let wall;

/* debugging */
let mapAlpha = 0;
document.addEventListener('keydown', ev => {
	if (ev.which == 187) mapAlpha = Math.min(1, mapAlpha + 0.25);
	else if (ev.which == 189) mapAlpha = Math.max(0, mapAlpha - 0.25);
})

function start() {
	console.timeEnd('load');
	Game.scene = 'map';

	Game.setBounds('top', -cell.h/2);
	Game.setBounds('left', -cell.w/2);
	Game.setBounds('right', cols * cell.w - cell.w/2);
	Game.setBounds('bottom', rows * cell.h - cell.h/2);

	console.time('map');
	map = new Map(cols, rows);
	console.timeEnd('map');
	
	player = new Player('/drawings/sprites/skully_3f.json', Game.width/2, Game.height/2);

	/* place player in random room */
	const pos = Cool.random(map.nodes.filter(node => node.room)).room;
	const _x = Cool.random(pos.x + 1, pos.x + pos.w - 2);
	const _y = Cool.random(pos.y + 1, pos.y + pos.h - 2);
	player.x = _x * cell.w; //- Game.width/2 - cell.w/2;
	player.y = _y * cell.h; // - Game.height/2 - cell.h/2;
	
	// wall = new Wall(4, 2);
}

function update() {
	// if (Game.scene == 'map')
	
	player.update();
	
	/* detect wall collisions */
	let wallCollision = false;
	for (let i = 0; i < map.walls.length; i++) {
		const wall = map.walls[i];
		if (player.collide(wall.scaled())) wallCollision = true;
	}


	if (wallCollision) player.back();
	

	const offset = {
		x: -player.x + Game.width/2 + player.width/2,
		y: -player.y + Game.height/2 + player.height/2
	};
	// console.log(offset);
	map.update(offset);
	// wall.update(offset);



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
	// wall.display();
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