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
		this.pickup.active = false;
		this.eat = new Text(this.position.x + this.width/2, this.position.y + 35, `Eat ${this.name}`, 12, Game.lettering.messages);
		this.eat.active = false;
	}

	display() {
		super.display();
		this.pickup.display();
		this.eat.display();
	}

	update(offset) {
		super.update(offset);
		if (this.collide(player)) {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
			this.eat.setPosition(this.position.x + this.width/2, this.position.y);
			this.pickup.active = true;
			this.eat.active = true;

			/*
				make button text class ... this needs on enter exit states ... 
				just adding it in to regular text class .... 
			*/

			this.pickup.click(ui.cursor.x, ui.cursor.y, ui.cursor.down, state => {
				switch(state) {
					case 'over':
						cursor.src = '/css/pointer.gif';
					break;
					case 'down':
						cursor.src = '/css/click.gif';
					break;
					case 'click':
						// pick up food
						cursor.src = '/css/walk.gif';
					break;
					case 'out':
						cursor.src = '/css/walk.gif';
					break;
				}
			});

			this.eat.click(ui.cursor.x, ui.cursor.y, ui.cursor.down, state => {
				switch(state) {
					case 'over':
						cursor.src = '/css/mouth.gif';
					break;
					case 'click':
						// eat food
						cursor.src = '/css/walk.gif';
					break;
					case 'out':
						cursor.src = '/css/walk.gif';
					break;
				}
			});
		}
	}
}