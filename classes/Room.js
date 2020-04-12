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
			frame: 'randomIndex',
			center: true
		}, true);
		this.addTextureAnimation();
		this.texture.addLocations(locations);

		this.debug = true; // Game.debug ? debug : undefined;
		this.takenCells = [];
	}

	addTextureAnimation() {
		this.texture.animation = Game.anims.textures.dirt;
	}

	getCell() {
		let x = Cool.randomInt(this.x, this.x + this.w - 1);
		let y = Cool.randomInt(this.y, this.y + this.h - 1);
		let whileCount = 0;
		while (this.takenCells.filter(c => c.x == x && c.y == y).length) {
			x = Cool.randomInt(this.x, this.x + this.w);
			y = Cool.randomInt(this.y, this.y + this.h);
			whileCount++;
			if (whileCount > 10) {
				debugger;
				loadMap();
				return;
			}
		}
		this.takenCells.push({ x: x, y: y });
		return { x: x, y: y };
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