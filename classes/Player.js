class Player extends Sprite {
	constructor(animation, x, y, debug) {
		super(Math.round(x), Math.round(y));
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.prevXY = { x: this.x, y: this.y };
		this.center = true; /* need better name */

		this.debug = debug || false;
		this.speed = new Cool.Vector(8, 8);

		this.addAnimation(animation);
		this.animation.state = 'idle';
		this.setCollider(25, 6, 78, 90);

		this.input = { right: false, up: false, left: false, down: false };
		this.target = new Cool.Vector(0, 0);

		this.metricCount = 0;
		this.died = false;
		this.health = 100;
		this.morality = 0;
		this.hunger = 0;
		this.hungerRate = 0.5;
		this.hungerLevel = 0;
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	setTarget(x, y) {
		this.target.x = x;
		this.target.y = y;
		this.hunger += this.hungerRate; // what about key presses .... 
	}

	update() {
		if (Math.abs(this.target.x) < this.speed.x) this.target.x = 0;
		if (Math.abs(this.target.y) < this.speed.y) this.target.y = 0;
		this.prevXY = { x: this.x, y: this.y };
		
		let state = this.animation.state.includes('idle') ?
			this.animation.state :
			Cool.random(['idle']);
			
		if (this.input.up || this.target.y < 0) {
			if (this.target.y < 0) this.target.y += this.speed.y;
			if (this.y > gme.bounds.top)
				this.y -= this.speed.y;
			state = 'right';
		}
		if (this.input.down || this.target.y > 0) {
			if (this.target.y > 0) this.target.y -= this.speed.y;
			if (this.y < gme.bounds.bottom)
				this.y += this.speed.y;
			state = 'left';
		}
		if (this.input.right || this.target.x > 0) {
			if (this.target.x > 0) this.target.x -= this.speed.x;
			if (this.x < gme.bounds.right)
				this.x += this.speed.x;
			state = 'right';
		}

		if (this.input.left || this.target.x < 0) {
			if (this.target.x < 0) this.target.x += this.speed.x;
			if (this.x > gme.bounds.left)
				this.x -= this.speed.x;
			state = 'left';
		}
		this.animation.state = state;

		if (!this.died) {
			if (this.metricCount == 200) {
				this.checkHunger();
				this.metricCount = 0;
			}
			this.metricCount++;
		}
	}

	back() {
		this.target.x = 0;
		this.target.y = 0;
		this.x = this.prevXY.x;
		this.y = this.prevXY.y;
	}

	spawn() {
		const pos = Cool.random(map.nodes.filter(node => node.room)).room.getCell();
		player.x = pos.x * cell.w; 
		player.y = pos.y * cell.h;
	}

	reborn() {
		this.health = 100;
		this.metricCount = 0;
		ui.metrics.health.update();
		ui.metrics.level.update();
		this.died = false;
		this.speed.x = 8;
		this.speed.y = 8;
		this.target.x = 0;
		this.target.y = 0;
	}

	checkMorality() {
		if (this.morality == 0) {
			ui.message.add(`You hath been morally neutral.`);
			ui.message.add(`You will remain in ${gme.lvl == 0 ? 'purgatory' : 'this ring of hell'}.`);
		}
		else if (this.morality > 0) {
			if (gme.lvl <= 0) {
				gme.lvl == 0;
				gme.scene = 'win';
				ui.message.set('Play again');
				ui.message.next = loadMap;
			} else {
				gme.lvl -= 1;
				ui.message.add(`You hath acted morally.`);
				ui.message.add(`You will move up to a previous ring of hell.`);
			}
		}
		else {
			ui.message.add(`You are a sinner.`);
			ui.message.add(`You will descend further into hell.`);
			gme.lvl += 1;
		}
	}

	checkHealth() {
		ui.metrics.health.update();
		if (this.health <= 0) {
			ui.message.add(`You hath died.`);
			this.died = true;
			this.checkMorality();
		}
	}

	checkHunger() {
		if (Math.floor(player.hunger/10) > this.hungerLevel) {
			this.hungerLevel = Math.floor(player.hunger/10);
			if (this.hungerLevel > 2) {
				this.speed.x -= 1;
				this.speed.y -= 1;
			}

			gme.scene = 'message';

			/* 
				this is insane 
				has to be set before going to switch and potentially dying
				other option is a set of states in the hell message ... also not appealing
				well ... if the character died, regardless, has to rebuild map ... 
			*/	

			switch(this.hungerLevel) {
				case 1:
					ui.message.set('You feel a slight pang of hunger.');
				break;
				case 2:
					ui.message.set('Was that sound your stomach?');
				break;
				case 3:
					ui.message.set('Your stomach growled.');
				break;
				case 4:
					ui.message.set('Your stomach is twisting in pain.');
				break;
				case 5:
					ui.message.set('You are starting to feel weak.');
				break;
				case 6:
					ui.message.set('You are beginning to feel light headed.');
				break;
				case 7:
					ui.message.set('Your body is desparate for food.');
				break;
				case 8:
					ui.message.set('You starved to death.');
					this.died = true;
					this.checkMorality();
				break;
			}

			
		}
	}

	consume(item, type) {

		this.typeString;
		switch(type) {
			case 'food':
				this.typeString = 'ate';
			break;
			case 'scripture':
				this.typeString = 'read';
			break;
		}

		gme.scene = 'message';

		// reset speed immediately, make this more complicated later
		this.speed.x = 8;
		this.speed.y = 8;

		ui.message.set(`You ${this.typeString} the ${item.name}.`);
		ui.message.add(item.quote);
		
		this.health = Math.min(100, this.health + item.health);
		if (item.health != 0) 
			ui.message.add(`Your health hath ${item.health > 0 ? 'increased' : 'decreased'}.`);
		
		this.hunger = Math.max(0, this.hunger - item.hunger);
		if (item.hunger > 0)
			ui.message.add(`Your hunger hath abated.`);

		this.hungerRate = Math.max(0.1, this.hungerRate + item.hungerRate);
		
		this.morality += item.morality;
		if (item.morality != 0)
			ui.message.add(`You hath ${item.morality > 0 ? 'acted morally' : 'sinned'}.`);
		
		this.speed.x += item.speed;
		this.speed.y += item.speed;

		ui.metrics.morality.update();
		
		this.checkHealth();
	}

}