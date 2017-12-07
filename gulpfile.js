var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var src = './src';
var dist = './dist';

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: dist
    },
    browser: 'chrome'
  })
})

gulp.task('html', function(){
    gulp.src([src + '/**/*.html', src + '/**/*.twig'])
        .pipe(cleanhtml())
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
    return gulp.src(src + '/sass/*.scss')
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        /*.pipe(plugins.cssbeautify({indent: '  '})) Si le CSS ne doit pas être minifier*/
        .pipe(plugins.csso())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist + '/css/'));
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('js', function() {
    return gulp.src(src + '/js/*.js')
        .pipe(uglify())
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest(dist + '/js/'));
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('img', function () {
    return gulp.src(src + '/images/**/*.{png,jpg,jpeg,gif,svg}')
        .pipe(imagemin())
        .pipe(gulp.dest(dist + '/images'));
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Tâche "build"
gulp.task('build', ['html','css', 'js']);

// Tâche "watch" = je surveille *less
gulp.task('watch', ['browserSync', 'build'], function () {
    gulp.watch(src + '**/*.html', ['html']);
    gulp.watch(src + '/sass/*/**.scss', ['css']);
    gulp.watch(src + '/sass/*/**.scss', ['css']);
});

// Tâche par défaut
gulp.task('default', ['build']);