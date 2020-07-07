class HellToggle extends Toggle {
	constructor(...args) {
		super(...args);
		Object.assign(this, buttonMixin);
	}
}