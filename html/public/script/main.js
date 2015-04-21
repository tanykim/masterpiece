require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        d3: '../bower_components/d3/d3',
        moment: '../bower_components/moment/moment'
    }
});
require([
    'jquery',
    'underscore',
    'd3',
    'moment',
    'vis',
    'interaction'
], function ($, _, d3, moment, Vis, I) {

    'use strict';

    //scroll
    function changeHeader() {
        var p = $(window).scrollTop();
        console.log(p);
        if (p > 150) {
            $('.js-vis-axis').addClass('fixed');
            $('.js-header-title').fadeIn('fast');
            $('.js-footer').fadeIn('fast');
        } else if (p > 50) {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeIn('fast');
            $('.js-footer').fadeIn('fast');
        } else {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeOut('fast');
            $('.js-footer').fadeOut('fast');
            $('.js-source-content').hide();
        }
    }

    var scrolled = _.debounce(changeHeader, 100);
    $(window).scroll(scrolled);

    //footer
    $('.js-source').click(function() {
        $('.js-source-content').toggle();
    });
    $('.js-close').click(function() {
        $('.js-source-content').hide();
    });

    //retreive data
    $.getJSON('dataset.json').done(function (d) {
        console.log(d);
        var data = d.reverse(); //from newest
        var vis = Vis.drawSVG(data);
        Vis.drawVis(data, vis);
        I.callInteraction(data, vis);
        I.callDirectorOpen(data, vis);
    });

});