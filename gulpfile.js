var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var del = require('del');
var src = './src';
var dist = './dist';

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: dist
    },
    browser: 'chrome'
  })
})

// Optimizing HTML
gulp.task('html', function(){
    gulp.src([src + '/**/*.html', src + '/**/*.twig'])
        .pipe(plugins.cleanhtml())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Optimizing CSS
gulp.task('css', function () {
    return gulp.src(src + '/sass/*.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.csscomb())
        //.pipe(plugins.cssbeautify({indent: '  '})) Si le CSS ne doit pas être minifier
        .pipe(plugins.csso())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Optimizing JS
gulp.task('js', function() {
    return gulp.src(src + '/js/**/*.js')
        .pipe(plugins.uglify())
        //.pipe(plugins.concat('scripts.min.js'))
        .pipe(gulp.dest(dist + '/js/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Optimizing iamges
gulp.task('images', function () {
    return gulp.src(src + '/images/**/*.{png,jpg,jpeg,gif,svg}')
        .pipe(plugins.cache(plugins.imagemin({
            interlaced: true
        })))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Copying fonts
gulp.task('fonts', function() {
  return gulp.src(src + '/fonts/**/*')
    .pipe(gulp.dest(dist + '/fonts'))
});

// Copying assets
gulp.task('assets', function() {
  return gulp.src(src + '/assets/**/*')
    .pipe(gulp.dest(dist + '/assets'))
});

// Copying libraries
gulp.task('vendor', function() {
    gulp.src([
        'node_modules/bootstrap/dist/js/*.min.js',
        ])
        .pipe(gulp.dest(dist + '/vendor/bootstrap'))

    gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/jquery/dist/jquery.min.js'
        ])
        .pipe(gulp.dest(dist + '/vendor/jquery'))

    gulp.src([
            'node_modules/font-awesome/fonts/*',
        ])
        .pipe(gulp.dest(dist + '/vendor/font-awesome'))
})

// Cleaning 
gulp.task('clean', function(callback) {
  del(dist);
  return plugins.cache.clearAll(callback);
});

gulp.task('clean:dist', function(callback){
  del([dist + '/**/*', '!' + dist + '/images', '!' + dist + '/images/**/*'], callback)
});

// Tâche "build"
gulp.task('build',function(callback) {
    runSequence(
        'clean',
        ['vendor','html', 'css', 'js', 'images', 'fonts', 'assets'],
        callback
    );
});

// Watchers
gulp.task('watch', ['build', 'browserSync'], function () {
    gulp.watch(src + '**/*.html', ['html']);
    gulp.watch(src + '/sass/*/**.scss', ['css']);
    gulp.watch(src + '/js/*/**.js', ['js']);
    gulp.watch(src + '/images/**/*', ['images']);
    gulp.watch(src + '/fonts/**/*', ['fonts']);
    gulp.watch(src + '/assets/**/*', ['assets']);
});

// Tâche par défaut
gulp.task('default', ['watch']);