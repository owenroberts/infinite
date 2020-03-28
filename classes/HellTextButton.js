class HellTextButton extends TextButton {
	constructor(x, y, msg, wrap, letters, cursorState) {
		super(x, y, msg, wrap, letters);
		this.cursorState = cursorState || 'interact';
	}

	onOver() {
		ui.cursor.state = this.cursorState;
		ui.arrow.alive = true;
		ui.arrow.position.x = this.x + this.width;
		ui.arrow.position.y = this.y;
	}

	onOut() {
		ui.cursor.state = 'walk';
		ui.arrow.alive = false;
	}

	onDown() {
		ui.cursor.state = 'click';
	}
}