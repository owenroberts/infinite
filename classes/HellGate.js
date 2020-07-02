class HellGate extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'orange';

		// enter the gate
		this.enter = new HellTextButton(this.position.x + this.width/2, this.position.y, `Enter Hell's Gate`, gme.anims.lettering.messages);
		this.enter.isActive = false;

		this.enter.onClick = function() {
			gme.scene = 'message'; // happens first?
			player.died = true; // this is short cut for now
			player.checkMorality();
		};

		this.ui = new SpriteCollection([this.enter]);
	}
}