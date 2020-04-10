class MapItem extends HellItem {
	constructor(...args) {
		super(...args);

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, Game.lettering.messages);
		this.pickup.isActive = false;

		this.pickup.onClick = () => {
			if (inventory.add(args, this.name)) {
				ui.arrow.isActive = false; // global update for this? 
				map.remove(this);
			}
		};

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `${this.consumeString} ${this.name}`, Game.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.isActive = false;

		this.consume.onClick = () => {
			map.remove(this);
			player.consume(this, this.type);
		};

		this.ui = new ItemCollection([this.pickup, this.consume]);
	}

	display() {
		super.display();
		this.ui.display();
	}

	update(offset) {
		super.update(offset);
		if (this.collide(player)) {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
			this.consume.setPosition(this.position.x + this.width/2, this.position.y);
			this.pickup.isActive = true;
			this.consume.isActive = true;
		} else {
			this.pickup.isActive = false;
			this.consume.isActive = false;
		}
	}

	over(x, y) {
		this.ui.all(ui => ui.over(x, y));
	}

	out(x, y) {
		this.ui.all(ui => ui.out(x, y));
	}

	down(x, y) {
		this.ui.all(ui => ui.down(x, y));
	}

	up(x, y) {
		this.ui.all(ui => ui.up(x, y));
	}
}