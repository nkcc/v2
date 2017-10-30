let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
    .sass('resources/assets/sass/app.scss', 'public/css')
    .scripts([
        'public/js/json2.js',
        'public/js/jquery-1.9.1.min.js',
        'public/js/jquery-ui-1.10.3.custom.min.js',
        'public/js/underscore-min.js',
        'public/js/backbone-min.js',
        'public/js/jquery.tmpl.js',
        'public/js/ba-debug.min.js',
        'public/js/ba-tinyPubSub.js',
        'public/js/jquery.mousewheel.js',
        'public/js/jquery.ui.ipad.js',
        'public/js/globalize.js',
        'public/js/timeglider/TG_Date.js',
        'public/js/timeglider/TG_Org.js',
        'public/js/timeglider/TG_Timeline.js',
        'public/js/timeglider/TG_TimelineView.js',
        'public/js/timeglider/TG_Mediator.js',
        'public/js/timeglider/timeglider.timeline.widget.js',
        'public/js/timeglider/timeglider.datepicker.js',
        'js/jquery.jscrollpane.min.js'
    ], 'public/js/all.js');