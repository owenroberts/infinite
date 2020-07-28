class Wall extends Sprite {
	constructor(x, y, debug) {
		super(x * cellSize.w, y * cellSize.h, cellSize.w, cellSize.h);
		this.center = true;
		// this.debug = true;
		this.origin = new Cool.Vector(x, y);
		// this.origin = { x: x, y: y };

		this.texture = new Texture({
			frame: 'index',
			center: true,
			animation: gme.anims.textures.walls
		}, false);

		// indexes based on probably move through animation frames, higher frame number deeper in hell 
		let indexes = [];
		for (let i = gme.lvl * 2, len = gme.lvl + Cool.random(5, 10); i < len; i++) {
			const p = 1 - (i - gme.lvl)/len; // probability
			for (let j = 0; j < Math.floor(p*10); j++) {
				indexes.push(i);
			}
		}

		for (let i = 0, numItems = Cool.random(2,5); i < numItems; i++) {
			this.texture.addLocation(
				Cool.random(indexes),
				x + Cool.random(-cellSize.w/3, cellSize.w/3),
				y + Cool.random(-cellSize.h/3, cellSize.h/3)
			);
		}
	}

	display() {
		super.display();
		this.texture.display();
	}

	update(offset) {
		this.position.x = this.origin.x + offset.x;
		this.position.y = this.origin.y + offset.y;
		this.texture.update(offset);
	}
}