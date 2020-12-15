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

		this.metricCount = 0;
		this.metricCheck = 24 * 1; // ~ 1 seconds
		this.died = false;
		this.health = 100;

		this.hunger = 0;
		this.hungerRate = 1;
		this.hungerInterval = 300;
		this.lastSpeedChange = this.hungerInterval;

		this.soundEnabled = false;
		this.stepCount = 0;
		this.stepInterval = 32 - this.speed.x * 2;

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

	setSpeed(n) {
		this.speed.x = +n;
		this.speed.y = +n;
		this.stepInterval = 32 - this.speed.x * 2;
	}

	getSpeed() {
		return this.speed.x;
	}

	get moralityScore() {
		return Object.values(this.morality).reduce((t, n) => t + n);		
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	update() {
		this.prevPosition = { x: this.mapPosition.x, y: this.mapPosition.y };
		
		let state = this.animation.stateName.includes('idle') ?
			this.animation.stateName :
			Cool.random(['idle']);

		let canMove = gme.currentSceneName == 'map';
			
		if (this.input.up) {
			if (this.mapPosition.y > gme.bounds.top && canMove) {
				this.mapPosition.y -= this.speed.y;
				this.hunger += this.hungerRate;
			}
			state = 'right';
			
		}
		if (this.input.down) {
			if (this.mapPosition.y < gme.bounds.bottom && canMove) {
				this.mapPosition.y += this.speed.y;
				this.hunger += this.hungerRate;
			}
			state = 'left';
			
		}
		if (this.input.right) {
			if (this.mapPosition.x < gme.bounds.right && canMove) {
				this.mapPosition.x += this.speed.x;
				this.hunger += this.hungerRate;
			}
			state = 'right';
		}

		if (this.input.left) {
			if (this.mapPosition.x > gme.bounds.left && canMove) {
				this.mapPosition.x -= this.speed.x;
				this.hunger += this.hungerRate;
			}
			state = 'left';
		}
		this.animation.state = state;

		if (!this.died && canMove) {
			if (this.metricCount == this.metricCheck) {
				this.checkHunger();
				this.metricCount = 0;
			}
			this.metricCount++;
		}

		this.stepCount++;
		if (state != 'idle' && this.soundEnabled && this.stepCount > this.stepInterval) {
			const idx = Cool.randomInt(gme.lvl + 10).clamp(0, this.stepSamples.length - 1);
			this.sfxPlayer.player(this.stepSamples[idx]).start();
			this.stepCount = 0;
		}
	}

	back() {
		this.mapPosition = this.prevPosition; // for collisions
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
		// this.health = 100;
		this.hunger = 0;
		this.hungerLevel = 0;

		ui.metrics.level.update();
		this.died = false;
		this.setSpeed(8);

		// reset morality???
	}

	checkMorality() {
		if (this.moralityScore == 0) {
			ui.message.add(`You hath been morally neutral`);
			ui.message.add(`You will remain in ${gme.lvl == 0 ? 'purgatory' : 'this ring of hell'}`);
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
				ui.message.add(`You hath acted morally`);
				// ui.message.add(`You will move up to a previous ring of hell.`);
			}
		}
		else {
			ui.message.add(`You are a sinner`);
			ui.message.add(`You descend further into hell`);
			gme.lvl += 1;
		}
		ui.metrics.morality.update();
	}

	checkHunger() {

		let msg = '';

		if (this.hunger > this.lastSpeedChange) {
			this.lastSpeedChange += this.hungerInterval;
			if (this.speed.x > 1) this.setSpeed(this.speed.x - 1);
		}

		let hi = Math.floor(this.hunger / this.hungerInterval);
		if (hi == 1) msg = 'You feel a pang of hunger';
		else if (hi == 2) msg = 'Was that sound your stomach?';
		else if (hi == 3) msg = 'Your stomach growled';
		else if (hi == 4) msg = 'Your stomach is twisting in pain';
		else if (hi == 5) msg = 'You feel weak';
		else if (hi == 6) msg = 'You feel light headed';
		else if (hi == 7) msg = 'Your body is desparate for food';
		else if (hi == 8) {
			this.playSFX('died');
			gme.scene = 'message'; // set message before death
			ui.message.set('You starved to death');
			this.died = true;
			this.checkMorality();
		}
		if (!this.died && msg && !this.isColliding) ui.console.setMsg(msg);
	}

	enterGate() {
		this.playSFX('gate');
		gme.scene = 'message'; // happens first?
		this.died = true; // this is short cut for now
		this.checkMorality();
	}

	fight(sinner) {
		this.playSFX('fight');

		let score = 0;
		for (const moral in this.world) {
			// compare each moral to sinner
			const playerScore = this.morality[moral] + this.world[moral];
			console.log(moral, playerScore, this.morality[moral], this.world[moral])
			const comp = playerScore + sinner[moral];
			console.log(comp);
			if (comp > 0) score++;
			else if (comp < 0) score--;
		}

		gme.scene = 'message';
		if (score == 0) ui.message.set(`You and ${sinner.fightString} are equals in sin.`);
		else if (score < 0) ui.message.set(`You were defated by the sin of ${sinner.fightString}`);
		else if (score > 0) ui.message.set(`You defeated ${sinner.fightString} with righteousness.`);

		player.morality.adjust += score; // this might be too much ... 
		ui.metrics.morality.update();
		return score;
	}

	action(item) {
		// console.log(item);
		this.playSFX(item.action);

		gme.scene = 'message';

		ui.message.set(`You ${item.actionString}`);
		ui.message.add(item.source);

		if (item.type == 'food') {
			this.hunger = 0;
			ui.message.add(`Your hunger hath abated`);
			this.checkHunger();
			this.setSpeed(8); // reset speed
		}
		
		for (const key in this.world) {
			if (+item[key] !== 0) {
				// console.log(item.type, item.label, key, item[key], this.world[key]);
				if (item.type == 'food') {
					// calculate based on formula
					let score = +item[key] + this.world[key]
					// console.log('score', score);
					this.morality[key] += score; // this is fucked
					// there's three possibilities ... 
					ui.message.add(score < 0 ? 'You hath sinned' : 'You hath acted morally');
				}

				else if (item.type == 'scripture' || item.type == 'animal') {
					this.world[key] += +item[key];
					ui.message.add(+item[key] < 0 ? 
						`Your knowledge of ${key} is clouded` : 
						`You are learned of ${key}` );
				}
			}
		}

		if (item.special) {
			// console.log(item.type, item.label, 'special');
			let specials = item.special.split('&');
			for (let i = 0; i < specials.length; i++) {
				let [n, prop] = specials[i].split('/');
				// console.log(n, prop);
				if (prop.includes('m-')) {
					prop = prop.split('-')[1];
					this.morality[prop] += +n;
				} else {
					if (prop == 'speed') this.setSpeed(this.speed.x + +n);
					else this[prop] += +n;
				}
				if (prop == 'adjust') prop = 'moral feeling';
				ui.message.add(`You gained ${n} of ${prop}`);
			}
		}
		
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

	playSFX(type) {
		if (this.soundEnabled) {
			if (!this.sfxSamples.hasOwnProperty(type)) type = 'special';
			let sample = Cool.random(this.sfxSamples[type]);
			this.sfxPlayer.player(sample).start();
		}
	}

	soundSetup() {

		const urls = {};
		const sfx = {
			'continue': 2,
			'dead': 2,
			'eat': 2,
			'fight': 1,
			'gate': 6,
			'read': 6,
			'sacrifice': 3,
			'special': 2
		};

		this.sfxSamples = {};

		for (const key in sfx) {
			this.sfxSamples[key] = [];
			for (let i = 1; i <= sfx[key]; i++) {
				urls[`${key}-${i}`] = `sfx/${key}-${i}.mp3`;
				this.sfxSamples[key].push(`${key}-${i}`);
			}
		}

		this.stepSamples = [];
		const steps = {
			'step': 10,
			'stones': 6,
			'mud': 6,
			'splash': 3
		};
		
		for (const key in steps) {
			for (let i = 1; i <= steps[key]; i++) {
				urls[`${key}-${i}`] = `footsteps/${key}-${i}.mp3`;
				this.stepSamples.push(`${key}-${i}`);
			}
		}

		this.sfxPlayer = new Tone.Players({volume: -6}).toDestination();
		// this.sfxPlayer.volume = -6;
		console.time('load sfx');
		let samples = new Tone.ToneAudioBuffers({
			urls: urls,
			baseUrl: "../audio/",
			onload: () => {
				console.timeEnd('load sfx');
				for (let url in urls) {
					this.sfxPlayer.add(url, samples.get(url));
				}
				this.soundEnabled = true;
			}
		});

		/*
			sounds (remember to stick this somewhere visible)
			https://freesound.org/people/MWLANDI/sounds/85858/
			https://freesound.org/people/MWLANDI/sounds/85857/
			https://freesound.org/people/InspectorJ/sounds/329603/
			https://freesound.org/people/InspectorJ/sounds/329602/
			https://freesound.org/people/florianreichelt/sounds/459964/
		*/
	}
}