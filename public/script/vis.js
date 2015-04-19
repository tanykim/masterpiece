define(['moment', 'textures'], function (moment, textures) {

	'use strict';

	var unitH, dim, svg;
	var movieR, barW, cy;

	var drawSVG = function(E, data) {

		// console.log(E);
		unitH = E.unitH;
		var margin = E.margin;

		dim = {
			w: $('.vis').width() - margin.left - margin.right,
			h: _.size(data) * unitH - margin.bottom
		};

		svg = d3.select('#vis').append('svg')
			.attr('width', dim.w + margin.left + margin.right)
			.attr('height', dim.h + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ', 0)');

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
	    	x: x,
	    	y: y,
	    	xAxis: xAxis,
	    	svg: svg
	    };
	};

	function drawMovies(data, director, x) {

		director.selectAll('.movie')
				.data(data)
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', movieR)
				.style('fill', E.color.movie)
				.style('opacity', 0.2)
				.attr('class', 'movie js-movies')
				.on('mouseover', function (d) {
					d3.select(this).style('opacity', 1);
					// director.append('text')
					// 	.attr('x', d3.mouse(this)[0] - movieR * 2)
					// 	.attr('y', cy + movieR/2)
					// 	.text(function () { return d.title + (d.oscars ? ' - ' + d.oscars : ''); })
					// 	.attr('class', 'movie-info js-movie-info');
				})
				.on('mouseout', function (d) {
					d3.select(this).style('opacity', 0.2);
					// d3.selectAll('.js-movie-info').remove();
				});

		// $('.movie').tipsy({
		// 	gravity: 'e',
		// 	html: true,
		// 	title: function() {
		// 		var d = this.__data__;
		// 		return d.title + (d.oscars !== "" ? (' -' + d.oscars + ' (' + d.year + ')') : '');
		// 	}
		// });

		_.each(['nominated', 'won'], function (sort) {
			var movies = _.filter(data, function (d) {
				return d.oscars === sort;
			});
			director.selectAll('.' + sort)
					.data(movies)
				.enter().append('circle')
					.attr('cx', function (d) { return x(d.age); })
					.attr('cy', cy)
					.attr('r', 4)
					.style('fill', E.color[sort])
					.attr('class', sort + ' js-movies')
		});
	}

	function drawLine(director, x1, x2, y1, y2, c, index) {
		director.append('line')
			.attr('x1', x1)
			.attr('x2', x2)
			.attr('y1', y1)
			.attr('y2', y2)
			.style('stroke', E.color[c])
			.style('stroke-width', E.stroke[c])
			.style('opacity', 0)
			.attr('class', c + ' js-elm js-' + c + '-' + index);
	}

	function drawText(director, x, y, t, c, index) {
	 	director.append('text')
			.attr('x', x)
			.attr('y', y)
			.text(t)
			.style('fill', E.color[c])
			.style('opacity', 0)
			.attr('class', c + ' js-elm js-' + c + '-' + index);
	}

	function drawVis(E, data, x, y) {

		movieR = E.movieR;
		barW = E.barW;
		cy = E.unitH/2;

		//g of each director
		svg.selectAll('.director')
				.data(data)
			.enter().append('g')
				// .attr('id', function (d, i) { return i; })
				.attr('class', function (d) { return 'director director-' + d.id; })
				.attr('transform', function (d) { return 'translate(0, ' + y(d.id) + ')'; })

		_.each(data, function (datum) {

			var index = datum.id;
			var director = d3.select('.director-' + index);

			//bg and director name
			director.append('line')
				.attr('x1', 0)
				.attr('x2', dim.w)
				.attr('y1', unitH)
				.attr('y2', unitH)
				.attr('class', 'y-axis');
			director.append('text')
				.attr('x', -9)
				.attr('y', unitH/2 + 4)
				.text(datum.name)
				.attr('class', 'y-axis-text link js-axis-text');

			//movies
			drawMovies(datum.movies, director, x);

			//career
			var firstDirecting = datum.movies[0].age;
			var firstOscars = datum.awards[0].age;

			//career
			var careerY = unitH - barW - barW/2;
			// drawLine(director,
			// 	x(firstOscars), x(firstOscars), 0, unitH,
			// 	'first-oscars', index);
			drawLine(director,
				x(firstDirecting), x(firstOscars), careerY, careerY,
				'career', index);

			var tCareer = textures.lines().size(4).strokeWidth(1).background(E.color.career);
			svg.call(tCareer);
			svg.selectAll('.career').style('stroke', tCareer.url());

			drawText(director,
				x(firstOscars) + 6, careerY,
				Math.round((firstOscars-firstDirecting) * 10)/10 + ' years',
				'career-text', index);

			//year
			// drawLine(director,
			// 	x(firstOscars), x(firstOscars), 0, unitH,
			// 	'year', index);
			// drawText(director,
			// 	x(firstOscars) + 4, 16,
			// 	datum.years[0],
			// 	'year-text', index);

			//current or death age
			// var currentAge = datum.bio.deathday ?
			// 	moment(datum.bio.deathday, 'YYYY-MM-DD')
			// 		.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true) :
			// 	moment().diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			// drawLine(director,
			// 	x(currentAge), x(currentAge), 0, unitH,
			// 	'current', index);
			// if (datum.bio.deathday) {
			// 	var dead = moment(datum.bio.deathday, 'YYYY-MM-DD')
			// 		.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			// 	drawLine(director, x(dead) - 5, x(dead) + 5, cy, cy, 'death-h', index);
			// 	drawLine(director, x(dead), x(dead), cy - 5, cy + 5, 'death-v', index);
			// }
			// drawLine(director, x(firstOscars), x(firstOscars), 0, unitH, 'curent', index);

			//age span
			var ageY = barW + barW / 2;
			drawLine(director, 0, x(firstOscars), ageY, ageY, 'age', index);
			var tAge = textures.lines().size(4).strokeWidth(1).background(E.color.age);
			svg.call(tAge);
			svg.selectAll('.age').style('stroke', tAge.url());
			drawText(director, x(firstOscars) + 6, ageY + 10,
				Math.floor(datum.age) + ' years old' , 'age-text', index);

			//awards dates
			director.selectAll('.year')
					.data(datum.awards)
				.enter().append('line')
					.attr('x1', function (d) { return x(d.age); })
					.attr('x2', function (d) { return x(d.age); })
					.attr('y1', 0)
					.attr('y2', unitH)
					// .style('stroke', E.color.year)
					.attr('class', function (d, i) {
						return 'year'  + (i > 0 ? '-others' : '') + ' js-elm js-years';
						// return 'year js-elm js-years';

					});
			director.selectAll('.year-text')
					.data(datum.awards)
				.enter().append('text')
					.attr('x', function (d) { return x(d.age) + 4; })
					.attr('y', 14)
					.text(function (d, i) { return datum.years[i]; })
					// .style('fill', E.color['year-text'])
					.attr('class', function (d, i) {
						return 'year-text'  + (i > 0 ? '-others' : '') + ' js-elm js-years-text';
					})
		});
	}

	return {
		drawSVG: drawSVG,
		drawVis: drawVis,
	};
});