class Wall extends Area {
	constructor(x, y, debug) {
		super(x, y, 1, 1, 'lightgreen');

		const locations = [];
		for (let _x = this.x; _x < this.x + this.w; _x++) {
			for (let _y = this.y; _y < this.y + this.h; _y++) {
				for (let i = 0, numItems = Cool.random(2,5); i < numItems; i++) {
					locations.push({
						x: _x * cell.w + Cool.random(-cell.w/3, cell.w/3),
						y: _y * cell.h + Cool.random(-cell.h/3, cell.h/3)
					});
				}
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
		this.texture.addJSON(Game.textures.walls, true);
	}

	scaled() {
		return {
			x: this.x * cell.w,
			y: this.y * cell.h,
			w: this.w * cell.w,
			h: this.h * cell.h
		}
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