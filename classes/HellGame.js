class HellGame extends Game {
	constructor(...args) {
		super(...args);
		this.lvl = 0;
	}
	
	set scene(scene) {
		if (scene != this.scenes._current) {
			this.scenes.current = scene;
		}
	}

	get currentScene() {
		return this.scenes.current;
	}

	get currentSceneName() {
		return this.scenes._current;
	}

	get lvlName() {
		return this.lvl == 0 ? 'Purgatory' : `Ring of Hell ${this.lvl}`
	}
}