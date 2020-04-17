class HellGame extends Game {
	constructor(...args) {
		super(...args);
		this.lvl = 0;
	}
	
	set scene(scene) {
		if (scene != this.scenes._current) {
			this.scenes.current = scene;
			ui.cursor.state = 'interact';
			switch(scene) {
				case 'map':
					ui.cursor.state = 'walk';
				break;
				case 'loading':
					ui.message.x = leftAlign;
					ui.cursor.state = 'loading';
				break;
				case 'message':
					ui.message.x = leftAlign;
				break;
				case 'inventory':
					ui.message.x = centerAlign;
				break;
			}
			ui.arrow.isActive = false;
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