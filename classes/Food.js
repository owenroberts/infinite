class Food extends Item {
	constructor(x, y, json, mets) {
		super({ x: x, y: y});
		super.addJSON(json);
		this.name = mets[0];
		this.health = +mets[1];
		this.morality = +mets[2];
		this.hunger = +mets[3];
		this.speed = +mets[4];
		this.quote = mets[6];
		this.displayUI = true;

		// this.debug = true;

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, 8 + this.name.length, Game.lettering.messages);
		Game.scenes.map.addUIUpdate(this.pickup);
		this.pickup.alive = false;
		this.pickup.onClick = () => {
			ui.arrow.alive = false;
			this.remove();
			this.inInventory = true;
			player.inventory.add(this);
		};

		this.eat = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `Eat ${this.name}`, 4 + this.name.length, Game.lettering.messages, 'eat');
		Game.scenes.map.addUIUpdate(this.eat);
		this.eat.alive = false;
		this.eat.onClick = () => {
			this.remove();
			Game.scenes.message.addToDisplay(this);
			player.eat(this);
		};
	}

	remove() {
		this.displayUI = false;
		map.remove(this);
		Game.scenes.map.remove(this.pickup, 'ui');
		Game.scenes.map.remove(this.eat, 'ui');
	}

	display() {
		super.display();

		if (this.displayUI) {
			// Game.ctx.lineWidth = 2; // idk
			this.pickup.display();
			this.eat.display();
			// Game.ctx.lineWidth = 1;
		}
	}

	update(offset) {
		super.update(offset);
		if (this.collide(player)) {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
			this.eat.setPosition(this.position.x + this.width/2, this.position.y);
			this.pickup.alive = true;
			this.eat.alive = true;
		} else {
			this.pickup.alive = false;
			this.eat.alive = false;
		}
	}
}