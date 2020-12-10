class Sinner extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'purple';
		this.consoleMessage = `fight ${this.label}`;

		this.xKey = () => {
			
			let score = 0;
			for (const moral in player.world) {
				// compare sinner and moral
				const comp = (+player.morality[moral] + +player.world[moral]) + this[moral];
				if (comp > 0) score++;
				else if (comp < 0) score--;
			}

			gme.scene = 'message';
			if (score == 0) ui.message.set(`You and ${this.label} are equals in sin.`);
			else if (score > 0) ui.message.set(`The ${this.label} defeated you with sin.`);
			else if (score > 0) ui.message.set(`You defeated the ${this.label} with righteousness.`);
			player.morality.adjust += score; // this might be too much ... 

			if (score > 0) {
				map.remove(this);
			}
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