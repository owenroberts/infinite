class Player extends Sprite {
	constructor(src, x, y, debug) {
		super(x, y);
		this._x = x;
		this._y = y;
		this.prevXY = { x: x, y: y };
		this.center = true; /* need better name */
		
		// this.position.x += Game.width/2;
		// this.position.y += Game.height/2;

		this.debug = debug || false;
		this.speed = new Cool.Vector(8, 8);
		
		this.addAnimation(src, () => {
			this.animation.state = 'idle';
		});

		this.input = { right: false, up: false, left: false, down: false };
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	set x(value) {
		this._x = Math.round(value);
	}

	get x() {
		return this._x;
	}

	set y(value) {
		this._y = Math.round(value);
	}

	get y() {
		return this._y;
	}

	collide(other) {
		// console.log(other);
		if (player.x < other.x + other.w &&
			player.x + player.width > other.x &&
			player.y < other.y + other.h &&
			player.y + player.height > other.y) {
			return true;
		} else {
			return false;
		}
	}

	update() {
		this.prevXY = { x: this.x, y: this.y };

		let state = this.animation.state.includes('idle') ?
			this.animation.state :
			Cool.random(['idle']);
			
		if (this.input.up) {
			if (this.y > Game.bounds.top)
				this.y -= this.speed.y;
			state = 'right';
		}
		if (this.input.down) {
			if (this.y < Game.bounds.bottom)
				this.y += this.speed.y;
			state = 'left';
		}
		if (this.input.right) {
			if (this.x < Game.bounds.right)
				this.x += this.speed.x;
			state = 'right';
		}
		if (this.input.left) {
			if (this.x > Game.bounds.left)
				this.x -= this.speed.x;
			state = 'left';
		}
		this.animation.state = state;
	}

	back() {
		this.x = this.prevXY.x;
		this.y = this.prevXY.y;
	}
}