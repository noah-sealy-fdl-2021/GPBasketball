var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');

gulp.task('sass', function(){
    // array because there are multiple scss files
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
        // convert sass to css
        .pipe(sass())
        // put the new css into a css folder in src
        .pipe(gulp.dest('src/css'))
        // notify browser to reload
        .pipe(browserSync.stream());
});

// move js files into src/js
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.stream());
});

// serve the sass
gulp.task('serve', ['sass'], function() {

    // make a little server
    browserSync.init({
        server: './src'
    });

    // watches for changes! and reload the browser then
    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'], ['sass']);
    gulp.watch('src/*.html').on('change', browserSync.reload);

})

gulp.task('default', ['js', 'serve']);