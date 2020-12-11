function Sound() {

	const themes = [
		[ 
			['F3', 'A#3'], ['G3'], ['A3'], ['D4', 'A#3'],
			['D4'], ['F4', 'A#4'], ['D4', 'A#4'], ['F3', 'A4'], ['G3'], ['A3']
		],
		[
			['F3', 'A#3'], ['D3', 'A3'], ['F3', 'A#3'], ['D3', 'A3'],
			['F3', 'D4'], ['D3', 'A3'], ['F3', 'F4'], ['D3', 'A3', 'F4'], 
		],
		[
			['F3', 'A#3'], ['D3', 'A3'], ['F3', 'A#3', 'D4'], ['D3', 'A3', 'F4'],
			['F3', 'D4'], ['D3', 'A3', 'G4']
		],
		[
			['F4', 'A#4'], ['F4', 'A#4'], ['F4', 'A#4'],
			['G4', 'A#4'], ['G4', 'A#4'], ['G4', 'A#4'],
			['A4', 'A#4'], ['A4', 'A#4'], ['A4', 'A#4'],
			['D4', 'G4'], ['D4', 'G4'], ['D4', 'G4'], 
			['D4', 'G4'], ['D4', 'G4'], ['D4', 'G4'], 
		],
		[
			['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'], 
			['D3', 'A#3'], ['D3', 'A#3'],
			['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'], 
			['D3', 'A#3'], ['D3', 'A#3'],
			['D3', 'A#3'], ['D3', 'A#3'], ['D3', 'A#3'], ['D3', 'A#3'],
			['D3', 'A#3'], ['D3', 'A#3'], ['D3', 'A#3']
		],
		[
			['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'], ['D#3', 'A#3'],
			'D#3', 'A#3', 'D#3', 'A#3', 'D#3', 'A#3', 'D#3', 'A#3',
			['F3', 'A3'], ['F3', 'A3'], ['F3', 'A3'], ['F3', 'A3'], ['F3', 'A3'],
			'F3', 'A3', 'F3', 'A3'
		]
	];

	let playing = false;
	let choirSamples;

	const melody = ['C4', 'A3', 'G3', 'D4', 'E4', 'G4', 'A4', 'C5', 'C4', 'D5', 'C5', 'D5'];

	function makeLoop(dur, len, idx) {
		const sampler = getSampler();
		let count = idx || 0;
		let attack = 0.5;
		const loop = new Tone.Loop(() => {
			sampler.triggerAttackRelease(melody[count % melody.length], `${dur/2}n`, undefined, attack);
			attack += Cool.random(-0.1, 0.1);
			count++;
			if (count ==  melody.length * len) {
				loop.stop();
			}
			// console.log(count);
		}, `${dur}n`).start();
	}

	this.playTheme = function() {
		Tone.Transport.bpm.value = player.speed.x * 16;
		console.log('bpm', Tone.Transport.bpm.value);
		if (playing) Tone.Transport.stop();
		
		// makeLoop(2, 2, 0);
		// makeLoop(2, 2, 1);
		makeLoop(8, 4, 0);
		
		Tone.Transport.start();
	};
	

	function getSampler() {
		const sampler = new Tone.Sampler({
			urls: {
				C4: choirSamples.get('C4'),
				A3: choirSamples.get('A3'),
				G3: choirSamples.get('G3'),
				'Eb4': choirSamples.get('Eb4') // replace with E4
			}
		}).toDestination();

		// const distortion = new Tone.Distortion(0.1).toDestination();
		// const chorus = new Tone.Chorus(4, 2.5, 0.5);
		// const freeverb = new Tone.Freeverb().toDestination();
		// freeverb.dampening = 1000;
		// const crusher = new Tone.BitCrusher(4).toDestination();
		// const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();

		// sampler.connect(crusher);
		return sampler;
	}

	function setup(callback) {
		choirSamples = new Tone.ToneAudioBuffers({
			urls: {
				C4: "uu_c4.mp3",
				A3: "uu_a3.mp3",
				G3: "uu_g3.mp3",
				'Eb4': "uu_eb4.mp3"
			},
			baseUrl: "./audio/choir/",
			onload: () => {
				console.log(choirSamples);
				callback();
			}
		});
	}

	(async () => {
		await Tone.start();
		setup(this.playTheme);
	})();
}