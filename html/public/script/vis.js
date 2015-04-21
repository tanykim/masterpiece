define(['moment'], function (moment) {

	'use strict';

	var drawSVG = function(data) {

		var unitH = 52;
		var margin = { top: 50, right: 40, bottom: 100, left: 220};
		var dim = {
			w: $('.vis').width() - margin.left - margin.right,
			h: _.size(data) * unitH
		};

		$('.js-director-more').css('width', dim.w).css('left', margin.left);

		var svg = d3.select('#vis').append('svg')
			.attr('width', dim.w + margin.left + margin.right)
			.attr('height', dim.h + margin.bottom + margin.top)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

		var svgAxis = d3.select('#vis-axis').append('svg')
			.attr('width', dim.w + margin.left + margin.right)
			.attr('height', margin.top + 1)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

		var x = {
			age: d3.scale.linear().range([0, dim.w]).domain([0, 100]),
			year: d3.time.scale().range([0, dim.w]).domain([moment('1910', 'YYYY'), moment('2020', 'YYYY')])
		};
		var y = d3.scale.ordinal().rangeBands([0, dim.h]).domain(_.pluck(data, 'id'));

		var xAxis = {
			age: d3.svg.axis().scale(x.age).orient('top'),
			year: d3.svg.axis().scale(x.year).orient('top')
		}

		svgAxis.append('g')
			.attr('class', 'x axis')
			.call(xAxis.age);
		svgAxis.append('line')
			.attr('x1', 0)
			.attr('x2', dim.w)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('class', 'x-axis');

	    return {
	    	unitH: unitH,
	    	margin: margin,
	    	dim: dim,
	    	x: x,
	    	y: y,
	    	xAxis: xAxis,
	    	svg: svg
	    };
	};

	function drawMovies(data, director, x, cy) {

		function drawStar(k) {
			var c1 = Math.cos(0.2 * Math.PI);
			var c2 = Math.cos(0.4 * Math.PI);
		    var s1 = Math.sin(0.2 * Math.PI);
		    var s2 = Math.sin(0.4 * Math.PI);
		    var r = 1;
		    var hr = r / 1.5;
		    var r1 = 1.5 * r * c2/c1;
			var star = [[0,-r], [r1*s1,-r1*c1], [r*s2,-r*c2], [r1*s2,r1*c2],
					[r*s1,r*c1], [0,r1], [-r*s1,r*c1], [-r1*s2,r1*c2],
					[-r*s2,-r*c2],[-r1*s1,-r1*c1],[0,-r]];
			var line = d3.svg.line()
					.x(function (d) {return d[0] * k;})
   					.y(function (d) {return d[1] * k;});
   			return line(star) + 'Z';
		}


		director.selectAll('.movie')
				.data(data)
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', 8)
				.style('opacity', 0.2)
				.attr('class', 'movie js-movies')
				.on('mouseover', function (d) {
					d3.select(this).style('opacity', 1);
					director.append('text')
						.attr('x', d3.mouse(this)[0])
						.attr('y', cy - 8 * 2)
						.text(d.title + (d.oscars ? ' - ' + d.oscars : ''))
						.attr('class', 'movie-info js-movie-info');
				})
				.on('mouseout', function (d) {
					d3.select(this).style('opacity', 0.2);
					d3.selectAll('.js-movie-info').remove();
				});
		var special = _.map(['nominated', 'won'], function (sort) {
		 	return _.filter(data, function (d) {
				return d.oscars === sort;
			});
		});
		director.selectAll('.nominated')
				.data(special[0])
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', 4)
				.attr('class', 'nominated js-movies');
		director.selectAll('.won')
				.data(special[1])
			.enter().append('path')
				.attr('d', drawStar(6))
				.attr('transform', function (d) {
					return 'translate(' + x(d.age) + ', ' + cy + ')';
				})
				// .attr('class', function (d, i) {
				// 	return 'won' + (i == 0 ? '-first' : '') + ' js-wons';
				// });
				.attr('class', 'won js-wons');
	}

	function drawLine(director, x1, x2, y1, y2, c, id) {
		director.append('line')
			.attr('x1', x1)
			.attr('x2', x2)
			.attr('y1', y1)
			.attr('y2', y2)
			.style('opacity', 0)
			.attr('class', c + ' js-' + c + ' js-' + c + '-' + id + ' js-elm js-elm-' + id);
	}

	function drawText(director, x, y, t, c, id, anchor) {
	 	director.append('text')
			.attr('x', x)
			.attr('y', y)
			.text(t)
			.style('opacity', 0)
			.style('text-anchor', anchor)
			.attr('class', c + ' js-' + c + ' js-' + c + '-' + id + ' js-elm js-elm-' + id);
	}

	function drawVis(data, vis) {

		var unitH = vis.unitH;
		var svg = vis.svg;
		var dim = vis.dim;
		var x = vis.x.age;
		var y = vis.y;
		var more = 30;
		var barW = 6;

		//g of each director
		svg.selectAll('.director')
				.data(data)
			.enter().append('g')
				.attr('class', function (d) { return 'director director-' + d.id; })
				.attr('transform', function (d, i) { return 'translate(0, ' + unitH * i + ')'; })

		_.each(data, function (datum) {

			var id = datum.id;
			var director = d3.select('.director-' + id);

			//bg and director name
			director.append('line')
				.attr('x1', 0)
				.attr('x2', dim.w)
				.attr('y1', unitH)
				.attr('y2', unitH)
				.attr('class', 'y-axis');
			director.append('text')
				.attr('x', -20)
				.attr('y', unitH/2 + 4)
				.text(datum.name)
				.attr('class', 'link y-axis-text js-axis-text');
			director.append('path')
				.attr('d', 'M -4 ' + (unitH/2 - 2) + ' h -10 l 5 6 z')
				.attr('class', 'chevron link js-axis-text js-axis-open-' + id);

			//movies
			drawMovies(datum.movies, director, x, unitH/2);

			//birth and death
			drawLine(director, 0, 0, 0, unitH + more, 'birth', id);
			drawText(director, 6, unitH + more * 0.7,
				'Born on ' + moment(datum.bio.birthday, 'YYYY-MM-DD').format('MMM D, YYYY') +
				(datum.bio.place_of_birth
				? ', ' + datum.bio.place_of_birth
				: ''),
				'birth-text', id);
			var death = datum.bio.deathday
				? moment(datum.bio.deathday, 'YYYY-MM-DD')
					.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true)
				: moment().diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			drawLine(director, x(death), x(death), 0, unitH + more,
				'death', id);
			drawText(director,
				x(death) - 6, unitH + more * 0.7,
				(datum.bio.deathday
				? 'Died on ' + moment(datum.bio.deathday, 'YYYY-MM-DD').format('MMM D, YYYY') +
				', age ' + Math.floor(death)
				: Math.floor(death) + ' year old'),
				'death-text', id, 'end');
			if (datum.bio.deathday) {
				drawLine(director, x(death) - 5, x(death) + 5, unitH - 5, unitH - 5, 'death-h', id);
				drawLine(director, x(death), x(death), unitH - 10, unitH, 'death-v', id);
			}

			//age
			var firstOscars = datum.awards[0].age;
			var ageY = barW + barW / 2;
			drawLine(director, 0, x(firstOscars), ageY, ageY, 'age', id);
			drawText(director, x(firstOscars) + 16, ageY + 5,
				Math.floor(datum.age) + ' years old' , 'age-text', id);

			//career
			var firstDirecting = datum.movies[0].age;
			var firstOscars = datum.awards[0].age;
			var careerY = unitH - barW - barW/2;
			drawLine(director,
				x(firstDirecting), x(firstOscars), careerY, careerY,
				'career', id);
			drawText(director,
				x(firstOscars) + 16, careerY + 3,
				Math.round((firstOscars-firstDirecting) * 10)/10 + ' years',
				'career-text', id);

			//awards dates
			director.selectAll('.year')
					.data(datum.awards)
				.enter().append('line')
					.attr('x1', function (d) { return x(d.age); })
					.attr('x2', function (d) { return x(d.age); })
					.attr('y1', 0)
					.attr('y2', unitH)
					.attr('class', function (d, i) {
						return 'year'  + (i > 0 ? '-others' : '-first')
							+ ' js-year js-elm js-elm-' + id + ' js-year-' + id;
					});
			director.selectAll('.year-text')
					.data(datum.awards)
				.enter().append('text')
					.attr('x', function (d) { return x(d.age) + 4; })
					.attr('y', 14)
					.text(function (d, i) { return datum.years[i]; })
					.attr('transform', function (d) { return 'rotate(-45, ' + (x(d.age) + 8)+ ', 14)'; })
					.attr('class', function (d, i) {
						return 'year-'  + (i > 0 ? 'others' : 'first') + '-text'
							+ ' js-year-text js-elm js-elm-' + id + ' js-year-text-' + id;
					})
		});
	}

	return {
		drawSVG: drawSVG,
		drawVis: drawVis,
	};
});