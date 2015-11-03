var gulp = require('gulp');
var sh = require('shelljs/global');
var deploy = require('gulp-deploy-git');
var clean = require('gulp-clean');
var BUILD_DIR = "dist";
var PROD_REPO = "ssh://webadmin@HouSuggest/~/FormBuilder.git";
var STAGING_REPO = "ssh://webadmin@HouSuggestDev/~/FormBuilder.git";

gulp.task('clean', function() {
    return gulp.src(BUILD_DIR, {read: false}).pipe(clean());
});

gulp.task('deploy', ['clean', 'setup'], function() {
    return gulp.src('./www/**/*').pipe(gulp.dest(BUILD_DIR)).on('end', function() {
        cd(BUILD_DIR);
        exec("git init");
        exec("git add -A");
        exec('git commit -m "TO THE SERVER!"')
    });
});

gulp.task('deploy-dev', ['clean', 'setup', 'deploy'], function() {
    cd(BUILD_DIR);
    exec('git remote add origin ' + STAGING_REPO);
    exec('git push -f origin +master:refs/heads/master');
});

gulp.task('deploy-prod', ['clean', 'setup', 'deploy'], function() {
    cd(BUILD_DIR);
    exec('git remote add origin ' + PROD_REPO);
    exec('git push -f origin +master:refs/heads/master');
});

gulp.task('setup', [], function() {
    exec('bower install')
});