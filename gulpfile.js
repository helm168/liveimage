const gulp = require('gulp');
const gulpBabel = require('gulp-babel');

const buildFolder = './build';

function compileJs(watch) {
  let srcGlob = ['components/*', 'models/*', './renderer.js'];
  function doCompile(glob) {
    let stream = gulp.src(glob)
      .pipe(gulpBabel({
        presets: [["env", {
          "targets": {
            "node": "current"
          }}], "stage-0", "react"]
      }))
      .on('error', e => {
        console.log(e);
      })
      .pipe(gulp.dest(buildFolder))
  }
  doCompile(srcGlob);
  if (watch) {
    gulp.watch(srcGlob, (evt) => {
      doCompile(evt.path);
    });
  }
}

gulp.task('watchJs', function() {
  return compileJs(true);
});

gulp.task('build', function() {
  compileJs();
});


gulp.task('default', ['watchJs']);
