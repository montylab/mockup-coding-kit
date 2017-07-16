const config = require('./config.js');

const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const connect = require('gulp-connect');
const autoprefixer = require('gulp-autoprefixer');
const replace = require('gulp-replace');

gulp.task('sass', function (done) {
	gulp.src(config.path.scss)
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(config.path.buildCSS))
		.pipe(minifyCss({
			keepSpecialComments: 0
		}))
		.pipe(rename({extname: '.min.css'}))
		.pipe(gulp.dest(config.path.buildCSS))
		.pipe(connect.reload())
		.on('end', done);
});


const templateRX = /\{\{%([a-zA-Z0-9\/.-_]+)%\}\}/gim;
gulp.task('html', function (done) {
	gulp.src(config.path.html)
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(replace(templateRX, (match, tempName) => {
			let contents = match;
			try	{
				contents = fs.readFileSync('./html/templates/'+tempName+'.html').toString();
			} catch (e) {
				console.error(`can't find template: ${tempName}, at file ${undefined}`);
			}

			return contents;
		}))
		.pipe(gulp.dest(config.path.buildHTML))
		.pipe(connect.reload())
		.on('end', done);
});


gulp.task('reload', function () {
	gulp.src('./*.html')
		.pipe(connect.reload());
});

gulp.task('watch', function () {
	gulp.watch(config.path.scss, ['sass']);
	gulp.watch(config.path.html, ['html']);
	gulp.watch([
		'./*.html',
		'./*.css',
		'./*.js'
	], ['reload']);
});


gulp.task('connect', function() {
	connect.server({
		root: 'build',
		livereload: true
	});
});

gulp.task('default', ['html', 'sass', 'connect', 'watch']);