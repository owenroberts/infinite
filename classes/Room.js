class Room extends Area {
	constructor(...args) {
		super(...args);

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

		this.debug = true;
		this.takenCells = [];
	}

	addTextureAnimation() {
		this.texture.animation = gme.anims.textures.dirt;
	}

	getCell(label) {

		// get available cells
		const availableCells = [];
		for (let x = this.x; x < this.x + this.w - 1; x++) {
			for (let y = this.y; y < this.y + this.h - 1; y++) {
				if (!this.takenCells.some(c => c.x == x && c.y == y)) 
					availableCells.push({ x: x, y: y});
			}
		}
		const c = Cool.random(availableCells);
		this.takenCells.push({ ...c, label: label });
		return c;
	}

	display() {
		this.texture.display();
		
		if (this.debug && mapAlpha > 0) {
			gme.ctx.globalAlpha = mapAlpha/2;
			gme.ctx.fillStyle = this.c;
			gme.ctx.fillRect(this.x * mapCellSize, this.y * mapCellSize, this.w * mapCellSize, this.h * mapCellSize);

			gme.ctx.fillStyle = 'white';
			gme.ctx.font = `${mapCellSize/2}px sans-serif`;
			gme.ctx.fillText(`${this.x},${this.y}`, this.x * mapCellSize, this.y * mapCellSize + 10);
			gme.ctx.globalAlpha = 1.0;
		}
	}

	update(offset) {
		this.texture.update(offset);
	}
}