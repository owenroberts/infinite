const { src, dest, watch, series, parallel } = require('gulp');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const server = require('gulp-webserver');
const merge = require('merge-stream');


const lnsFiles = [
	'./lines/game/classes/Sprite.js',
	'./lines/game/classes/UI.js',
	'./lines/game/classes/*.js',
];

const hellFiles = [
	'./map/Area.js', 
	'./map/Node.js',
	'./map/Map.js',
	'./classes/Room.js', 
	'./classes/*.js',
	'./hell.js'
];


// JS task: concatenates and uglifies JS files to script.js
function jsTask(files, name, dir){
	return src(files)
		.pipe(sourcemaps.init())
		.pipe(concat(name))
		.pipe(uglify())
		.pipe(sourcemaps.write('./src_maps'))
		.pipe(dest(dir)
	);
}

function jsTasks() {
	const anim = jsTask(['./lines/classes/LinesAnimation.js'], 'anim.min.js', './lines/src/');
	const game = jsTask(lnsFiles, 'game.min.js', './lines/src/');
	const hell = jsTask(hellFiles, 'hell.min.js', './');
	return merge(anim, game, hell);
}


function serverTask() {
	console.log('server task')
	return src('./')
		.pipe(server({
			livereload: true,
			open: true,
			port: 8080	// set a port to avoid conflicts with other local apps
		}));
}

// Cachebust
function cacheBustTask(){
    var cbString = new Date().getTime();
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
	watch([...lnsFiles, ...hellFiles],
		{interval: 1000, usePolling: true}, //Makes docker work
		series(
			parallel(jsTasks),
			cacheBustTask
		)
	);    
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
	parallel(jsTasks),
	cacheBustTask,
	serverTask,
	watchTask
);