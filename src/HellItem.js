class HellItem extends ColliderEntity {
	constructor(x, y, animation, data, type) {
		super({ x: x, y: y});
		this.addAnimation(animation);

		for (const key in data) {
			this[key] = data[key] || 0;
		}

		if (this.action) this.actionString = `${this.action}${this.dt ? ' ' + this.dt: ''} ${this.label}`;

		// debug colors
		if (type == 'food') this.c = 'red';
		if (type == 'scripture') this.c = 'lightblue';
		if (type == 'animal') this.c = 'green';
		if (type == 'special') this.c = 'yellow';
	}
}