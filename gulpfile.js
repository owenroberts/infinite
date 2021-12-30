const { src, dest, watch, series, parallel, task } = require('gulp');
const lines = require('./lines/gulpfile');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const merge = require('merge-stream');
const npmDist = require('gulp-npm-dist');

const hellFiles = [
	'./map/Area.js', 
	'./map/Node.js',
	'./map/Map.js',
	'./src/Room.js',
	'./src/HellItem.js',
	'./src/MapItem.js',
	'./src/*.js'
];

function browserSyncTask() {
	return browserSync.init({
		port: 8080,
		server: {
			baseDir: './',
		}
	});
}

function jsTask(){
	return src(hellFiles)
		.pipe(sourcemaps.init())
		.pipe(concat('hell.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./src_maps'))
		.pipe(dest('./build'))
		.pipe(browserSync.stream());
}

function libTask() {
	return src(npmDist(), { base: './node_modules' })
		.pipe(dest('./build/lib'));
}

function linesCopy() {
	// choose just base and game later ...
	return src([
			'./lines/build/base.min.js', 
			'./lines/build/src_maps/base.min.js.map',
			'./lines/build/game.min.js',
			'./lines/build/src_maps/game.min.js.map',
			'./lines/build/lib/**/*',
		], { base: './lines/build/' })
		.pipe(dest('./build'))
		.pipe(browserSync.stream());
}

function cacheBustTask(){
	var cbString = new Date().getTime();
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
}

function watchTask(){
	watch([...hellFiles],series(parallel(jsTask)));
	watch(['./lines/classes/*.js', './lines/game/classes/*.js'], series(lines.exportTask, linesCopy));
}

task('jsTask', jsTask);
task('lib', series(libTask, lines.exportTask, linesCopy));
task('build', series(jsTask));
task('watch', parallel('build', cacheBustTask, browserSyncTask, watchTask));
task('default', parallel('watch'));