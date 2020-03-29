class HellButton extends Button {
	
	onOver() {
		ui.cursor.state = 'interact';
	}

	onOut() {
		ui.cursor.state = Game.scene == 'map' ? 'walk' : 'interact';
	}

	onDown() {
		ui.cursor.state = 'click';
	}
}