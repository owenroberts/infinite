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

		// this.debug = true;

		this.pickup = new Text(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, 12, Game.lettering.messages);
		this.eat = new Text(this.position.x + this.width/2, this.position.y + 35, `Eat ${this.name}`, 12, Game.lettering.messages);
	}

	display() {
		super.display();

		if (this.collide(player)) {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
			this.eat.setPosition(this.position.x + this.width/2, this.position.y);
			this.pickup.display();
			this.eat.display();

			if (this.eat.isOver(ui.cursor.xy.x, ui.cursor.xy.y)) {
				console.log('e at collide');
			}

			if (this.pickup.isOver(ui.cursor.xy.x, ui.cursor.xy.y)) {
				console.log('pick collide');
			}
		}
	}
}