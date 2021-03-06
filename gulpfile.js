var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		notify         = require("gulp-notify"),
		rsync          = require('gulp-rsync');

// Пользовательские скрипты проекта

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/inputmask/dist/min/inputmask/inputmask.min.js',
		'app/libs/inputmask/dist/min/inputmask/jquery.inputmask.min.js',
		//'app/js/sw.js',
    //'app/js/common.min.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// port: process.env.PORT,
		// host: process.env.IP
	});
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS()) // Опционально, закомментировать при отладке
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	// .pipe(cache(imagemin())) // Cache Images
	.pipe(imagemin())
	.pipe(gulp.dest('public/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/*.php',
		'app/.htaccess',
    'app/manifest.json',
    'app/sw.js'
	]).pipe(gulp.dest('public'));

	var buildCss = gulp.src([
		'app/css/main.min.css',
		]).pipe(gulp.dest('public/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
    'app/js/common.js',
		]).pipe(gulp.dest('public/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('public/fonts'));

});

gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      '92.53.96.125',
		user:      'ct29560',
		password:  'Deface4ever43',
		parallel:  10,
		log: gutil.log
	});
	return gulp.src('dist/**/*.*', { buffer: false })
	//.pipe(conn.newer('/multikey_studio/public_html/'))
	.pipe(conn.dest('/multikey_studio/public_html/'));
});

gulp.task('rsync', function() {
	return gulp.src('public/**')
	.pipe(rsync({
		root: 'public/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Скрытые файлы, которые необходимо включить в деплой
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}));
});

gulp.task('removedist', function() { return del.sync('public'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('location', function() { return setTimeout(function() { gutil.log('Your code is running at http://fullpage-template-webpackmen.c9users.io:8080/.') }, 2000); });
gulp.task('default', ['watch', 'location']);
