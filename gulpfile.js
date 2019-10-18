const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const path = require('path');
const webpack = require('webpack-stream');

let isDev = process.argv.includes('--dev');
let isProd = !isDev;
let isSync = process.argv.includes('--sync');


let config = {
	src: './app/',
	build: './dist',
	html: {
		src: '/*.pug',
		watch: '**/*.pug',
		dest: '/'
	},
	img: {
		src: 'img/**/*',
		dest: '/img'
	},
	fonts: {
		src: 'fonts/**/*',
		dest: '/fonts'
	},
	css: {
		src: 'sass/main.sass',
		watch: 'sass/**/*.sass',
		dest: '/css'
	},
	resources: {
		src: '/resources/**/*',
		dest: '/resources'
	},
	js: {
		watch: 'js/**/*.js',
		dest: '/js'
	}
};


let webConfig = {
	output: {
		filename: 'app.min.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? 'eval-source-map' : 'none'
};

function html() {
	return gulp.src(config.src + config.html.src)
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(config.build + config.html.dest))
		.pipe(gulpIf(isSync, browserSync.stream()));
}

function fonts() {
	return gulp.src(config.src + config.fonts.src)
		.pipe(gulp.dest(config.build + config.fonts.dest))
}

function resources() {
	return gulp.src(config.src + config.resources.src)
		.pipe(gulp.dest(config.build + config.resources.dest))
}

function img() {
	return gulp.src(config.src + config.img.src)
		.pipe(gulpIf(isProd, imagemin([
			imageminPngquant({
				quality: [0.7, 0.9]
			})
		])))
		.pipe(gulp.dest(config.build + config.img.dest));
}

function css() {
	return gulp.src(config.src + config.css.src)
		.pipe(sass())
		.pipe(gulpIf(isDev, sourcemaps.init()))
		.pipe(gcmq())
		.pipe(concat('app.min.css'))
		.pipe(autoprefixer({
			browsers: ['last 3 versions']
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(gulpIf(isDev, sourcemaps.write()))
		.pipe(gulp.dest(config.build + config.css.dest))
		.pipe(gulpIf(isSync, browserSync.stream()));
}

function scripts() {
	return gulp.src('./app/js/main.js')
		.pipe(webpack(webConfig))
		.pipe(gulp.dest(config.build + config.js.dest))
		.pipe(gulpIf(isSync, browserSync.stream()));
}

function clear() {
	return del(config.build + '/*');
}

function watch() {
	if (isSync) {
		browserSync.init({
			server: {
				baseDir: config.build
			},
			// tunnel: true
		});
	}

	gulp.watch(config.src + config.html.watch, html);
	gulp.watch(config.src + config.css.watch, css);
	gulp.watch(config.src + config.js.watch, scripts);
}


let build = gulp.series(clear, gulp.parallel(html, img, css, scripts, fonts, resources));

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));
