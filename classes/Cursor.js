class Cursor {
	constructor(states) {
		this.states = states;
		this.elem = document.getElementById('cursor');
		this.x = 0;
		this.y = 0;
		this.isDown = false;
	}

	set state(state) {
		if (this._state != state) {
			this._state = state;
			this.elem.src = this.states[state];
		}
	}

	get state() {
		return this._state;
	}

	down() {
		this.isDown = true;
	}

	up() {
		this.isDown = false;
	}
}