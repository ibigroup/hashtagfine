var config = {};

var paths = {
    app: 'app',
    dist: 'dist',
    bower: 'bower_components'
};

var files = {
    jslibs: [
        paths.bower + '/jquery/dist/jquery.js',
        paths.bower + '/d3/d3.js',
        paths.bower + '/bootstrap/dist/js/bootstrap.js',
        paths.bower + '/spinjs/spin.js'
    ],
    jsapp: [
        paths.app + '/js/app.js'
    ],
    css: [
        paths.bower + '/normalize-css/normalize.css',
        paths.bower + '/bootstrap/dist/css/bootstrap.css',
        paths.bower + '/font-awesome/css/font-awesome.css'
    ],
    scss: paths.app + '/scss/*.scss',
    fonts: [
        paths.bower + '/font-awesome/fonts/*',
        paths.app + '/fonts/*'
    ],
    other: [
        paths.bower + '/modernizr/modernizr.js'
    ],
    images: [
        paths.app + '/images/*'
    ]
};

config.paths = paths;
config.files = files;

module.exports = config;