class HellItem extends Item {
	constructor(x, y, json, data, type) {
		super({ x: x, y: y});
		super.addJSON(json);
		this.type = type;
		
		this.name = data[0];
		this.health = +data[1];
		this.morality = +data[2];
		this.hunger = +data[3];
		this.speed = +data[4];
		this.hungerRate = +data[5];
		// skip prob - maybe put this first or last
		this.quote = data[7];
		this.displayMapUI = true;
		this.displayInventoryUI = false;

		this.consumeString;
		switch(type) {
			case 'food':
				this.consumeString = 'Eat';
			break;
			case 'scripture':
				this.consumeString = 'Read';
			break;
		}

		/* this isn't own class because so much is reference to item */
		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, Game.lettering.messages);
		Game.scenes.map.addUIUpdate(this.pickup);
		this.pickup.alive = false; // alive for ui update, not display
			// use scene for this? well they're part of scene but not activated ... fuck me

		this.pickup.onClick = () => {
			if (!player.inventory.isFull) {
				ui.arrow.alive = false;
				map.remove(this);
				this.displayMapUI = false;

				Game.scenes.inventory.addUIUpdate(this);
				Game.scenes.inventory.addUIUpdate(this.consume);
				this.consume.position.x = centerAlign;
				this.consume.position.y = inventoryY;
				this.consume.alive = false;

				player.inventory.add(this);
			} else {
				Game.scene = 'message'; // scene before message to set the continue position (in setMsg)
				ui.message.setMsg('Your pack is full.');
			}
		};

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `${this.consumeString} ${this.name}`, Game.lettering.messages, type == 'food' ? 'eat' : 'interact');
		Game.scenes.map.addUIUpdate(this.consume);
		this.consume.alive = false;

		this.consume.onClick = () => {
			this.remove();
			Game.scenes.message.addToDisplay(this);
			player.consume(this, type);
		};

		this.drop = new HellTextButton(centerAlign, inventoryY + 35, `Drop ${this.name}`, Game.lettering.messages);
		this.drop.alive = false;
		Game.scenes.inventory.addUIUpdate(this.drop);
		this.drop.onClick = () => {
			this.position.x = player.x;
			this.position.y = player.y;
			map.add(this);
		};
	}

	remove() {
		this.displayMapUI = false;
		map.remove(this);
		Game.scenes.map.remove(this.pickup, 'ui');
		Game.scenes.map.remove(this.consume, 'ui');
	}

	display() {
		super.display();

		if (this.displayMapUI) {
			this.pickup.display();
			this.consume.display();
		}

		if (this.displayInventoryUI) {
			this.consume.display();
			this.drop.display();
		}
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

	onOver() {
		console.log('over');
	}

	onClick() {
		console.log('fuckin on click', this.displayInventoryUI)
		this.displayInventoryUI = !this.displayInventoryUI;
		this.consume.alive = this.displayInventoryUI;
		this.drop.alive = this.displayInventoryUI;
	}
}