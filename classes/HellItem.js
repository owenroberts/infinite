class HellItem extends Item {
	constructor(x, y, json, data, type) {
		super({ x: x, y: y});
		this.addJSON(json);
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
		this.consumeString;
		if (type == 'food') this.consumeString = 'Eat';
		else if (type == 'scripture') this.consumeString = 'Read';
	}
}