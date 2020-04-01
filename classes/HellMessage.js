class HellMessage extends Text {
	constructor(x, y, msg, wrap, letters) {
		super(x, y, msg, wrap, letters);
		
		this.list = [];
		this.continue = new HellTextButton(this.x, this.y, 'Click Here To Explore Purgatory', 100, Game.lettering.messages);
		
		Game.scenes.message.addToDisplay(this);
		Game.scenes.loading.addToDisplay(this);
		Game.scenes.inventory.addToDisplay(this);
		Game.scenes.win.addToDisplay(this);
		
		Game.scenes.inventory.addUI(this.continue);
		Game.scenes.message.addUI(this.continue);
		Game.scenes.win.addUI(this.continue);

		this.continue.onClick = () => {
			if (this.list.length == 0) {
				this.setMsg('');

				if (player.died) buildMap();
				else if (this.next) this.next();
				else Game.scene = 'map';
				

				for (let i = 0; i < Game.scenes.message.displayItems.length; i++) {
					if (Game.scenes.message.displayItems[i].constructor.name == 'Food') {
						Game.scenes.message.displayItems.splice(i, 1);
					}
				}
				this.next = undefined;
			} else {
				this.setMsg(this.list.shift());
				this.continue.check();
			}
		};
	}

	addMsg(msg) {
		for (let i = 0; i < msg.length; i += this.wrap * 4) {
			this.list.push(msg.substring(i, i + this.wrap * 4));
		}
		if (!this.msg) this.setMsg(this.list.shift());
	}

	setMsg(msg) {
		// Game.scene = 'message';
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
		// this.continue.display();
	}
}