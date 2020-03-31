class UIMetric extends Text {
	constructor(x, y, callback) {
		const msg = callback();
		super(x, y, msg, msg.length, Game.lettering.metrics);
		this.callback = callback;

		/* turn this in got Game.addToDisplay(this, ['map', 'scenes', 'inventory'] */
		Game.scenes.map.addToDisplay(this);
		Game.scenes.inventory.addToDisplay(this);
		Game.scenes.message.addToDisplay(this);
	}

	setMsg() {
		super.setMsg(this.callback());
		this.wrap = this.msg.length;
		this.setBreaks();
	}
}