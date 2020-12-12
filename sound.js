// https://www.guitarland.com/MusicTheoryWithToneJS/PlayMajorScale.html
// http://www.myriad-online.com/resources/docs/manual/english/gregorien.htm

// https://en.wikibooks.org/wiki/IB_Music/Music_History/Medieval_Period#:~:text=The%20Gregorian%20chant%20began%20to,independently%20of%20the%20original%20chant.
/*
	The Gregorian chant began to evolve around 700. From 700 - 900, composers would write a line in parallel motion to the chant at a fixed interval of a fifth or a fourth above the original line. This technique evolved further from 900 - 1200. During this period, the upper line moved independently of the original chant. After 1100, upper lines even began gaining rhythmic independence.
*/

function Sound() {

	var MIDI_NUM_NAMES = [
		"C_1", "C#_1", "D_1", "D#_1", "E_1", "F_1", "F#_1", "G_1", "G#_1", "A_1", "A#_1", "B_1",
		"C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
		"C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
		"C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
		"C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
		"C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
		"C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
		"C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
		"C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
		"C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
		"C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9"];

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
	let mutations = 0;
	let choirSamples;
	let loops = [];
	let loopNum = { min: 2, max: 4 };
	let durs = [1, 2, 4, 8];
	let startDelays = [0, '1n', '2n', '4n', '8n', '1m', '2m'];
	let longDelays = ['3m', '4m', '5m', '6m'];
	let indexJump = { min: -1, max: 1 }
	let attackStart = { min: 0.25, max: 0.75 };
	let attackJump = { min: -0.2, max: 0.2 };


	// const melody = ['C4', 'A3', 'G3', 'D4', 'E4', 'G4', 'A4', 'C5', 'C4', 'D5', 'C5', 'D5'];
	const major = [0, 2, 4, 5, 7, 9, 11];
	let tonic = 60; // C4
	// const midi = [60, 57, 55, 62, 64, 67, 69, 72, 60, 74, 72, 74];
	// let intervals = [0, -3, -5, 2, 4, 7, 9, 12, 0, 14, 12, 14];
	let intervals = [
		-7, -3, 0, null, 9, 5, 4, null, -7, -3, 0, -3, 2, 0, 4, 9,
		-7, -3, 0, null, 9, 4, 2, null, -7, -3, 0, -3, 2, 0, 4, 9
	];
	// convert melody to intervals ... 
	// or use teo


	// melody 
	// F3 A3 C4 . A4 F4 E4 . F3 A3 C4 A3 D4 C4 E4 A4
	// F3 A3 C4 . A4 E4 D4 .

	function mutate() {
		// change melody
		// change key ??
	}

	function getMelody(startNote) {
		let melody = [];
		for (let i = 0; i < intervals.length; i++) {
			if (intervals[i] != null) {
				const note = startNote + intervals[i];
				melody.push(MIDI_NUM_NAMES[note]);
			} else {
				melody.push(null);
			}
		}
		console.log(melody);
		return melody;
	}

	function getHarmony(startNote, interval) {
		interval -= 1; // offset
		let harmony = [];
		for (let i = 0; i < intervals.length; i++) {
			const int = intervals[i];
			if (int != null) {

				// find where in the scale this note goes
				let index;
				let offset = Math.floor(Math.abs(int) / 12) * 12 * (int < 0 ? -1 : 1);
				
				if (int < 0) { // interval below tonic
					index = major.indexOf(12 - (Math.abs(int) % 12));
				} else { // interval above tonic
					index = major.indexOf(int % 12);
				}

				let harm = major[(index + interval) % major.length];
				const note = startNote + harm + offset;
				harmony.push(MIDI_NUM_NAMES[note]);
			} else {
				harmony.push(null);
			}
		}
		console.log(harmony);
		return harmony;
	}

	function makeLoop(dur, len, idx, delay, melody) {
		const sampler = getSampler();
		let count = idx || 0;
		let attack = Cool.random(attackStart.min, attackStart.max);
		const loop = new Tone.Loop((time) => {
			// console.log(count, attack, dur, len, idx, delay);
			const randomRest = false; // Cool.random(1) > 0.95;
			const note = randomRest ? null : melody[count % melody.length];
			if (note) {
				sampler.triggerAttackRelease(note, `${dur/2}n`, undefined, attack);
			}
			attack += Cool.random(attackJump.min, attackJump.max);
			attack.clamp(0.1, 1);
			count++;
			if (count >= melody.length * len + idx) {
				loop.stop();
				if (loops.every(loop => { return loop.state == 'stopped'})) {
					// playTheme();
				}
			}
		}, `${dur}n`).start(delay);
		return loop;
	}

	function playTheme() {
		Tone.Transport.bpm.value = player.speed.x * 16;
		console.log('bpm', Tone.Transport.bpm.value);
		if (playing) Tone.Transport.stop();

		loops = [];

		loops.push( makeLoop(4, 1, 0, 0, getMelody(tonic)) );
		if (Cool.random([1])) {
			loops.push( makeLoop(4, 1, 0, 0, getHarmony(tonic, 3)) );
		}
		mutations++;

		// let num = Cool.random(loopNum.min, loopNum.max); // number of loops
		// let dur = Cool.random(durs); // start duration
		// let idx = Cool.randomInt(melody.length); // start index
		// let delay = Cool.random(startDelays);

		// // set longer delays
		// // len rel to dur
		// // console.log('begin values', dur, num);
		// for (let i = 0; i < num; i++) {
		// 	loops.push( makeLoop(dur, 1, idx, delay) );
		// 	dur = Cool.random([dur/2, dur*2, dur]);
		// 	// if (Cool.random(1) > 0.9) delay += 't';
		// 	idx = Cool.random([idx, idx + indexJump.min, idx - indexJump.max]);
		// 	delay = Cool.random([...startDelays, ...longDelays]);
		// 	if (Cool.random(1) > 0.75 && delay != 0) delay += '.';
		// 	// console.log('new values', dur, delay);
		// }
		
		Tone.Transport.start('+0.1');
	};
	

	function getSampler() {
		const sampler = new Tone.Sampler({
			urls: {
				C4: choirSamples.get('C4'),
				A3: choirSamples.get('A3'),
				G3: choirSamples.get('G3'),
				'Eb4': choirSamples.get('Eb4') // replace with E4
			},
			volume: -6
		}).toDestination();

		// const distortion = new Tone.Distortion(0.1).toDestination();
		// const chorus = new Tone.Chorus(4, 2.5, 0.5);
		// const freeverb = new Tone.Freeverb().toDestination();
		// freeverb.dampening = 1000;
		// const crusher = new Tone.BitCrusher(4).toDestination();
		const freq = Cool.random(0.5, 1);
		const depth = Cool.random(0.1, 1);
		const tremolo = new Tone.Tremolo(freq, depth).toDestination().start();

		sampler.connect(tremolo);
		return sampler;
	}

	function setup(callback) {
		// add ee and aa
		choirSamples = new Tone.ToneAudioBuffers({
			urls: {
				C4: "uu_c4.mp3",
				A3: "uu_a3.mp3",
				G3: "uu_g3.mp3",
				'Eb4': "uu_eb4.mp3"
			},
			baseUrl: "./audio/choir/",
			onload: () => {
				callback();
			}
		});
	}

	this.play = function() {
		this.playTheme();
	};

	(async () => {
		await Tone.start();
		setup(playTheme);
	})();
}