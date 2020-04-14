class UIMetric extends Text {
	constructor(x, y, callback) {
		const msg = callback();
		super(x, y, msg, msg.length, gme.anims.lettering.metrics);
		this.callback = callback;

		gme.scenes.add(this, ['map', 'inventory', 'message'], 'display');
	}

	update() {
		super.setMsg(this.callback());
		this.wrap = this.msg.length;
		this.setBreaks();
	}
}