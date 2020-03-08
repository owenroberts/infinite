class Map {
	constructor(cols, rows) {
		this.cols = cols;
		this.rows = rows;

		this.walls = [];
		
		// root node
		
		// cell buffer
		const buf = {
			w: Math.ceil(Game.width/2/cell.w),
			h: Math.ceil(Game.height/2/cell.h)
		}; 

		this.nodes = [new Node(buf.w, buf.h, this.cols - buf.w*2, this.rows - buf.h*2)]; 

		let didSplit = true;
		while (didSplit) {
			didSplit = false;
			this.nodes.forEach(node => {
				if (!node.a && !node.b) {
					if (node.w > min && node.h > min) {
						if (node.split(min)) {
							this.nodes.push(node.a);
							this.nodes.push(node.b);
							didSplit = true;
						}
					}
				}
			});
		}

		this.nodes[0].createRooms(cols, rows);

		for (let x = 0; x < this.cols; x++) {
			for (let y = 0; y < this.rows; y++) {
				let inRoom = false;
				this.nodes.forEach(node => {
					if (node.room) {
						if (node.room.isInside(x,y)) inRoom = true;
					}
					node.paths.forEach(path => {
						if (path.isInside(x, y)) inRoom = true;
					});
				})
				if (!inRoom) this.walls.push(new Wall(x, y, 'green')); 
			}
		}
	}

	display() {
		this.nodes[0].display();
		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].display();
		}
	}

	update(offset) {
		// this.nodes[0].update(offset);
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			if (node.room) node.room.update(offset);
			for (let j = 0; j < node.paths.length; j++) {
				node.paths[j].update(offset);
			}
		}

		for (let i = 0; i < this.walls.length; i++) {
			this.walls[i].update(offset);
		}
	}
}