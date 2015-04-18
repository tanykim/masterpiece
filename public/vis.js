function drawSVG(data) {

	var unitH = 60;

	var margin = { top: 20, right: 20, bottom: 30, left: 200 };
	var dim = {
		w: $('.vis').width() - margin.left - margin.right,
		h: _.size(data) * unitH - margin.top - margin.bottom
	};

	var svg = d3.select('#vis').append('svg')
		.attr('width', dim.w + margin.left + margin.right)
		.attr('height', dim.h + margin.top + margin.bottom)
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
	var y = d3.scale.ordinal().rangeBands([0, dim.h]).domain(_.pluck(data, 'name'));

	var xAxis = {
		age: d3.svg.axis().scale(x.age).orient('top'),
		year: d3.svg.axis().scale(x.year).orient('top')
	}

	// function wrap(text, width) {
	// 	text.each(function() {
	// 		var text = d3.select(this),
	// 		    words = text.text().split('---').reverse(),
	// 		    word,
	// 		    line = [],
	// 		    lineNumber = 0,
	// 		    lineHeight = 1.1, // ems
	// 		    y = text.attr("y"),
	// 		    dy = parseFloat(text.attr("dy")),
	// 		    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	// 		while (word = words.pop()) {
	// 		  	line.push(word);
	// 		  	tspan.text(line.join(" "));
	// 		  	if (tspan.node().getComputedTextLength() > width) {
	// 			    line.pop();
	// 			    tspan.text(line.join(" "));
	// 			    line = [word];
	// 			    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	// 		  	}
	// 		}
	// 	});
	// }

	var yAxis = d3.svg.axis().scale(y).orient('left')
		// .tickSize(-dim.w)
		.tickPadding(9)
		.tickFormat(function (d, i) {
		// return d + ' (' + (+data[i].years[0]-1928) + ', ' + data[i].years + ', ' + Math.floor(data[i].age) + ')';
		return d;
		// return d + '---(' + data[i].years + ')';

	});

	svg.append('g')
		.attr('class', 'x axis')
		.call(xAxis.age);
	svgAxis.append('g')
		.attr('class', 'x axis')
		.call(xAxis.age);
	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

	// $('.y.axis').find('line').attr('y1', unitH/2).attr('y2', unitH/2);

	return {
		unitH: unitH,
		svg: svg,
		w: dim.w,
		x: x,
		y: y,
		xAxis: xAxis,
		yAxis: yAxis
	};
}

function drawVis(vis, data) {

	var unitH = vis.unitH;

	var svg = vis.svg;
	var x = vis.x.age;
	var y = vis.y;

	var movieR = 10;
	var ageW = 6;
	var careerW = 10;
	var cy = unitH - ageW - careerW - movieR - 2;

	//g of each director
	svg.selectAll('.director')
			.data(data)
		.enter().append('g')
			.attr('class', function (d, i) { return 'director director-' + d.id; })
			.attr('transform', function (d) { return 'translate(0, ' + y(d.name) + ')'; })

	_.each(data, function (datum) {

		var index = datum.id;
		var director = d3.select('.director-' + index);

		//bg
		director.append('line')
			.attr('x1', 0)
			.attr('x2', vis.w)
			.attr('y1', unitH)
			.attr('y2', unitH)
			.attr('class', 'axis-line');

		//birth & death
		director.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', unitH)
			.style('opacity', 0)
			.attr('class', 'birth js-elm js-birth-' + index);
		var currentAge = datum.bio.deathday ?
			moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true) :
			moment().diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
		director.append('line')
			.attr('x1', function (d) { return x(currentAge); })
			.attr('x2', function (d) { return x(currentAge); })
			.attr('y1', 0)
			.attr('y2', unitH)
			.style('opacity', 0)
			.attr('class', 'current js-elm js-current-' + index)
		if (datum.bio.deathday) {
			var dead = moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			director.append('circle')
				.attr('cx', function (d) { return x(dead); })
				.attr('cy', cy)
				.attr('r', 4)
				.style('opacity', 0)
				.attr('class', 'death js-elm js-death-' + index)
		}

		//career
		var firstDrirecting = datum.movies[0].age;
		var firstOscars = datum.age;
		//need last oscars age;

		director.append('line')
			.attr('x1', function (d) { return x(firstDrirecting); })
			.attr('x2', function (d) { return x(firstDrirecting); })
			.attr('y1', 0)
			.attr('y2', unitH)
			.style('opacity', 0)
			.attr('class', 'first-directing js-elm js-first-directing-' + index)
		director.append('line')
			.attr('x1', function (d) { return x(firstOscars); })
			.attr('x2', function (d) { return x(firstOscars); })
			.attr('y1', 0)
			.attr('y2', unitH)
			.style('opacity', 0)
			.attr('class', 'first-oscars js-elm js-first-oscars-' + index)
		//career span
	 	director.append('line')
			.attr('x1', function (d) { return x(firstDrirecting); })
			.attr('x2', function (d) { return x(firstOscars); })
			.attr('y1', unitH - ageW - careerW/2)
			.attr('y2', unitH - ageW - careerW/2)
			.style('stroke-width', careerW)
			.style('opacity', 0)
			.attr('class', 'career js-elm js-career-' + index)
		//age span
	 	director.append('line')
			.attr('x1', function (d) { return 0; })
			.attr('x2', function (d) { return x(firstOscars); })
			.attr('y1', unitH - ageW/2)
			.attr('y2', unitH - ageW/2)
			.style('stroke-width', ageW)
			.style('opacity', 0)
			.attr('class', 'age js-elm js-age-' + index)

		//all the movies
		director.selectAll('.movie')
				.data(datum.movies)
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', 10)
				.style('opacity', 0.2)
				.attr('class', 'movie js-movies')
				.on('mouseover', function (d) {
					d3.select(this).style('opacity', 1);
					director.append('text')
						.attr('x', d3.mouse(this)[0])
						.attr('y', cy - movieR - 2)
						.text(function () { return d.title + (d.oscars ? ' - ' + d.oscars : ''); })
						.attr('class', 'movie-info js-movie-info');
				})
				.on('mouseout', function (d) {
					d3.select(this).style('opacity', 0.2);
					d3.selectAll('.js-movie-info').remove();
				});

		var highlights = _.map(['nominated', 'won'], function (sort) {
			return _.filter(datum.movies, function (d) {
				return d.oscars === sort;
			});
		});

		//nominated
		director.selectAll('.nominated')
				.data(highlights[0])
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', 4)
				.attr('class', 'nominated js-movies')
		//won
		director.selectAll('.won')
				.data(highlights[1])
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', cy)
				.attr('r', 4)
				.attr('class', 'won js-movies')
	});
}

