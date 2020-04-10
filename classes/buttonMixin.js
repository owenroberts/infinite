/*
	default cursor states for buttons and interactives
*/

const buttonMixin = {
	onOver() {
		ui.cursor.state = 'interact';
	},
	onOut() {
		ui.cursor.state = Game.scene == 'map' ? 'walk' : 'interact';
	},
	onDown() {
		ui.cursor.state = 'click';
	},
	onUp() {
		ui.cursor.state = Game.scene == 'map' ? 'walk' : 'interact';
	}
}