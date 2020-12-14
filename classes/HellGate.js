class HellGate extends MapItem {
	constructor(...args) {
		super(...args);
		this.c = 'orange';
		this.actionString = `Enter Judgement's Gate`;

		this.xKey = () => {
			gme.scene = 'message'; // happens first?
			player.died = true; // this is short cut for now
			player.checkMorality();
		};

	}
}