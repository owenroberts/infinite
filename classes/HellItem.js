class HellItem extends Entity {
	constructor(x, y, animation, data, type) {
		super({ x: x, y: y});
		this.addAnimation(animation);
		
		for (const key in data) {
			this[key] = data[key] || 0;
		}

		// add mouse type to this, simplify
		this.consumeString; // this should go in data file eventually
		if (type == 'food') {
			this.consumeString = 'Eat';
			this.c = 'red'; // debug color
		}
		else if (type == 'scripture') {
			this.c = 'lightblue'; // debug color
			this.consumeString = 'Read';
		}
	}
}