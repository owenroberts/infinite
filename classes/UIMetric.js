class UIMetric extends Text {
	constructor(x, y, callback) {
		const msg = callback();
		super(x, y, msg, msg.length, gme.anims.lettering.metrics);
		this.callback = callback;

		// for UI that aren't interactive
		gme.scenes.addToDisplay(this, ['map', 'pack', 'message']);
	}

	update() {
		super.setMsg(this.callback());
		this.wrap = this.msg.length;
		this.setBreaks();
	}
}