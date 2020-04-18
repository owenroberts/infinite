const { src, dest, watch, series, parallel } = require('gulp');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');


/*
gulp.task('scripts', () => {
	return gulp.src([)
	.pipe(concat('game.min.js'))
	.pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
	.pipe(gulp.dest('./'));
});
*/

const jsFiles = [
	'./lines/classes/LinesAnimation.js', 
	'./lines/game/classes/*.js', 
	'./map/Area.js', 
	'./map/Node.js',
	'./map/Map.js', 
	'./classes/*.js', 
//	'./hell.js'
];

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
    return src(jsFiles)
    	.pipe(babel())
		.pipe(concat('game.min.js'))
//		.pipe(uglify())
		.pipe(dest('./')
    );
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
    watch(jsFiles,
        {interval: 1000, usePolling: true}, //Makes docker work
        series(
            parallel(jsTask),
            cacheBustTask
        )
    );    
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
    parallel(jsTask), 
    cacheBustTask,
    watchTask
);