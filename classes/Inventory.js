class Inventory {
	constructor() {
		this.size = 3;
		this.maxSize = 9;
		this.x = 64;
		this.y = inventoryY;
		this.w = 128;
		this.h = 128;

		Object.assign(this, itemMixin); // adds over, out, down, up

		this.label = new Text(3, 140, "Inventory", 9, gme.anims.lettering.metrics);
		this.items = new ItemCollection();
		
		/* not an item collection, only display bazed on size */
		this.labels = [];
		for (let i = 0; i < this.maxSize; i++) {
			this.labels[i] = new Text(
				this.x + this.w * i - this.w/2, 
				this.y + Math.floor(i/3) * this.h - this.h/2, 
				''+i, 1, gme.anims.lettering.metrics);
		}
	}

	add(itemParams, name) {
		gme.scene = 'inventory';

		if (this.items.length < this.size) {
			this.items.add(new PackItem(...itemParams));
			ui.message.set(`You picked up the ${name}.`);

			this.items.all((item, index) => {
				item.position.x = this.x + this.w * index;
				item.position.y = this.y + Math.floor(index/3) * this.h;
			});
			return true;
		} else {
			gme.scene = 'message';
			ui.message.set('Your pack is full.');
			return false;
		}
	}

	remove(item) {
		this.items.remove(item);
	}

	display() {
		this.label.display();
		for (let i = 0; i < this.size; i++) {
			this.labels[i].display();
		}
		this.items.display();
	}
}