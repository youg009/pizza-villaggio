'use strict';
// Requis
var gulp = require('gulp');
// Include plugins
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var del = require('del');
var docType = '{doc,docx,pdf,txt,xls,xml,zip}';
var src = 'src/';
var dist = 'dist/';

// init browser-sync
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: dist
        }
    })
});


// compile sass files into css
gulp.task('css', function() {
    return gulp.src(src + 'sass/**/*.scss')
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(dist + 'css/'))
});


// reload and copy js
gulp.task('js', function() {
    return gulp.src(src + 'js/**/*')
        .pipe(gulp.dest(dist + 'js/'))
});

// Minify css and add suffixe .min
gulp.task('minify-css', function() {
    return gulp.src(dist + 'css/*.css')
        .pipe(plugins.csso())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist + 'css/'));
});

// Remove .map
gulp.task('remove-map', function(callback) {
    return del(dist + 'css/*.map', callback);
});

// Minify js
gulp.task('minify-js', function() {
    return gulp.src(dist + 'js/scripts.js')
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist + 'js/'));
});

// change the url of custom js and css in all html files
gulp.task('templates-to-prod', function(){
  gulp.src(dist + '**/*.html')
    .pipe(plugins.replace('scripts.js', 'scripts.min.js'))
    .pipe(plugins.replace('styles.css', 'styles.min.css'))
    .pipe(gulp.dest(dist));
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('vendor', function() {
    gulp.src('node_modules/bootstrap/dist/js/*.min.js')
        .pipe(gulp.dest(dist + 'vendor/bootstrap'))

    gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/jquery/dist/jquery.min.js'
        ])
        .pipe(gulp.dest(dist + 'vendor/jquery'))

    gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest(dist + 'vendor/font-awesome'))
})

// Copy images
gulp.task('images', function() {
    return gulp.src(src + 'images/**/*')
        .pipe(gulp.dest(dist + 'images/'));
});

// Copy fonts
gulp.task('fonts', function() {
    return gulp.src(src + 'fonts/**/*')
        .pipe(gulp.dest(dist + 'fonts/'));
});

// Copy assets
gulp.task('assets', function() {
    return gulp.src(src + '**/*.' + docType)
        .pipe(gulp.dest(dist));
});

// Clean dist folders
gulp.task('clean', function() {
    return del(dist).then(paths => {
        console.log('Delete dist folder');
    });
});

// Transform twig tpls into html
gulp.task('twig', function () {
    return gulp.src([src + '**/*.twig', '!' + src + '/tpls/**/*.twig'])
        .pipe(plugins.twig(
        {
          errorLogToConsole: true
        }))
        .pipe(plugins.removeEmptyLines())
        .pipe(gulp.dest(dist));
});


// Task "Watch"
// cmd : gulp watch
gulp.task('watch', ['browserSync', 'build'], function() {
    gulp.watch(src + 'sass/**/*.scss', ['css', browserSync.reload]);
    gulp.watch(src + 'images/**/*', ['images', browserSync.reload]);
    gulp.watch(src + 'fonts/**/*', ['fonts', browserSync.reload]);
    gulp.watch(src + '**/*.' + docType, ['assets', browserSync.reload]);
    gulp.watch(src + '**/*.twig', ['twig', browserSync.reload]);
    gulp.watch(src + 'js/**/*', ['js', browserSync.reload]);
});

// Task "build"
// cmd : gulp build
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        ['css', 'js', 'images', 'fonts', 'assets', 'vendor', 'twig'],
        callback);
});


// Task "prod" = Build + minify
// cmd : gulp prod
gulp.task('prod', function(callback) {
    runSequence(
        'build',
        ['remove-map', 'minify-js', 'minify-css', 'templates-to-prod'],
        callback);
});

// Task default
// cmd : gulp
gulp.task('default', ['watch']);