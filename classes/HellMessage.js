class HellMessage extends Text {
	constructor(x, y, msg, wrap, letters) {
		super(x, y, msg, wrap, letters);
		
		this.list = [];
		this.continue = new HellTextButton(this.x, this.y, 'Click Here To Explore Purgatory', Game.anims.lettering.messages);
		
		Game.scenes.message.addToDisplay(this);
		Game.scenes.loading.addToDisplay(this);
		Game.scenes.inventory.addToDisplay(this);
		Game.scenes.win.addToDisplay(this);
		
		Game.scenes.inventory.addUI(this.continue);
		Game.scenes.message.addUI(this.continue);
		Game.scenes.win.addUI(this.continue);

		this.continue.onClick = () => {
			console.log('click');
			if (this.list.length == 0) {
				this.set('');

				if (player.died) loadNextMap();
				else if (this.next) this.next();
				else Game.scene = 'map';
				
				// removes items that we see when consuming ... 
				for (let i = 0; i < Game.scenes.message.displayItems.length; i++) {
					if (Game.scenes.message.displayItems[i].constructor.name == 'HellItem') {
						Game.scenes.message.displayItems.splice(i, 1);
					}
				}
				this.next = undefined;
			} else {
				this.set(this.list.shift());
				this.continue.check();
			}
		};
	}

	// change to add
	add(msg) {
		let waitForSpace = false; // wait for a space or line break here ... 
		let nextBreak = this.wrap * 4;
		let start = 0;

		for (let i = 0; i < msg.length; i++) {
			if (i == start + nextBreak || waitForSpace) {
				if (msg[i].match(/[\n\r\s]/g)) {
					this.list.push(msg.substring(start, i));
					waitForSpace = false;
					start = i + 1;
				} else {
					waitForSpace = true;
				}
			} else if (start + nextBreak > msg.length) {
				this.list.push(msg.substring(start, msg.length));
				i = msg.length;
			}
		}

		if (!this.msg) this.set(this.list.shift());
	}

	// change to set
	set(msg) {
		// Game.scene = 'message';
		super.set(msg);
		if (msg) {
			this.isActive = true;
			const returns = msg.match(/[\n\r]/g);
			const y = this.y + (this.breaks.length + 2 + (returns ? returns.length : 0)) * 35;
			this.continue.setPosition(this.x, y);
			this.continue.isActive = true;
		} else {
			this.active = false;
			this.continue.isActive = false;
		}
	}

	display() {
		super.display();
		// this.continue.display();
	}
}