class Room extends Area {
	constructor(x, y, w, h, debug) {
		super(x, y, w, h);

		const locations = [];
		for (let _x = this.x; _x < this.x + this.w; _x++) {
			for (let _y = this.y; _y < this.y + this.h; _y++) {
				locations.push({
					x: _x * cell.w,
					y: _y * cell.h
				});
			}
		}

		this.texture = new Texture({
			scenes: ['map'],
			frame: 'index',
			locations: locations,
			frame: 'randomIndex'
		}, false);
		
		this.addTexture();
		this.debug = debug;
	}

	addTexture() {
		this.texture.addJSON(Game.textures.dirt);
	}

	display() {
		this.texture.display();
		
		if (this.debug) {
			Game.ctx.globalAlpha = mapAlpha;
			const sz = 20;
			Game.ctx.fillStyle = this.debug;
			Game.ctx.strokeStyle = this.debug;
			Game.ctx.fillRect(this.x * sz, this.y * sz, this.w * sz, this.h * sz);
			// Game.ctx.strokeRect(this.x * sz, this.y * sz, this.w * sz, this.h * sz);

			Game.ctx.fillStyle = 'white';
			Game.ctx.font = `${sz/2}px sans-serif`;
			Game.ctx.fillText(`${this.x},${this.y}`, this.x * sz, this.y * sz + 10);
			Game.ctx.globalAlpha = 1.0;
		}
		
	}

	update(offset) {
		this.texture.update(offset);
	}
}