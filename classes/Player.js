class Player extends Sprite {
	constructor(json, x, y, debug) {
		super(Math.round(x), Math.round(y));
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.prevXY = { x: this.x, y: this.y };
		this.center = true; /* need better name */

		this.debug = debug || false;
		this.speed = new Cool.Vector(8, 8);
		
		this.addJSON(json, () => {
			this.animation.state = 'idle';
			this.setCollider(25, 6, 78, 90);
		});

		this.input = { right: false, up: false, left: false, down: false };
		this.target = new Cool.Vector(0, 0);

		this.health = 100;
		this.morality = 0;
		this.hunger = 0;

		this.inventory = new Inventory();
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	setTarget(x, y) {
		this.target.x = x;
		this.target.y = y;
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
			if (this.y > Game.bounds.top)
				this.y -= this.speed.y;
			state = 'right';
		}
		if (this.input.down || this.target.y > 0) {
			if (this.target.y > 0) this.target.y -= this.speed.y;
			if (this.y < Game.bounds.bottom)
				this.y += this.speed.y;
			state = 'left';
		}
		if (this.input.right || this.target.x > 0) {
			if (this.target.x > 0) this.target.x -= this.speed.x;
			if (this.x < Game.bounds.right)
				this.x += this.speed.x;
			state = 'right';
		}

		if (this.input.left || this.target.x < 0) {
			if (this.target.x < 0) this.target.x += this.speed.x;
			if (this.x > Game.bounds.left)
				this.x -= this.speed.x;
			state = 'left';
		}
		this.animation.state = state;
	}

	back() {
		this.target.x = 0;
		this.target.y = 0;
		this.x = this.prevXY.x;
		this.y = this.prevXY.y;
	}

	eat() {
	}
}