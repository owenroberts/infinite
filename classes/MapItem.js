class MapItem extends HellItem {
	constructor(...args) {
		super(...args);
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
			this.ui.all((ui, index) => {
				const y = -35 + index * 35;
				ui.setPosition(this.position.x + this.width/2, this.position.y - 35 + index * 35);
				ui.isActive = true;
			});
		} else {
			this.ui.all(ui => { ui.isActive = false; });
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