class Sinner extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'purple';
		this.fightString = `${this.dt ? ' ' + this.dt: ''} ${this.label}`;

		this.xKey = () => {
			let score = player.fight(this);
			if (score > 0) map.remove(this); // if you lose you can fight again
		};
	}

	get moralityScore() {
		let score = 0;
		for (const moral in player.world) {
			score += this[moral];
		}
		return score;
	}
}