function callToolTips(data) {

	var imdb;
	var content = function(name) {
		var obj = _.filter(data, function (d) {
			return d.name === name;
		})[0];
		var highlights = function (sort) {
			return _.filter(obj.movies, function (m) {
				return m.oscars === sort;
			});
		};
		imdb = obj.bio.imdb_id;
		return {
			life: obj.bio.birthday + ' - ' + obj.bio.deathday,
			years: obj.years,
			won: highlights('won'),
			nominated: highlights('nominated'),
			age: obj.age,
			career: obj.age - obj.movies[0].age,
			number: obj.movies.length
		};
	};

	$('.y.axis').find('.tick').find('text').tipsy({
		gravity: 'w',
		html: true,
		title: function() {
			var d = content(this.__data__);
			var won = '';
			var nominated = '';
			_.each(d.won, function (w, i) {
				won = won + w.title + ' ('+ d.years[i] + ')<br/>';
			});
			_.each(d.nominated, function (n, i) {
				nominated = nominated + n.title + '<br/>';
			});
			return '<span class="name">' + this.__data__ + '</span> (' + d.life + ')<br/>' +
				'<div class="first"> First Oscars </div>' +
				'<div class="first-time">At the age of <span class="time">' + Math.floor(d.age)  + '</span>, ' +
				'After <span class="time">' + Math.ceil(+d.career) + '</span> years of debut </div>' +
				'<div class="highlighted">Won: <br/>' + won + '</div>' +
				(_.size(d.nominated) > 0 ? ('<div class="highlighted">Nominated: <br/>' + nominated + '</div>') : '') +
				'<div class="directed">directed total ' + d.number + ' movies</div>';
		}
	}).attr('class', 'link')
	.click(function () {
		window.open('http://www.imdb.com/name/' + imdb, '_blank');
	});
}

function changeAxis(x, xAxis, option, data) {

	//change axis
	d3.selectAll('.x.axis').call(xAxis);

	_.each(data, function (datum) {

		var index = datum.id;

		//birth, current, death
		var birth = option === 'year'
			? moment(datum.bio.birthday, 'YYYY-MM-DD')
			: 0;
		var currentAge;
		if (option === 'year' && datum.bio.deathday === '') {
			currentAge = moment();
		} else if (option === 'year' && datum.bio.deathday !== '') {
			currentAge = moment(datum.bio.deathday, 'YYYY-MM-DD')
		} else if (option === 'age' && datum.bio.deathday === '') {
			currentAge = moment().diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
		} else {
			currentAge = moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
		}
		var death = option === 'year'
			? moment(datum.bio.deathday, 'YYYY-MM-DD')
			: moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
		d3.select('.js-birth-' + index)
			.attr('x1', x(birth))
			.attr('x2', x(birth));
		d3.select('.js-current-' + index)
			.attr('x1', x(currentAge))
			.attr('x2', x(currentAge));
		d3.select('.js-death-' + index)
			.attr('cx', x(death))

		//career
		var firstDrirecting = option === 'year'
			? moment(datum.movies[0].release_date, 'YYYY-MM-DD')
			: datum.movies[0].age;
		d3.select('.js-first-directing-' + index)
			.attr('x1', x(firstDrirecting))
			.attr('x2', x(firstDrirecting));
		var firstOscars = option === 'year'
			? moment(datum.years[0], 'YYYY')
			: datum.age;
		d3.select('.js-first-oscars-' + index)
			.attr('x1', x(firstOscars))
			.attr('x2', x(firstOscars));
		d3.select('.js-career-' + index)
			.attr('x1', x(firstDrirecting))
			.attr('x2', x(firstOscars))
		d3.select('.js-age-' + index)
			.attr('x1', x(birth))
			.attr('x2', x(firstOscars))
	});

	d3.selectAll('.js-movies')
		.attr('cx', function (d) { return option === 'year' ? x(moment(d.release_date, 'YYYY-MM-DD')) : x(d.age); });
}

