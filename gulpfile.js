var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
    gulp.src([
      './js/modules/game.js',
      './js/modules/managementPanel.js',
      './js/modules/anthill.js',
      './js/modules/ant.js',
      './js/modules/resource.js',
      './js/main.js',
    ])
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./js/dist/'));
});