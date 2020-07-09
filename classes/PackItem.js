class PackItem extends HellItem {
	constructor(...args) {
		super(...args);
		this.displayPack = false;


		Object.assign(this, buttonMixin); // adds default onOver, onOut, onDown

		this.consume = new HellTextButton(centerAlign, packY - 35, `${this.consumeString} ${this.label}`, gme.anims.lettering.messages, this.type == 'food' ? 'eat' : 'interact');
		this.consume.isActive = false;

		this.consume.onClick = () => {
			player.consume(this, this.type);
			pack.remove(this);
		};

		this.drop = new HellTextButton(centerAlign, packY, `Drop ${this.label}`, gme.anims.lettering.messages);
		this.drop.isActive = false;

		this.drop.onClick = () => {
			pack.remove(this);
			const dropItem = new MapItem(...args);
			dropItem.setPosition(player.x, player.y);
			map.add(dropItem);
			gme.scene = 'map';
		};

		this.ui = new SpriteCollection([this.consume, this.drop]);
	}

	display() {
		super.display();
		this.ui.display();
	}

	onClick() {
		// give to npc
		if (pack.state == 'npc') {
			//
			console.log('giving!');
			// do the stuff here?
			gme.scene = 'map';
		}
		else if (pack.state == 'player') {
			const onOff = !this.displayPack;
			pack.items.all(item => item.togglePackDisplay(false))
			this.togglePackDisplay(onOff);
		}
	}

	togglePackDisplay(onOff) {
		this.displayPack = typeof onOff === "undefined" ? !this.displayPackUI : onOff;
		this.ui.all(ui => { ui.isActive = this.displayPack; });
	}

	over(x, y) {
		super.over(x, y);
		this.ui.all(ui => ui.over(x, y));
	}

	out(x, y) {
		super.out(x, y);
		this.ui.all(ui => ui.out(x, y));
	}

	down(x, y) {
		super.down(x, y);
		this.ui.all(ui => ui.down(x, y));
	}

	up(x, y) {
		super.up(x, y);
		this.ui.all(ui => ui.up(x, y));
	}
}