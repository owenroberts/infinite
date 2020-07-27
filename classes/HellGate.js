class HellGate extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'orange';

		// enter the gate
		this.enter = new HellTextButton(this.position.x, this.position.y + this.height/2, `Enter Hell's Gate`, gme.anims.lettering.messages);
		this.enter.isActive = false;
		this.enter.updatePosition = () => {
			this.enter.setPosition(this.position.x - this.width/2, this.position.y + this.height/2);
		};

		this.enter.onClick = () => {
			gme.scene = 'message'; // happens first?
			player.died = true; // this is short cut for now
			player.checkMorality();
		};

		this.ui = new SpriteCollection([this.enter]);
	}
}