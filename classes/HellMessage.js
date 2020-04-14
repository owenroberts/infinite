class HellMessage extends Text {
	constructor(x, y, msg, wrap, letters) {
		super(x, y, msg, wrap, letters);
		
		this.list = [];
		this.continue = new HellTextButton(this.x, this.y, 'Click Here To Explore Purgatory', gme.anims.lettering.messages);

		gme.scenes.add(this, ['message', 'loading', 'inventory', 'win'], 'display');
		
		gme.scenes.add(this.continue, ['inventory', 'message', 'win'], 'ui');

		this.continue.onClick = () => {
			if (this.list.length == 0) {
				this.set('');

				if (player.died) loadNextMap();
				else if (this.next) this.next();
				else gme.scene = 'map';
				
				// removes items that we see when consuming ... 
				for (let i = 0; i < gme.scenes.message.displayItems.length; i++) {
					if (gme.scenes.message.displayItems[i].constructor.name == 'HellItem') {
						gme.scenes.message.displayItems.splice(i, 1);
					}
				}
				this.next = undefined;
			} else {
				this.set(this.list.shift());
				this.continue.check();
			}
		};
	}

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

	set(msg) {
		super.setMsg(msg);
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