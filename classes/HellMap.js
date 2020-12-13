class HellMap extends BSPMap {
	constructor(size) {
		const buffer = {
			w: Math.ceil(gme.width / 2 / cellSize.w),
			h: Math.ceil(gme.height / 2 / cellSize.h)
		};
		super(size + buffer.w, size + buffer.h, size / 4, size / 2 - 1);
		this.size = 12;
		this.buffer = buffer;

		gme.scenes.map.add(this);
		this.items = new SpriteCollection();
	}

	build(callback) {
		console.time('map');

		let newSize = this.size + gme.lvl * 2;
		this.updateSize(newSize + this.buffer.w, newSize + this.buffer.h, newSize / 4, newSize / 2 - 1);
		
		super.build(this.buffer, 6 + gme.lvl); // max nodes --  move up faster?
		
		this.roomCount = this.nodes.filter(n => n.room).length;
		this.cellCount = this.nodes.filter(n => n.room).map(n => n.room.w * n.room.h).reduce((s, n) => s + n);
		
		// debug see the rooms
		this.nodes.forEach(n => {
			// console.log('node', n.x, n.y, n.w, n.h);
			if (n.room) console.log('room', n.room.x, n.room.y, n.room.w, n.room.h);
		});

		const bgColors = [
			'#ffffff',
			'#F8F8F8',
			'#F0F0F0',
			'#E8E8E8',
			'#E0E0E0',
			'#D8D8D8',
			'#D0D0D0',
			'#C8C8C8',
			'#C0C0C0',
			'#B8B8B8',
			'#B0B0B0',
			'#A8A8A8',
			'#A0A0A0',
			'#989898',
			'#909090',
			'#888888',
			'#808080',
			'#787878',
			'#707070',
			'#686868',
			'#606060',
			'#585858',
			'#505050',
			'#484848',
			'#404040',
			'#383838',
			'#303030',
			'#282828',
			'#202020',
			'#181818',
			'#101010',
			'#080808'
		];
		// 0x080808 + 0x080808
		const bgColor = bgColors[Math.min(gme.lvl, bgColors.length - 1)];

		this.walls.forEach(wall => {
			wall.texture.animation.over = { c: bgColor };
		});

		this.nodes.forEach(node => {
			if (node.room) {
				node.room.texture.animation.over = { c: bgColor };
			}
			if (node.paths) {
				node.paths.forEach(path => {
					path.texture.animation.over = { c: bgColor };
				});
			}
		});
		// console.log('bgColor', bgColor);

		
		if (callback) callback();
	}

	addAllMapItems() {

		this.items.clear();

		const nodes = this.nodes.filter(n => n.room);
		const noPlayer = shuffle(nodes.filter(n => !n.room.takenCells.some(c => c.label == 'player')));
		let location;
		for (let i = 0; i < noPlayer.length; i++) {
			location = noPlayer[i].room.getCell("hells_gate");
			if (location) break;
		}
		if (!location) {
			for (let i = 0; i < noPlayer.length; i++) {
				location = noPlayer[i].room.getCell("hells_gate");
				if (location) break;
			}
		}
		if (!location) {
			console.log(noPlayer, nodes);
		}
		const hg = new HellGate(
			location.x * cellSize.w + Cool.random(-cellSize.w/4, cellSize.w/4),
			location.y * cellSize.h + Cool.random(-cellSize.h/4, cellSize.h/4),
			gme.anims.sprites.hells_gate,
			['fart', 0, 0, 0, 0, 0, 0, 0, 0],
			'gate'
			);
		this.items.add(hg);

		this.cellCount -= 2; // subtract player, gate
		this.addItems('sinner', Sinner, 1); // 1 sinner per level for now, adjust later
		this.addItems('food', MapItem);
		this.addItems('scripture', MapItem);
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

		while (choices.length > 0 && this.cellCount > 0) {
			const itemData = items[choices.pop()];
			const nodes = shuffle(this.nodes.filter(n => n.room));
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				const c = node.room.getCell(type);
				if (c) {
					const item = new typeClass(
						c.x * cellSize.w + Cool.random(-cellSize.w/4, cellSize.w/4),
						c.y * cellSize.h + Cool.random(-cellSize.h/4, cellSize.h/4),
						gme.anims.items[itemData.label],
						itemData,
						type
					);
					this.items.add(item);
					this.cellCount--;
					break;
				}
			}
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

