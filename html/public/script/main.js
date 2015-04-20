require.config({
    shim: {
        'elements': {
            exports: 'E'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        d3: '../bower_components/d3/d3',
        moment: '../bower_components/moment/moment',
        textures: '../bower_components/textures/textures',
        elements: 'elements'
    }
});
require([
    'jquery',
    'underscore',
    'd3',
    'moment',
    'vis',
    'interaction',
    'textures',
    'elements'
], function ($, _, d3, moment, Vis, I, textures, E) {

    'use strict';

    //scroll
    function changeHeader() {
        var p = $(window).scrollTop();
        console.log(p);
        if (p > 150) {
            $('.js-vis-axis').addClass('fixed');
            $('.js-header-title').fadeIn('fast');
        } else if (p > 50) {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeIn('fast');
        } else {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeOut('fast');
        }
    }
    var scrolled = _.debounce(changeHeader, 100);
    $(window).scroll(scrolled);

    //retreive data
    $.getJSON('dataset.json').done(function (d) {
        console.log(d);
        var data = d.reverse(); //from newest
        var vis = Vis.drawSVG(E, data);
        Vis.drawVis(E, data, vis.x.age, vis.y);
        I.callInteraction(vis, data);
        I.callDirectorOpen(data);
    });

});