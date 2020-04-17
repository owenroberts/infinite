class PackItem extends HellItem {
	constructor(...args) {
		super(...args);
		this.displayInventory = false;

		// gme.scenes.add(this, 'inventory', 'ui');

		Object.assign(this, buttonMixin); // adds default onOver, onOut, onDown

		this.consume = new HellTextButton(centerAlign, inventoryY - 35, `${this.consumeString} ${this.name}`, gme.anims.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.isActive = false;

		this.consume.onClick = () => {
			player.consume(this, this.type);
			inventory.remove(this);
		};

		this.drop = new HellTextButton(centerAlign, inventoryY, `Drop ${this.name}`, gme.anims.lettering.messages);
		this.drop.isActive = false;

		this.drop.onClick = () => {
			inventory.remove(this);
			const dropItem = new MapItem(...args);
			dropItem.setPosition(player.x, player.y);
			map.add(dropItem);
			gme.scene = 'map';
		};

		this.ui = new SpriteCollection([this.consume, this.drop]);
	}

	display() {
		super.display();
		this.ui.display();
	}

	onClick() {
		console.log('click')
		const onOff = !this.displayInventory;
		inventory.items.all(item => item.toggleInventoryDisplay(false))
		this.toggleInventoryDisplay(onOff);
	}

	toggleInventoryDisplay(onOff) {
		this.displayInventory = typeof onOff === "undefined" ? !this.displayInventoryUI : onOff;
		this.ui.all(ui => { ui.isActive = this.displayInventory; });
	}

	over(x, y) {
		super.over(x, y);
		this.ui.all(ui => ui.over(x, y));
	}

	out(x, y) {
		super.out(x, y);
		this.ui.all(ui => ui.out(x, y));
	}

	down(x, y) {
		super.down(x, y);
		this.ui.all(ui => ui.down(x, y));
	}

	up(x, y) {
		super.up(x, y);
		this.ui.all(ui => ui.up(x, y));
	}
}