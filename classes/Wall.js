class Wall extends Sprite {

	constructor(x, y, debug) {
		// console.log(x, y, cell);

		super(x * cell.w, y * cell.h, cell.w, cell.h);
		this.center = true;
		// this.debug = true;
		this.origin = { x: x, y: y };

		this.texture = new Texture({
			scenes: ['map'],
			frame: 'index',
			json: Game.data.textures.walls
		}, false);

		let wallLength = 53; // have to figure out how to get this from anim later ....
		let indexes = [];
		for (let i = Game.lvl * 2, len = Game.lvl + Cool.random(5, 10); i < len; i++) {
			const p = 1 - (i - Game.lvl)/len; // probability
			for (let j = 0; j < Math.floor(p*10); j++) {
				indexes.push(i);
			}
		}
		// console.log('wall indexes', indexes);

		for (let i = 0, numItems = Cool.random(2,5); i < numItems; i++) {
			this.texture.addItem(Cool.random(indexes), {
				x: x + Cool.random(-cell.w/3, cell.w/3),
				y: y + Cool.random(-cell.h/3, cell.h/3)
			});
		}
		// this.debug = Game.debug ? debug : undefined;
	}

	display() {
		super.display();
		this.texture.display();

		// if (Game.debug) {
		// 	Game.ctx.globalAlpha = mapAlpha;
		// 	const sz = 20;
		// 	Game.ctx.fillStyle = this.debug;
		// 	Game.ctx.strokeStyle = this.debug;
		// 	Game.ctx.fillRect(this.x * sz, this.y * sz, this.w * sz, this.h * sz);
		// 	// Game.ctx.strokeRect(this.x * sz, this.y * sz, this.w * sz, this.h * sz);

		// 	Game.ctx.fillStyle = 'white';
		// 	Game.ctx.font = `${sz/2}px sans-serif`;
		// 	Game.ctx.fillText(`${this.x},${this.y}`, this.x * sz, this.y * sz + 10);
		// 	Game.ctx.globalAlpha = 1.0;
		// }
	}

	update(offset) {
		this.position.x = this.origin.x + offset.x;
		this.position.y = this.origin.y + offset.y;
		this.texture.update(offset);
	}
}