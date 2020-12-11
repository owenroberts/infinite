/*
	mapPosition is used to offset map sprites (entity)
	position is where it draws on screen (doesn't change if player is centered)
*/

class Player extends Sprite {
	constructor(animation, x, y, debug) {
		super(Math.round(x), Math.round(y));
		this.mapPosition = {
			x: Math.round(x),
			y: Math.round(y)
		};
		this.prevPosition = { x: this.mapPosition.x, y: this.mapPosition.y };
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

		this.hunger = 0;
		this.hungerRate = 0.05;
		this.hungerLevel = 0;
		this.hungerString = '';

		this.morality = {
			gluttony: 0,
			sloth: 0,
			lust: 0,
			pride: 0,
			greed: 0,
			envy: 0,
			wrath: 0,
			adjust: 0
		};

		this.world = {
			gluttony: 0,
			sloth: 0,
			lust: 0,
			pride: 0,
			greed: 0,
			envy: 0,
			wrath: 0
		};
	}

	get moralityScore() {
		return Object.values(this.morality).reduce((t, n) => t + n);		
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	setTarget(x, y) {
		this.target = { x: x, y: y};
		this.hunger += this.hungerRate; // what about key presses .... 
		// abstract to a move function and put this there
	}

	update() {
		if (Math.abs(this.target.x) < this.speed.x) this.target.x = 0;
		if (Math.abs(this.target.y) < this.speed.y) this.target.y = 0;
		this.prevPosition = { x: this.mapPosition.x, y: this.mapPosition.y };
		
		let state = this.animation.stateName.includes('idle') ?
			this.animation.stateName :
			Cool.random(['idle']);
			
		if (this.input.up || this.target.y < 0) {
			if (this.target.y < 0) this.target.y += this.speed.y;
			if (this.mapPosition.y > gme.bounds.top)
				this.mapPosition.y -= this.speed.y;
			state = 'right';
		}
		if (this.input.down || this.target.y > 0) {
			if (this.target.y > 0) this.target.y -= this.speed.y;
			if (this.mapPosition.y < gme.bounds.bottom)
				this.mapPosition.y += this.speed.y;
			state = 'left';
		}
		if (this.input.right || this.target.x > 0) {
			if (this.target.x > 0) this.target.x -= this.speed.x;
			if (this.mapPosition.x < gme.bounds.right)
				this.mapPosition.x += this.speed.x;
			state = 'right';
		}

		if (this.input.left || this.target.x < 0) {
			if (this.target.x < 0) this.target.x += this.speed.x;
			if (this.mapPosition.x > gme.bounds.left)
				this.mapPosition.x -= this.speed.x;
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
		this.target = { x: 0, y: 0};
		this.mapPosition = this.prevPosition;
	}

	spawn() {
		const nodes = shuffle(map.nodes.filter(node => node.room));
		let location;
		for (let i = 0; i < nodes.length; i++) {
			location = nodes[i].room.getCell('player');
			if (location) break;
		}
		this.mapPosition.x = location.x * cellSize.w; 
		this.mapPosition.y = location.y * cellSize.h;
	}

	reborn() {
		this.health = 100;
		
		ui.metrics.level.update();
		this.died = false;
		this.speed.x = 8;
		this.speed.y = 8;
		this.target.x = 0;
		this.target.y = 0;
	}

	checkMorality() {
		if (this.moralityScore == 0) {
			ui.message.add(`You hath been morally neutral.`);
			ui.message.add(`You will remain in ${gme.lvl == 0 ? 'purgatory' : 'this ring of hell'}.`);
		}
		else if (this.moralityScore > 0) {
			if (gme.lvl <= 0) {
				gme.lvl == 0;
				gme.scene = 'win';
				// ui.message.set('Play again');
				ui.message.continue.setMsg('Play again');
				ui.message.next = loadNextMap;
			} else {
				gme.lvl -= 1;
				ui.message.add(`You hath acted morally.`);
				// ui.message.add(`You will move up to a previous ring of hell.`);
			}
		}
		else {
			ui.message.add(`You are a sinner.`);
			ui.message.add(`You descend further into hell.`);
			gme.lvl += 1;
		}
		ui.metrics.morality.update();
	}

	checkHunger() {
		// console.log(player.hunger, this.hungerLevel)
		if (Math.floor(this.hunger) > this.hungerLevel) {
			this.hungerLevel = Math.floor(this.hunger);
			if (this.hungerLevel > 2) {
				this.speed.x -= 1;
				this.speed.y -= 1;
			}
		} else if (this.hunger == 0) {
			this.hungerLevel = 0;
		}
		
		if (this.hungerLevel == 0) this.hungerString = '';
		else if (this.hungerLevel == 1) this.hungerString = 'You feel a pang of hunger.';
		else if (this.hungerLevel == 2) this.hungerString = 'Was that sound your stomach?';
		else if (this.hungerLevel == 3) this.hungerString = 'Your stomach growled.';
		else if (this.hungerLevel == 4) this.hungerString = 'Your stomach is twisting in pain.';
		else if (this.hungerLevel == 5) this.hungerString = 'You feel weak.';
		else if (this.hungerLevel == 6) this.hungerString = 'You feel light headed.';
		else if (this.hungerLevel == 7) this.hungerString = 'Your body is desparate for food.';
		else if (this.hungerLevel == 8) {
			gme.scene = 'message'; // set message before death
			ui.message.set('You starved to death.');
			this.died = true;
			this.checkMorality();
		}
		ui.metrics.hunger.update(); // annoying for this to be here?
	}

	consume(item, type) {

		let typeString;
		switch(type) {
			case 'food':
				typeString = 'ate';
			break;
			case 'scripture':
				typeString = 'read';
			break;
		}

		gme.scene = 'message';

		ui.message.set(`You ${typeString} the ${item.label}.`);
		ui.message.add(item.source);
		
		// console.log(this.hunger, item.hunger, +item.hunger, this.hunger + +item.hunger);
		// this.hunger = Math.max(0, this.hunger + +item.hunger);
		// if (item.hunger > 0) ui.message.add(`Your hunger hath abated.`);
		// this.hungerRate = Math.max(0.1, this.hungerRate + +item.hungerRate);
		// simplify

		if (type == 'food') {
			this.hunger = 0;
			ui.message.add(`Your hunger hath abated.`);
			this.checkHunger();
			this.speed.x = 8; // reset speed
			this.speed.y = 8;
		}
		
		for (const key in this.world) {
			if (+item[key] != 0) {
				if (type == 'food') {
					// calculate based on formula
					this.morality[key] += +item[key] + this.world[key]; // this is fucked
					ui.message.add(+item[key] < 0 ? 'You hath sinned' : 'You hath acted morally');
				}

				else if (type == 'scripture') {
					this.world[key] += +item[key];
					ui.message.add(+item[key] < 0 ? 
						`You gain knowledge of ${key}` : 
						`You learn ${key}` );
				}
			}
		}
		
		this.speed.x += +item.speed;
		this.speed.y += +item.speed;

		ui.metrics.morality.update();
	}

	display() {
		super.display();

		// debug opject ?
		if (mapAlpha > 0) {
			gme.ctx.globalAlpha = mapAlpha;
			gme.ctx.fillStyle = 'blue';
			gme.ctx.fillRect(this.mapPosition.x / cellSize.w * mapCellSize, this.mapPosition.y / cellSize.h * mapCellSize, 8, 8);

			gme.ctx.globalAlpha = 1.0;
		}
	}
}