class PackItem extends HellItem {
	constructor(...args) {
		super(...args);
		this.displayPack = false;


		Object.assign(this, buttonMixin); // adds default onOver, onOut, onDown

		let cursorType = 'interact';
		if (this.type == 'food') cursorType = 'eat';
		else if (this.type == 'scripture') cursorType = 'read';

		this.consume = new HellTextButton(leftAlign, packY - 35, `${this.consumeString} ${this.label}`, gme.anims.lettering.messages, cursorType);
		this.consume.isActive = false;

		this.consume.onClick = () => {
			player.consume(this, this.type);
			pack.remove(this);
		};

		this.drop = new HellTextButton(leftAlign, packY, `Drop ${this.label}`, gme.anims.lettering.messages, 'drop');
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
			pack.remove(this);
			ui.message.reset();

			// world morality isn't really more sophisticated than just adding/subtracting to character
			// maybe just make global list of morals ... 
			for (const moral in player.world) {
				sinner[moral] += +this[moral];

				// 0 is up from -1, after that?
				// should only correct sin help sinner?
				if (sinner.moralityScore >= 0) {
					player.morality.adjust++;
				} else {
					player.morality.adjust--;
				}
			}

			gme.scene = 'map';
			ui.metrics.morality.update();
			sinner = undefined;
			pack.state = 'player';
		}
		else if (pack.state == 'player') {
			const onOff = !this.displayPack;
			pack.items.all(item => item.togglePackDisplay(false));
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