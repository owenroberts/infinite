class ItemCollection {
	constructor(items) {
		this.items = items ? [...items] : [];
	}

	get length() {
		return this.items.length;
	}

	item(index) {
		return this.items[index];
	}

	remove(item) {
		this.items.splice(this.items.indexOf(item), 1);
	}

	add(item) {
		this.items.push(item);
	}

	// loop 
	all(callback) {
		for (let i = 0; i < this.items.length; i++) {
			callback(this.items[i], i);
		}
	}

	display() {
		this.all(item => { item.display(); });
	}
}