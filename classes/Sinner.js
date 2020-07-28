class Sinner extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'purple';

		this.give = new HellTextButton(this.position.x, this.position.y - this.height, `Offer ${this.label} an item.`, gme.anims.lettering.messages, 'offer');
		this.give.isActive = false;
		this.give.updatePosition = () => {
			this.give.setPosition(this.position.x - this.width, this.position.y - this.height * 3/4);
		};

		this.give.onClick = () => {
			gme.scene = 'pack';
			if (pack.items.length > 0) {
				ui.message.set(`Choose an item to give ${this.label}`);
				ui.message.continue.isActive = false;
				pack.state = 'npc';
				sinner = this;
				ui.message.next = () => {
					pack.state = 'player';
				};
			}
			else {
				ui.message.set(`Your pack is empty.`);
				ui.message.next = () => {
					gme.scene = 'map';
				};
			}
		};

		// button to feed/read sinner
		this.ui = new SpriteCollection([this.give]);
	}

	get moralityScore() {
		let score = 0;
		for (const moral in player.world) {
			score += this[moral];
		}
		return score;
	}
}