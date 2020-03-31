'use strict';

var fs = require('fs')
var path = require('path')
var gulp = require('gulp')
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var chalk = require('chalk');
var fancyLog = require('fancy-log');

var styleDir = '../public/themes';
var styleDir2 = '../public/css';

// 解析less
const doLess = gulp.series(
    () => gulp.src(styleDir + '/**/*.less')
        .pipe(less())
        .pipe(cleanCSS({compatibility: 'ie8', processImportFrom: ['!icon/iconfont.css', '!inhope-icon/style.css']}))
        .pipe(gulp.dest(styleDir))
        .pipe(gulp.dest(styleDir)),

    () => gulp.src(styleDir2 + '/**/*.less')
        .pipe(less())
        .pipe(cleanCSS({compatibility: 'ie8', processImportFrom: ['!icon/iconfont.css', '!inhope-icon/style.css']}))
        .pipe(gulp.dest(styleDir2))
        .pipe(gulp.dest(styleDir2)),

    (cb) => { fancyLog.info(chalk.green('less ok')); cb(); }
);

const devWatch = function(cb) {
    gulp.watch(styleDir + '/**/*.less', doLess);
    gulp.watch(styleDir2 + '/**/*.less', doLess);
    cb();
}

exports.build = gulp.series(doLess, devWatch)
