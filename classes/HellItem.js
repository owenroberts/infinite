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

		Object.assign(this, buttonMixin); // adds default onOver, onOut, onDown

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
				this.consume.setPosition(centerAlign, inventoryY - 35);
				this.consume.alive = false;
				this.pickup.alive = false;

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
			Game.scenes.inventory.remove(this, 'ui');
			if (this.displayMapUI) Game.scenes.message.addToDisplay(this);
			this.remove();
			this.displayInventoryUI = false;
			player.consume(this, type);
			player.inventory.remove(this);
		};

		this.drop = new HellTextButton(centerAlign, inventoryY, `Drop ${this.name}`, Game.lettering.messages);
		this.drop.alive = false;
		Game.scenes.inventory.addUIUpdate(this.drop);

		this.drop.onClick = () => {
			player.inventory.remove(this);
			
			this.setPosition(player.x, player.y);
			map.add(this);
			this.drop.alive = false;
			Game.scene = 'map';
			this.displayMapUI = true;
			this.displayInventoryUI = false;
			this.consume.setPosition(this.position.x + this.width/2, this.position.y + 35);
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

	onClick() {
		console.log(this);
		const onOff = !this.displayInventoryUI;
		for (let i = 0; i < player.inventory.items.length; i++) {
			if (player.inventory.items[i])
				player.inventory.items[i].toggleInventoryDisplay(false);
		}
		this.toggleInventoryDisplay(onOff);
	}

	toggleInventoryDisplay(onOff) {
		this.displayInventoryUI = typeof onOff === "undefined" ? !this.displayInventoryUI : onOff;
		this.consume.alive = this.displayInventoryUI;
		this.drop.alive = this.displayInventoryUI;
	}
}