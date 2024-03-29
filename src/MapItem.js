class MapItem extends HellItem {
	constructor(...args) {
		super(...args);
		this.isColliding = false;
		this.xKey = () => {
			map.remove(this);
			player.action(this);
		};
	}

	display() {
		super.display();

		if (mapAlpha > 0) {
			gme.ctx.globalAlpha = mapAlpha;
			gme.ctx.fillStyle = this.c;
			gme.ctx.fillRect(this.origin[0] / cellSize.w * mapCellSize, 50 + this.origin[1] / cellSize.h * mapCellSize, 8, 8);
			gme.ctx.globalAlpha = 1.0;
		}
	}

	update(offset) {
		super.update(offset);
		
		if (this.collide(player) && !this.isColliding && !player.isColliding) {
			ui.console.setMsg(`Press X to ${this.actionString}`);
			this.isColliding = true;
			player.isColliding = true;
			ui.console.xKey = () => {
				this.isColliding = false;
				player.isColliding = false;
				this.xKey();
			};
		} else if (!this.collide(player) && this.isColliding) {
			ui.console.setMsg('');
			this.isColliding = false;
			player.isColliding = false;
			ui.console.xKey = undefined;
		}
	}
}