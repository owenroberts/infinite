class HellButton extends Button {
	constructor(...args) {
		super(...args);
		Object.assign(this, buttonMixin);
	}
}