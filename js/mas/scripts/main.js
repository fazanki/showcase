/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        tooltipster: {
            deps: ['jquery'],
            exports: 'tooltipster'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: 'vendor/bootstrap',
        tooltipster:'../bower_components/tooltipster/js/jquery.tooltipster.min'
    }
});

require(['views/app', 'tooltipster'], function(AppView){
    window.App = {
        Vent: _.extend({}, Backbone.Events),
    };


   new AppView();

});
