class Food extends Item {
	constructor(x, y, json, mets) {
		super({ x: x, y: y});
		super.addJSON(json);
		this.name = mets[0];
		this.health = mets[1];
		this.morality = mets[2];
		this.hunger = mets[3];
		this.speed = mets[4];
		this.quote = mets[6];
	}
}