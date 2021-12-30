class Wall extends ColliderSprite {
	constructor(x, y, debug) {
		// super(x * cellSize.w, y * cellSize.h, cellSize.w, cellSize.h);
		super(x * cellSize.w, y * cellSize.h);
		this.setCollider(x * cellSize.w, y * cellSize.h, cellSize.w, cellSize.h);

		this.center = true;
		this.debug = true;
		this.origin = [x, y];
		// this.origin = { x: x, y: y };

		this.texture = new Texture({
			frame: 'index',
			center: true,
			animation: gme.anims.textures.walls
		}, false);

		// indexes based on probably move through animation frames, higher frame number deeper in hell 
		let indexes = [];
		for (let i = Math.floor(gme.lvl / 2), len = gme.lvl + Cool.random(5, 10); i < len; i++) {
			const p = 1 - (i - gme.lvl)/len; // probability
			for (let j = 0; j < Math.floor(p * 10); j++) {
				indexes.push(i);
			}
		}

		for (let i = 0, numItems = Cool.random([1,2,2,2,3,3,4]); i < numItems; i++) {
			this.texture.addLocation(
				x + Math.floor(Cool.random(-cellSize.w/3, cellSize.w/3)),
				y + Math.floor(Cool.random(-cellSize.h/3, cellSize.h/3)),
				Cool.random(indexes)
			);
		}
	}

	display() {
		super.display();
		this.texture.display();
	}

	update(offset) {
		this.position[0] = this.origin[0] + offset.x;
		this.position[1] = this.origin[1] + offset.y;
		this.texture.update(offset);
	}
}