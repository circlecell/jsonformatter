const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssNested = require('postcss-nested');
const cssmin = require('gulp-cssmin');

const srcFiles = [
	'src/content.js',
	'src/manifest.json',
	'src/fonts/**/*',
	'src/icons/**/*',
];

function copyAll() {
	return gulp
		.src(srcFiles, { base: './src/' })
		.pipe(gulp.dest('dist'));
}

function processCSS() {
	const plugins = [autoprefixer(), postcssNested()];

	return gulp
		.src('src/styles.css')
		.pipe(postcss(plugins))
		.pipe(cssmin())
		.pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.series(copyAll, processCSS));
gulp.task('watch', function () {
	gulp.watch(srcFiles, copyAll);
	gulp.watch('src/styles.css', processCSS);
});