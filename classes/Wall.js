class Wall extends Sprite {

	constructor(x, y, debug) {
		// console.log(x, y, cell);

		super(x * cell.w, y * cell.h, cell.w, cell.h);
		// this.debug = true;
		this.origin = { x: x, y: y };
		// console.log(this);

		const locations = [];
		for (let i = 0, numItems = Cool.random(2,5); i < numItems; i++) {
			locations.push({
				x: x + cell.w/2 + Cool.random(-cell.w/3, cell.w/3),
				y: y + cell.h/2 + Cool.random(-cell.h/3, cell.h/3)
			});
		}

		this.texture = new Texture({
			scenes: ['map'],
			frame: 'index',
			locations: locations,
			frame: 'randomIndex'
		}, false);
		
		this.addTexture();
		// this.debug = Game.debug ? debug : undefined;
	}

	addTexture() {
		this.texture.addJSON(Game.data.textures.walls, true);
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