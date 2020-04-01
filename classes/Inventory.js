class Inventory {
	constructor() {
		this.size = 3;
		this.maxSize = 9;
		this.x = 64;
		this.y = inventoryY;
		this.w = 128;
		this.h = 128;

		this.label = new Text(3, 80, "Inventory", 9, Game.lettering.metrics);
		this.items = [];
		this.labels = [];
		for (let i = 0; i < this.maxSize; i++) {
			this.labels[i] = new Text(this.x + this.w * i - this.w/2, this.y + Math.floor(i/3) * this.h - this.h/2, ''+i, 1, Game.lettering.metrics);
		}
	}

	get isFull() {
		return this.size == this.items.filter(item => item != undefined).length;
	}

	add(item) {
		Game.scene = 'inventory';

		for (let i = 0; i < this.size; i++) {
			if (!this.items[i]) {
				this.items[i] = item;
				item.position.x = this.x + this.w * i;
				item.position.y = this.y + Math.floor(i/3) * this.h;
				ui.message.setMsg(`You picked up the ${item.name}.`);
				return;
			}
		}

		// nowhere to add 
	}

	display() {
		this.label.display();
		for (let i = 0; i < this.size; i++) {
			this.labels[i].display();
			if (this.items[i]) this.items[i].display();
		}
	}
}