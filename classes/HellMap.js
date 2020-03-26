class HellMap extends Map {

	setup() {
		this.food = [];
		this.roomCount = 0;
		this.nodes.forEach(node => {
			if (node.room) this.roomCount++;
		});
	}

	prob(f) {
		f = f.replace(/p(?![a-z])/g, Cool.map(Game.lvl, 0, 28, 0, 1));
		return  Function('return ' + f)().clamp(0, 1);
	}

	addFood() {
		const foodCount = random(1, this.roomCount/2);
		const choices = [];
		const indexes = [];
		for (let i = 0; i < Game.food.data.length; i++) {
			const food = Game.food.data[i];
			const prob = this.prob(food[5]);
			// console.log(food[0], prob);
			if (prob == 1) choices.push(i);
			else if (prob > 0) {
				for (let j = 0; j < prob * 100; j++) {
					indexes.push(i);
				}
			}
		}

		while (choices.length < foodCount) {
			const index = Cool.random(indexes);
			if (!choices.includes(index))
				choices.push(index);
		}

		while (choices.length > 0) {
			const node = Cool.random(this.nodes);
			if (node.room) {
				const index = choices.pop();
				const data = Game.food.data[index];
				const x = Cool.random(node.room.x + 1, node.room.x + node.room.w - 2) * cell.w;
				const y = Cool.random(node.room.y + 1, node.room.y + node.room.h - 2) * cell.h;
				const food = new Food(x, y, Game.food[data[0]], data);
				this.food.push(food);
			}
		}
	}

	display() {
		this.nodes[0].display();
		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].display();
		}
		for (let i  = 0; i < this.food.length; i++) {
			this.food[i].display();
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
	}
}