class Wall extends Room {
	constructor(x, y) {
		super(x, y, 1, 1, 'lightgreen');
	}
	
	addTexture() {
		this.texture.addJSON(Game.textures.walls, true);
	}
}