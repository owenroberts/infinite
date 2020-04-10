class MapItem extends HellItem {
	constructor(...args) {
		super(...args);

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, Game.lettering.messages);
		this.pickup.alive = false;    // alive for ui update, not display

		this.pickup.onClick = () => {
			if (inventory.add(args, this.name)) {
				ui.arrow.alive = false; // global update for this? 
				map.remove(this);
			}
		};

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `${this.consumeString} ${this.name}`, Game.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.alive = false;

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
			this.pickup.alive = true;
			this.consume.alive = true;
		} else {
			this.pickup.alive = false;
			this.consume.alive = false;
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