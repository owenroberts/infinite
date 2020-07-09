class Sinner extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'purple';

		this.give = new HellTextButton(this.position.x + this.width/2, this.position.y, `Give ${this.label} an item.`, gme.anims.lettering.messages);
		this.give.isActive = false;

		this.give.onClick = () => {
			gme.scene = 'pack';
			if (pack.items.length > 0) {
				ui.message.set(`Choose an item to give ${this.label}`);
				pack.state = 'npc';
				ui.message.next = () => {
					pack.state = 'player';
				};
			}
			else {
				ui.message.set(`Your pack is empty.`);
			}
			
			// some type of "interaction state"


		};

		// button to feed/read sinner
		this.ui = new SpriteCollection([this.give]);
	}
}