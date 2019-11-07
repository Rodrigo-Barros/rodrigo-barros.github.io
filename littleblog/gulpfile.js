var gulp = require("gulp");
var less = require("gulp-less");
var browserSync = require("browser-sync").create();

gulp.task("less", function() {
  return gulp
    .src("./*.less")
    .pipe(less())
    .pipe(gulp.dest("./css/"));
});

gulp.task("watch", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });

  gulp.watch(["*.less", "*.html", "*.js"], gulp.series("less")).on("change", function() {
    browserSync.reload();
  });

  //gulp.watch("*.html").on("change", reload);
});
