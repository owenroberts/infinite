class HellGate extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'orange';
		this.actionString = `Enter Judgement's Gate`;

		this.xKey = () => {
			player.enterGate();
		};

	}
}