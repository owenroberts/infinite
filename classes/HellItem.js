class HellItem extends Entity {
	constructor(x, y, animation, data, type) {
		super({ x: x, y: y});
		this.addAnimation(animation);
		this.type = type;
		
		this.name = data[0];
		this.health = +data[1];
		this.morality = +data[2];
		this.hunger = +data[3];
		this.speed = +data[4];
		this.hungerRate = +data[5];
		// skip prob - maybe put this first or last
		this.quote = data[7];

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