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

    //social link
    $('.js-social').mouseover(function () {
        $(this).addClass('social-over');
    }).click(function () {
        if ($(this).data().value === 't') {
            window.open('https://twitter.com/intent/tweet?text=' +
                'Check this cool visualization of' +
                'Osacars winners in Best Directing!' +
                'by @tanykim http%3A%2F%2Ftany.kim%2Fmasterpiece');
        } else {
            window.open('https://www.facebook.com/sharer/sharer.php?' +
                'u=http%3A%2F%2Ftany.kim%2Fmasterpiece');
        }
    }).mouseout(function () {
        $(this).removeClass('social-over');
    });

    //retreive data
    $.getJSON('dataset.json').done(function (d) {
        $('.js-loading').addClass('hide');
        var data = d.reverse(); //from newest
        var vis = Vis.drawSVG(data);
        Vis.drawVis(data, vis);
        I.callInteraction(data, vis);
        I.callDirectorOpen(data, vis);
    });

});