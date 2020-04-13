class UIMetric extends Text {
	constructor(x, y, callback) {
		const msg = callback();
		super(x, y, msg, msg.length, gme.anims.lettering.metrics);
		this.callback = callback;

		/* turn this in got Game.addToDisplay(this, ['map', 'scenes', 'inventory'] */
		gme.scenes.map.addToDisplay(this);
		gme.scenes.inventory.addToDisplay(this);
		gme.scenes.message.addToDisplay(this);
	}

	update() {
		super.setMsg(this.callback());
		this.wrap = this.msg.length;
		this.setBreaks();
	}
}