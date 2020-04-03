class HellMap extends Map {

	constructor(cols, rows) {	
		super(cols, rows);
		Game.scenes.map.add(this);
	}

	build(callback) {
		// cell buffer
		const buf = {
			w: Math.ceil(Game.width/2/cell.w),
			h: Math.ceil(Game.height/2/cell.h)
		}; 
		super.build(buf);
		
		this.roomCount = 0;
		this.nodes.forEach(node => {
			if (node.room) this.roomCount++;
		});
		
		
		this.addItems('food');
		this.addItems('scripture');
		
		if (callback) callback();
	}

	prob(f) {
		f = f.replace(/p(?![a-z])/g, Cool.map(Game.lvl, 0, 28, 0, 1));
		// console.log(f);
		return  Function('return ' + f)().clamp(0, 1);
	}

	addItems(type) {
		this[type] = [];
		const itemCount = random(1, this.roomCount);
		const choices = [];
		const indexes = [];

		for (let i = 0; i < Game.data[type].entries.length; i++) {
			const prob = this.prob(Game.data[type].entries[i][6]); // this changes - make it json ....
			if (prob == 1) choices.push(i);
			else if (prob > 0) {
				for (let j = 0; j < prob * 100; j++) {
					indexes.push(i);
				}
			}
		}

		while (choices.length < itemCount) {
			const index = Cool.random(indexes);
			if (!choices.includes(index)) choices.push(index);
		}

		while (choices.length > 0) {
			const node = Cool.random(this.nodes);
			if (node.room) {
				const index = choices.pop();
				const data = Game.data.food.entries[index];
				const c = node.room.getCell();
				const food = new Food(
					c.x * cell.w + Cool.random(-cell.w/4, cell.w/4),
					c.y * cell.h + Cool.random(-cell.h/4, cell.h/4),
					Game.data.food[data[0]], 
					data
				);
				this.food.push(food);
			}
		}
	}

	remove(item) {
		// item.constructor.name.toLowerCase();
		const index = map[item.type].indexOf(item);
		map[item.type].splice(index, 1);
	}

	add(item) {
		map[item.type].push(item);
	}

	display() {
		this.nodes[0].display();
		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].display();
		}
		for (let i  = 0; i < this.food.length; i++) {
			this.food[i].display();
		}
		for (let i  = 0; i < this.scripture.length; i++) {
			this.scripture[i].display();
		}
	}

	update(offset) {
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

		for (let i = 0; i < this.food.length; i++) {
			this.food[i].update(offset);
		}

		for (let i = 0; i < this.scripture.length; i++) {
			this.scripture[i].update(offset);
		}
	}
}