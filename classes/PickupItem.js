class PickupItem extends MapItem {
	constructor(...args) {
		super(...args);

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.label}`, gme.anims.lettering.messages, 'pack');
		this.pickup.isActive = false;
		this.pickup.updatePosition = () => {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
		};

		this.pickup.onClick = () => {
			if (pack.add(args, this.label)) {
				ui.arrow.isActive = false; // global update for this? 
				map.remove(this);
			}
		};

		let cursorType = 'interact';
		if (this.type == 'food') cursorType = 'eat';
		else if (this.type == 'scripture') cursorType = 'read';

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y, `${this.consumeString} ${this.label}`, gme.anims.lettering.messages, cursorType);
		this.consume.isActive = false;
		this.consume.updatePosition = () => {
			this.consume.setPosition(this.position.x + this.width/2, this.position.y);
		};

		this.consume.onClick = () => {
			map.remove(this);
			player.consume(this, this.type);
		};

		this.ui = new SpriteCollection([this.pickup, this.consume]);
	}
}