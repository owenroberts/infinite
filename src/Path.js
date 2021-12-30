class Path extends Room {

	addTextureAnimation() {
		this.texture.addAnimation(gme.anims.textures.grass);
		this.texture.debug = true;
		console.log(this);
	}

}