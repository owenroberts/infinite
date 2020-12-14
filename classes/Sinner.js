class Sinner extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'purple';
		this.fightString = `${this.dt ? ' ' + this.dt: ''} ${this.label}`;

		this.xKey = () => {
			
			let score = 0;
			for (const moral in player.world) {
				// compare sinner and moral
				const comp = (+player.morality[moral] + +player.world[moral]) + this[moral];
				if (comp > 0) score++;
				else if (comp < 0) score--;
			}

			gme.scene = 'message';
			if (score == 0) ui.message.set(`You and ${this.fightString} are equals in sin.`);
			else if (score < 0) ui.message.set(`You were defated by the sin of ${this.fightString}`);
			else if (score > 0) ui.message.set(`You defeated ${this.fightString} with righteousness.`);
			
			player.morality.adjust += score; // this might be too much ... 
			if (score > 0) map.remove(this);
			ui.metrics.morality.update();
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