function updateVisElements(option) {
	console.log(option);
	if (option === 'year_asc' || option === 'year_desc') {
		d3.selectAll('.first-oscars').transition().style('opacity', 1);
	} else if (option === 'age_asc' || option === 'age_desc') {
		d3.selectAll('.age').transition().style('opacity', 1);
		d3.selectAll('.birth').transition().style('opacity', 1);
		d3.selectAll('.current').transition().style('opacity', 1);
		d3.selectAll('.death').transition().style('opacity', 1);
	} else if (option === 'career_asc' || option === 'career_desc') {
		d3.selectAll('.career').transition().style('opacity', 1);
		d3.selectAll('.first-directing').transition().style('opacity', 1);
		d3.selectAll('.first-oscars').transition().style('opacity', 1);
	}
}

$(function() {

	var sorting = function (option, a, b) {
		if (option === 'age_desc') {
			return b.age - a.age;
		} else if (option === 'age_asc') {
			return a.age - b.age;
		} else if (option === 'firstname') {
			return d3.ascending(a.name, b.name);
		} else if (option === 'year_asc') {
			return a.years[0] - b.years[0];
		} else if (option === 'year_desc') {
			return b.years[0] - a.years[0];
		} else if (option === 'count_desc') {
			return b.movies.length - a.movies.length;
		} else if (option === 'count_asc') {
			return a.movies.length - b.movies.length;
		} else if (option === 'career_asc') {
			return (a.age-a.movies[0].age) - (b.age-b.movies[0].age);
		} else {
			return (b.age-b.movies[0].age) - (a.age-a.movies[0].age);
		}
	};

	var axisSort = function (option, newY, a, b) {
		if (option === 'age_desc') {
			return newY(a.age) - newY(b.age);
		} else if (option === 'age_asc') {
			return newY(b.age) - newY(a.age);
		} else if (option === 'firstname') {
			return newY(b.name) - newY(a.name);
		} else if (option === 'year_asc') {
			return newY(b.years[0]) - newY(a.years[0]);
		} else if (option === 'year_desc') {
			return newY(a.years[0]) - newY(b.years[0]);
		} else if (option === 'count_desc') {
			return newY(a.movies.length) - newY(b.movies.length);
		} else if (option === 'count_asc') {
			return newY(b.movies.length) - newY(a.movies.length);
		} else if (option === 'career_asc') {
			return newY(b.age-b.movies[0].age) - newY(a.age-a.movies[0].age);
		} else {
			return newY(a.age-a.movies[0].age) - newY(b.age-b.movies[0].age);
		}
	};

	//retreive data

	var data;
	var vis;
	$.getJSON('dataset.json').done(function (d) {
		console.log(d);
		data = d.reverse(); //from newest
		vis = drawSVG(data);
		drawVis(vis, data);
		callToolTips(data);
	});

	$('input[name=axis]').change(function() {
		var option = $(this).data().value;
		changeAxis(vis.x[option], vis.xAxis[option], option, data);
	});

	$('.js-sort-selected').click(function() {

		$(this).removeClass('link');
		$('.js-sort-list').removeClass('invisible');

		$('.js-sort-list').find('li').click(function() {

			d3.selectAll('.js-elm').style('opacity', 0);

			$('.js-sort-selected').html($(this).text());

			var option = $(this).data().value;

			//new axis
			var newY = vis.y.domain(data.sort(function (a, b) { return sorting(option, a, b); })
				.map(function(d) { return d.name }))
				.copy();
			vis.svg.selectAll('.director')
				.sort(function(a, b) { return axisSort(option, newY, a, b); })

			//transition
		    vis.svg.selectAll('.director')
		    	.transition().duration(1000)
		        .attr('transform', function (d) { return 'translate(0, ' + newY(d.name) + ')'; })
		    vis.svg.select('.y.axis')
		    	.transition().duration(1000)
		        .call(vis.yAxis)
		        .each('end', function() {
		        	updateVisElements(option);
		        });

		    $('.js-sort-list').addClass('invisible');
		   	$('.js-sort-selected').addClass('link');
		   	$('.js-sort-list').find('li').removeClass('selected');
		   	$(this).addClass('selected');
		});
	});

});