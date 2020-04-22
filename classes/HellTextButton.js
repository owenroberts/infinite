class HellTextButton extends TextButton {
	constructor(x, y, msg, letters, cursorState, onClick) {
		super(x, y, msg, msg.length, letters);
		this.cursorState = cursorState || 'interact';
		if (onClick) this.onClick = onClick;
	}

	onOver() {
		ui.cursor.state = this.cursorState;
		ui.arrow.isActive = true;
		ui.arrow.position.x = this.position.x + this.width;
		ui.arrow.position.y = this.position.y;
	}

	onOut() {
		ui.cursor.state = gme.currentSceneName == 'map' ? 'walk' : 'interact';
		ui.arrow.isActive = false;
	}

	onDown() {
		ui.cursor.state = 'click';
		// ui arrow?
	}

	onUp() {
		ui.cursor.state = gme.currentSceneName == 'map' ? 'walk' : 'interact';
		ui.arrow.isActive = false;
	}

	check() {
		// for changed button that hasn't moved ... 
		if (this.tap(ui.cursor.x, ui.cursor.y)) ui.arrow.isActive = true;
	}
}