class PickupItem extends MapItem {
	constructor(...args) {
		super(...args);

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, gme.anims.lettering.messages);
		this.pickup.isActive = false;

		this.pickup.onClick = () => {
			if (pack.add(args, this.name)) {
				ui.arrow.isActive = false; // global update for this? 
				map.remove(this);
			}
		};

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `${this.consumeString} ${this.name}`, gme.anims.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.isActive = false;

		this.consume.onClick = () => {
			map.remove(this);
			player.consume(this, this.type);
		};

		this.ui = new SpriteCollection([this.pickup, this.consume]);
	}
}