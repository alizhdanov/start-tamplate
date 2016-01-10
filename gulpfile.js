'use strict';

/*******************************************************************************\
		1.	DEPENDENCIES
\*******************************************************************************/

var gulp = require("gulp"),																// gulp core
		sass = require('gulp-sass'),													// sass compiler
		gulpif = require('gulp-if'),													// conditionally run a task
		clean = require('gulp-clean'),												// removing files and folders
		uglify = require('gulp-uglify'),											// uglifies the js
		rename = require("gulp-rename"),											// rename files
		useref = require('gulp-useref'),											// parse build blocks in HTML files to replace references
		bourbon = require('node-bourbon'),										// bourbon libruary
		wiredep = require('wiredep').stream,									// bower dependencies to your source code
		minifyCss = require('gulp-minify-css'),								// minify the css files
		autoprefixer = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),					// sets missing browserprefixes
		browserSync = require('browser-sync').create(),
		sourcemaps = require('gulp-sourcemaps'),
		gzip = require('gulp-gzip');			// inject code to all devices

/*******************************************************************************\
		2.	BROWSERSYNC (LOCAL SERVEVR)
\*******************************************************************************/

gulp.task('connect', ['watch'], function() {							// files to inject
	browserSync.init({
		server: {
			baseDir: "./app/"																		// base dir
		}
	});
});

/*******************************************************************************\
		3.	WATCHER (WATCHING FILE CHANGES)
\*******************************************************************************/

gulp.task('watch', function () {
	gulp.watch(['./app/*.html'], ['html']),									// watching changes in HTML
	gulp.watch(['./app/sass/*.sass'], ['scss']),						// watching changes in SASS
	gulp.watch(['./app/js/*.js'], ['js']);									// watching changes in JS
});

/*******************************************************************************\
		4.	HTML TASKS
\*******************************************************************************/

gulp.task('html', function () {
	gulp.src('./app/index.html')														// get the files
		.pipe(wiredep({
			directory: "./app/bower/"														// dir where wiredep get files 
		}))
		.pipe(gulp.dest('./app/'))														// where to put the file
		.pipe(browserSync.stream());													// browsersync stream
});

/*******************************************************************************\
		5.	SASS TASKS
\*******************************************************************************/

gulp.task('scss', function () {
	gulp.src('./app/sass/*.sass')														// get the files
		.pipe(sass({includePaths: require('node-bourbon').includePaths}).on('error', sass.logError))
		.pipe(autoprefixer({browsers: ['last 15 versions'], cascade: false}))
		.pipe(gulp.dest('app/css'))														// where to put the file
		.pipe(browserSync.stream());													// browsersync stream
});

/*******************************************************************************\
		6.	JS TASKS
\*******************************************************************************/

gulp.task('js', function() {
	return gulp.src('./app/js/common.js')										// get the files
		.pipe(browserSync.stream()); 													// browsersync stream
});

/*******************************************************************************\
		7.	IMAGES TASKS
\*******************************************************************************/

gulp.task('images', function () {
	return gulp.src('./app/img/**/*')
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))												// get the files
		.pipe(gulp.dest('dist/img'))													// where to put the file
});

/*******************************************************************************\
		8.	FONTS TASKS
\*******************************************************************************/

gulp.task('fonts', function () {
	return gulp.src('./app/fonts/**/*')											// get the files
		.pipe(gulp.dest('dist/fonts'))												// where to put the file
});

/*******************************************************************************\
		9.	LIBS TASKS (PERSONAL DEVELOPER LIBS)
\*******************************************************************************/

gulp.task('libs', function () {
	return gulp.src('./app/libs/**/*')											// get the files
		.pipe(gulp.dest('dist/libs'))													// where to put the file
});

/*******************************************************************************\
		10.	EXTRASS TASKS (ROOT FILES, EXCEPT HTML-FILES)
\*******************************************************************************/

gulp.task('extrass', function () {
	return gulp.src([																				// get the files
		'app/*.*',
		'!app/*.html'																					// exept '.html'
	]).pipe(gulp.dest('dist'))															// where to put the file														
});

/*******************************************************************************\
		11.	BUILD TASKS
\*******************************************************************************/

// Clean
gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
		.pipe(clean());																				// clean dir
});

// Build
gulp.task('build', ['clean'], function () {
	gulp.start('images');																		// images task
	gulp.start('fonts');																		// fonts task
	gulp.start('libs');																			// libs task
	gulp.start('extrass');
	var assets = useref.assets();
		return gulp.src('app/*.html')
			.pipe(assets)
			.pipe(gulpif('*.js', uglify()))
			.pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
			.pipe(assets.restore())
			.pipe(useref())
			.pipe(gulp.dest('./dist'));
});

/*******************************************************************************\
		12.	DEFAULT TASKS
\*******************************************************************************/

gulp.task('default', ['connect', 'watch']);

/*******************************************************************************\
		13.	DEBUGING FUNCTION
\*******************************************************************************/

var log = function(error) {
	console.log([
		'',
		"-----------ERROR MESSAGE START----------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"-----------ERROR MESSAGE END----------",
		''
	].join('\n'));
	this.end();
}