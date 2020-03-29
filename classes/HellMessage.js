class HellMessage extends Text {
	constructor(x, y, msg, wrap, letters) {
		super(x, y, msg, wrap, letters);
		this.list = [];
		this.continue = new HellTextButton(this.x, this.y, 'Click Here To Explore Purgatory', 100, Game.lettering.messages);
		let firstClick = true;
		Game.scenes.inventory.addUIUpdate(this.continue);
		Game.scenes.message.addUIUpdate(this.continue);
		this.continue.onClick = () => {
			if (firstClick) {
				this.continue.setMsg('Continue');
				firstClick = false;
			}
			if (this.list.length == 0) {
				this.setMsg('');
				Game.scene = 'map';
				for (let i = 0; i < Game.scenes.message.displayItems; i++) {
					if (Game.scenes.message.displayItems[i].constructor.name == 'Food')
						Game.scenes.message.displayItems.splice(i, 1);
				}
			} else {
				this.setMsg(this.list.shift());
			}
		};
	}

	addMsg(msg) {
		this.list.push(msg);
		if (!this.msg) this.setMsg(this.list.shift());
	}

	setMsg(msg) {
		super.setMsg(msg);
		if (msg) {
			this.active = true;
			const returns = msg.match(/[\n\r]/g);
			const y = this.y + (this.breaks.length + 2 + (returns ? returns.length : 0)) * 35;
			this.continue.setPosition(this.x, y);
			this.continue.alive = true;
		} else {
			this.active = false;
			this.continue.alive = false;
		}
	}

	display() {
		super.display();
		this.continue.display();
	}
}