class Inventory {
	constructor() {
		this.size = 3;
		this.x = 64;
		this.y = 200;
		this.w = 128;
		this.h = 128;

		this.label = new Text(10, 100, "Inventory", 9, Game.lettering.metrics);
	}

	add(item) {
		Game.scene = 'inventory';
		// console.log('inventory add', item);
		for (let i = 0; i < this.size; i++) {
			if (!this[i]) {
				this[i] = {};
				this[i].item = item;
				item.position.x = this.x + this.w * i;
				item.position.y = this.y + this.h * i;
				this[i].label = new Text(this.x + this.w * i - this.w/2, this.y + this.h * i - this.h/2, ''+i, 1, Game.lettering.metrics);
				return;
			}
		}
	}

	display() {
		this.label.display();
		for (let i = 0; i < this.size; i++) {
			if (this[i]) {
				this[i].item.display();
				this[i].label.display();
			}
		}
	}
}