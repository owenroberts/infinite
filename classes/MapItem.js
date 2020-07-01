class MapItem extends HellItem {
	constructor(...args) {
		super(...args);

		this.pickup = new HellTextButton(this.position.x + this.width/2, this.position.y, `Pick up ${this.name}`, gme.anims.lettering.messages);
		this.pickup.isActive = false;

		this.pickup.onClick = () => {
			if (inventory.add(args, this.name)) {
				ui.arrow.isActive = false; // global update for this? 
				map.remove(this);
			}
		};

		this.consume = new HellTextButton(this.position.x + this.width/2, this.position.y + 35, `${this.consumeString} ${this.name}`, gme.anims.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.isActive = false;

		this.consume.onClick = () => {
			map.remove(this);
			player.consume(this, this.type);
		};

		this.ui = new SpriteCollection([this.pickup, this.consume]);
		// this.c = 'purple'; // debug color 
	}

	display() {
		super.display();
		this.ui.display();

		if (mapAlpha > 0) {
			gme.ctx.globalAlpha = mapAlpha;
			gme.ctx.fillStyle = this.c;
			gme.ctx.fillRect(this.origin.x / cell.w * mapCellSize, this.origin.y / cell.h * mapCellSize, 8, 8);
			gme.ctx.globalAlpha = 1.0;
		}
	}

	update(offset) {
		super.update(offset);
		if (this.collide(player)) {
			this.pickup.setPosition(this.position.x + this.width/2, this.position.y - 35);
			this.consume.setPosition(this.position.x + this.width/2, this.position.y);
			this.pickup.isActive = true;
			this.consume.isActive = true;
		} else {
			this.pickup.isActive = false;
			this.consume.isActive = false;
		}
	}

	over(x, y) {
		this.ui.all(ui => ui.over(x, y));
	}

	out(x, y) {
		this.ui.all(ui => ui.out(x, y));
	}

	down(x, y) {
		this.ui.all(ui => ui.down(x, y));
	}

	up(x, y) {
		this.ui.all(ui => ui.up(x, y));
	}
}