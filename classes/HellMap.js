class HellMap extends Map {
	constructor(...args) {	
		super(...args);
		gme.scenes.map.add(this);
		Object.assign(this, itemMixin); // adds over, out, down, up
	}

	build(callback) {
		
		super.build({
			// cell buffer
			w: Math.ceil(gme.width/2/cell.w),
			h: Math.ceil(gme.height/2/cell.h)
		});
		
		this.roomCount = 0;
		this.nodes.forEach(node => {
			if (node.room) this.roomCount++;
		});
		
		this.items = new ItemCollection();
		this.addItems('food');
		this.addItems('scripture');
		
		if (callback) callback();
	}

	prob(f) {
		f = f.replace(/p(?![a-z])/g, Cool.map(gme.lvl, 0, 28, 0, 1));
		// console.log(f);
		return  Function('return ' + f)().clamp(0, 1);
	}

	addItems(type) {
		const itemCount = random(1, this.roomCount);
		const choices = [];
		const indexes = [];

		for (let i = 0; i < gme.data[type].entries.length; i++) {
			const prob = this.prob(gme.data[type].entries[i][6]); // this changes - make it json ....
			if (prob == 1) choices.push(i);
			else if (prob > 0) {
				for (let j = 0; j < prob * 100; j++) {
					indexes.push(i);
				}
			}
		}

		let choicesWhileCount = 0;
		while (choices.length < itemCount) {
			const index = Cool.random(indexes);
			if (!choices.includes(index)) choices.push(index);
			if (choicesWhileCount > 10) {
				debugger;
			}
		}

		choicesWhileCount = 0;
		while (choices.length > 0) {
			const node = Cool.random(this.nodes.filter(n => n.room));
			const index = choices.pop();
			const itemData = gme.data[type].entries[index];
			const c = node.room.getCell();
			const item = new MapItem(
				c.x * cell.w + Cool.random(-cell.w/4, cell.w/4),
				c.y * cell.h + Cool.random(-cell.h/4, cell.h/4),
				gme.anims[type][itemData[0]],
				itemData,
				type
			);
			this.items.add(item);
			if (choicesWhileCount > 10) {
				debugger;
			}
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

		// only map uses offset ... 
		const offset = {
			x: -player.x + gme.width / 2,
			y: -player.y + gme.height / 2 
		};


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
			/* wall doesn't have collider should it? */
			if (wall.collide(player)) wallCollision = true;
		}
		if (wallCollision) player.back();


		this.items.all(item => { item.update(offset); });
	}
}

