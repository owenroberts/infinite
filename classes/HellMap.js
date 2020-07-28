class HellMap extends Map {
	constructor(...args) {	
		super(...args);
		gme.scenes.map.add(this);
		Object.assign(this, itemMixin); // adds over, out, down, up
	}

	build(callback) {
		const maxNodes = 5 + gme.lvl; // move up faster?
		super.build({
			// cell buffer
			w: Math.ceil(gme.width / 2 / cellSize.w),
			h: Math.ceil(gme.height / 2 / cellSize.h)
		}, maxNodes);
		
		this.roomCount = 0;
		this.nodes.forEach(node => {
			if (node.room) this.roomCount++;
		});
		
		this.items = new SpriteCollection();
		
		this.addItems('food', PickupItem);
		this.addItems('scripture', PickupItem);
		this.addItems('sinner', Sinner, 1); // 1 sinner per level for now, adjust later
		
		if (callback) callback();
	}

	addHellsGate() {
		const location = Cool.random(this.nodes.filter(n => n.room).filter(n => !n.room.takenCells.some(c => c.label == 'player'))).room.getCell("hells_gate");
		
		const hg = new HellGate(
			location.x * cellSize.w + Cool.random(-cellSize.w/4, cellSize.w/4),
			location.y * cellSize.h + Cool.random(-cellSize.h/4, cellSize.h/4),
			gme.anims.sprites.hells_gate,
			['fart', 0, 0, 0, 0, 0, 0, 0, 0],
			'gate'
			);
		this.items.add(hg);
	}

	prob(f) {
		f = f.replace(/p(?![a-z])/g, Cool.map(gme.lvl, 0, 28, 0, 1));
		// console.log(f);
		return  Function('return ' + f)().clamp(0, 1);
	}

	addItems(type, typeClass, count) {
		const itemCount = count || random(1, this.roomCount);
		const items = gme.data.items.entries.filter(item => item.type == type);
		
		const indexes = []; // list of possible items based on probability
		const choices = []; // indexes of items to place in map

		// add probabilities based on formulas
		for (let i = 0; i < items.length; i++) {
			const prob = this.prob(items[i].probability); // csv index changes ... 
			if (prob == 1) choices.push(i);
			else if (prob > 0) {
				for (let j = 0; j < prob * 100; j++) {
					indexes.push(i);
				}	
			}
		}

		
		// fill remaining choices with new items		
		while (choices.length < itemCount) {
			choices.push(  Cool.random(indexes.filter(i => !choices.includes(i))) );
			// potential crash? 
		}

		while (choices.length > 0) {
			const node = Cool.random(this.nodes.filter(n => n.room));
			const itemData = items[choices.pop()];
			const c = node.room.getCell(type);
			const item = new typeClass(
				c.x * cellSize.w + Cool.random(-cellSize.w/4, cellSize.w/4),
				c.y * cellSize.h + Cool.random(-cellSize.h/4, cellSize.h/4),
				gme.anims.items[itemData.label],
				itemData,
				type
			);
			this.items.add(item);

			// crash?
		}
	}

	add(item) {
		this.items.add(item);
	}

	remove(item) {
		this.items.remove(item);
	}

	display() {
		this.nodes[0].display();
		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].display();
		}
		this.items.display();
	}

	update() {

		const offset = new Cool.Vector(-player.mapPosition.x + gme.width / 2, -player.mapPosition.y + gme.height / 2);

		// this.nodes[0].update(offset);
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			if (node.room) node.room.update(offset);
			for (let j = 0; j < node.paths.length; j++) {
				node.paths[j].update(offset);
			}
		}

		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].update(offset);
		}

		let wallCollision = false;
		for (let i = 0; i < map.walls.length; i++) {
			const wall = map.walls[i];
			if (wall.collide(player)) wallCollision = true;
		}
		if (wallCollision) player.back();


		this.items.all(item => { item.update(offset); });
	}
}

