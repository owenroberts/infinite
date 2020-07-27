class Pack {
	constructor() {
		this.size = 3;
		this.maxSize = 9;
		this.x = centerAlign;
		this.y = packY;
		this.w = 128;
		this.h = 128;

		/*
			pack open to give to player or npc
		*/
		this.state = 'player'; // npc

		gme.scenes.pack.addUI(this);
		Object.assign(this, itemMixin); // adds over, out, down, up

		this.label = new Text(this.x, 140, "Pack", 9, gme.anims.lettering.metrics);
		this.items = new SpriteCollection();
		
		/* not an item collection, only display bazed on size */
		this.labels = [];
		for (let i = 0; i < this.maxSize; i++) {
			this.labels[i] = new Text(
				this.x + this.w * i, 
				this.y + Math.floor(i/3) * this.h - this.h/2, 
				`${i+1}`, 1, gme.anims.lettering.metrics);
		}
	}

	add(itemParams, label) {
		gme.scene = 'pack';

		if (this.items.length < this.size) {
			this.items.add(new PackItem(...itemParams));

			// subsitute data value for the?
			ui.message.set(`You picked up the ${label}.`);

			this.items.all((item, index) => {
				item.position.x = this.x + this.w * index + this.w/2;
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