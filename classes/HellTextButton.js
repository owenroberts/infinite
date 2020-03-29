class HellTextButton extends TextButton {
	constructor(x, y, msg, wrap, letters, cursorState) {
		super(x, y, msg, wrap, letters);
		this.cursorState = cursorState || 'interact';
	}

	onOver() {
		ui.cursor.state = this.cursorState;
		ui.arrow.alive = true;
		ui.arrow.position.x = this.position.x + this.width;
		ui.arrow.position.y = this.position.y;
	}

	onOut() {
		ui.cursor.state = Game.scene == 'map' ? 'walk' : 'interact';
		ui.arrow.alive = false;
	}

	onDown() {
		ui.cursor.state = 'click';
	}

	onUp() {
		ui.cursor.state = Game.scene == 'map' ? 'walk' : 'interact';
		ui.arrow.alive = false;
	}
}