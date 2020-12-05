const { src, dest, watch, series, parallel } = require('gulp');
const { lnsFiles } = require('./lines/gulpfile');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const server = require('gulp-webserver');
const merge = require('merge-stream');

const hellFiles = [
	'./map/Area.js', 
	'./map/Node.js',
	'./map/Map.js',
	'./classes/Room.js',
	'./classes/HellItem.js',
	'./classes/MapItem.js',
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
	const hellTask = jsTask(hellFiles, 'hell.min.js', './');
	const allLnsTasks = [];
	for (const file in lnsFiles) {
		
		// rewrite lnsFiles to include the local lines directory, only once 
		for (let i = 0; i < lnsFiles[file].length; i++) {
			if (!lnsFiles[file][i].includes('lines/'))
				lnsFiles[file][i] = lnsFiles[file][i].replace('./', './lines/');
		}
		allLnsTasks.push( jsTask(lnsFiles[file], `${file}.min.js`, './lines/build'));
	}

	return merge(hellTask, ...allLnsTasks);
}


function serverTask() {
	return src('./')
		.pipe(server({
			livereload: false,
			open: false,
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
	watch([...lnsFiles.base, ...lnsFiles.animate, ...lnsFiles.interface, ...lnsFiles.game, ...hellFiles],
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