/*
	default cursor states for buttons and interactives
	used only in PackItem?
*/

const buttonMixin = {
	onOver() {
		ui.cursor.state = 'interact';
	},
	onOut() {
		ui.cursor.state = gme.currentSceneName == 'map' ? 'walk' : 'interact';
	},
	onDown() {
		ui.cursor.state = 'click';
	},
	onUp() {
		ui.cursor.state = gme.currentSceneName == 'map' ? 'walk' : 'interact';
	}
}