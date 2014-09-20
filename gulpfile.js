'use strict';

var gulp = require('gulp'),
    glob = require('glob'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    sequence = require('run-sequence'),
    streamqueue = require('streamqueue'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var config = require('./config.js'),
    pkg = require('./package.json'),
    live = $.util.env.live;

if (!live) {
    live = false
};

var AUTOPREFIXER_BROWSERS = [
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var templateopts = {
    name: pkg.name,
    author: pkg.author
};

var htmlopts = {
    empty: true,
    quotes: true,
    conditionals: true,
    spare: true
};

gulp.task('clean', del.bind(null, [config.paths.dist]));

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function() {
    sequence([
            'html',
            'scripts',
            'fonts',
            'images',
            'files'
        ],
        'inject',
        'styles',
        'serve'
    );
});

gulp.task('serve', function() {
    browserSync({
        notify: true,
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: config.paths.dist
        }
    });

    gulp.watch([config.paths.app + '/**/*.html'], ['inject'], reload);
    gulp.watch([config.paths.app + '/scss/**/*.scss'], ['styles']);
    gulp.watch([config.paths.app + '/js/**/*.js'], ['scripts', reload]);
    gulp.watch([config.paths.app + '/images/**/*'], reload);

});

gulp.task('html', function() {

    gulp.src([
        config.paths.app + '/**/*.html',
        '!' + config.paths.app + '/index.*'
    ])
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('inject', function() {

    if (live) {

        gulp.src(config.paths.app + '/index.*')
            .pipe($.multinject(['scripts.js'], 'scripts', {
                urlPrefix: ''
            }))
            .pipe($.template(templateopts))
            .pipe($.minifyHtml(htmlopts))
            .pipe(gulp.dest(config.paths.dist))

    } else {

        gulp.src(config.paths.app + '/index.*')
        // .pipe($.changed(config.paths.dist))
        .pipe($.multinject(['libs.js'], 'jslibs', {
            urlPrefix: ''
        }))
            .pipe($.multinject(['app.js'], 'jsapp', {
                urlPrefix: ''
            }))
            .pipe($.template(templateopts))
            .pipe(gulp.dest(config.paths.dist))
            .pipe(reload({ stream: true }));
    }

});

gulp.task('scripts', function() {

    if (live) {

        return streamqueue({
                objectMode: true
            },
            gulp.src(config.files.jslibs),
            gulp.src(config.files.jsapp)
        )
            .pipe($.concat('scripts.js'))
            .pipe($.uglify())
            .pipe($.
                if (live, $.size({
                    showFiles: true
                })))
            .pipe(gulp.dest(config.paths.dist));


    } else {

        gulp.src(config.files.jslibs)
            .pipe($.concat('libs.js'))
            .pipe($.changed(config.paths.dist))
            .pipe($.uglify())
            .pipe(gulp.dest(config.paths.dist));

        gulp.src(config.files.jsapp)
            .pipe($.changed(config.paths.dist))
            .pipe(gulp.dest(config.paths.dist));
    }
});

gulp.task('styles', function() {

    return streamqueue({
            objectMode: true
        },
        gulp.src(config.files.css),
        gulp.src(config.files.scss)
        .pipe($.changed('css', {
            extension: '.scss'
        }))
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        })))
        .pipe($.size({
            showFiles: true
        }))
        .pipe($.concat('style.css'))
        .pipe($.
            if (live, $.uncss({
                html: glob.sync(config.paths.app + '/**/*.html'),
                ignore: [
                    /:hover/,
                    /:active/,
                    /.active/,
                    /:visited/,
                    /:focus/,
                    /:checked/,
                    /.open/
                ]
            })))
        .pipe($.
            if (live, $.size({
                title: 'Uncssed: '
            })))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe($.
            if (live, $.size({
                title: 'Autoprefixed: '
            })))
        .pipe($.
            if (live, $.csso({
                keepSpecialComments: 0
            })))
        .pipe($.
            if (live, $.size({
                title: 'Compressed: ',
            })))
        .pipe(gulp.dest(config.paths.dist + '/css'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('jshint', function() {
    return gulp.src(config.paths.app + '/js/**/*.js')
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.
            if (!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('images', function() {
    return gulp.src(config.paths.app + '/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(config.paths.dist + '/images'))
        .pipe($.size({
            title: 'images',
            showFiles: true
        }));
});

gulp.task('fonts', function() {
    return gulp.src(config.files.fonts)
        .pipe(gulp.dest(config.paths.dist + '/fonts'))
        .pipe($.size({
            title: 'fonts'
        }));
});

gulp.task('files', function() {
    gulp.src(config.files.other)
        .pipe(gulp.dest(config.paths.dist));
});