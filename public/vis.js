function drawSVG(data) {

	var unitH = 50;

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
	var yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(function (d, i) {
		return d + ' (' + (+data[i].years[0]-1928) + ', ' + data[i].years + ', ' + Math.floor(data[i].age) + ')';
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


	return {
		unitH: unitH,
		svg: svg,
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

	//g of each director
	svg.selectAll('.director')
			.data(data)
		.enter().append('g')
			.attr('class', function (d, i) { return 'director director-' + d.id; })
			.attr('transform', function (d) { return 'translate(0, ' + y(d.name) + ')'; })

	_.each(data, function (datum) {

		var index = datum.id;
		var director = d3.select('.director-' + index);

		//birth
		director.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', unitH)
			.attr('class', 'birth js-birth-' + index);

		//first directing
		var firstDrirecting = datum.movies[0].age;
		director.append('line')
			.attr('x1', function (d) { return x(firstDrirecting); })
			.attr('x2', function (d) { return x(firstDrirecting); })
			.attr('y1', 0)
			.attr('y2', unitH)
			.attr('class', 'first-directing js-first-directing-' + index)

		//first oscars
		director.append('line')
			.attr('x1', function (d) { return x(datum.age); })
			.attr('x2', function (d) { return x(datum.age); })
			.attr('y1', 0)
			.attr('y2', unitH)
			.attr('class', 'first-oscars js-first-oscars-' + index)

		//death
		if (datum.bio.deathday) {
			var dead = moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			director.append('line')
				.attr('x1', function (d) { return x(dead); })
				.attr('x2', function (d) { return x(dead); })
				.attr('y1', 0)
				.attr('y2', unitH)
				.attr('class', 'death js-death-' + index)
		}

		//age at being awarded for the first time
	 	director.append('line')
			.attr('x1', function (d) { return x(firstDrirecting); })
			.attr('x2', function (d) { return x(datum.age); })
			.attr('y1', unitH/2)
			.attr('y2', unitH/2)
			.attr('class', 'age js-age-' + index)

		//all the movies
		director.selectAll('.movie')
				.data(datum.movies)
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', unitH/2)
				.attr('r', 10)
				.attr('class', 'movie js-movies')
				.on('mouseover', function (d) {
					director.append('text')
						.attr('x', d3.mouse(this)[0])
						.attr('y', unitH/2)
						.text(function () { return d.title + (d.oscars ? ' - ' + d.oscars : ''); })
						.attr('class', 'movie-info js-movie-info');
				})
				.on('mouseout', function (d) {
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
				.attr('cy', unitH/2)
				.attr('r', 4)
				.attr('class', 'nominated js-movies')
		//won
		director.selectAll('.won')
				.data(highlights[1])
			.enter().append('circle')
				.attr('cx', function (d) { return x(d.age); })
				.attr('cy', unitH/2)
				.attr('r', 4)
				.attr('class', 'won js-movies')
	});
}

function changeAxis(x, xAxis, option, data) {

	//change axis
	d3.selectAll('.x.axis').call(xAxis);

	_.each(data, function (datum) {

		var index = datum.id;

		var birth = option === 'year'
			? moment(datum.bio.birthday, 'YYYY-MM-DD')
			: 0;

		d3.select('.js-birth-' + index)
			.attr('x1', x(birth))
			.attr('x2', x(birth));

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

		var dead = option === 'year'
			? moment(datum.bio.deathday, 'YYYY-MM-DD')
			: moment(datum.bio.deathday, 'YYYY-MM-DD')
				.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);

		d3.select('.js-death-' + index)
			.attr('x1', x(dead))
			.attr('x2', x(dead));

		d3.select('.js-age-' + index)
			.attr('x1', x(firstDrirecting))
			.attr('x2', x(firstOscars))
	});

	d3.selectAll('.js-movies')
		.attr('cx', function (d) { return option === 'year' ? x(moment(d.release_date, 'YYYY-MM-DD')) : x(d.age); });
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
			return b.years[b.years.length-1] - a.years[a.years.length-1];
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
			return newY(a.years[a.years.length-1]) - newY(b.years[b.years.length-1]);
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
	$.getJSON('dataset.json').done(function (data) {
		console.log(data);
		var vis = drawSVG(data);
		drawVis(vis, data);

		$('input[name=axis]').change(function() {
			var option = $(this).data().value;
			changeAxis(vis.x[option], vis.xAxis[option], option, data);
		});

		$('.js-sort-selected').click(function() {

			$(this).removeClass('link');
			$('.js-sort-list').removeClass('invisible');

			$('.js-sort-list').find('li').click(function() {

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
			        .call(vis.yAxis);

			    $('.js-sort-list').addClass('invisible');
			   	$('.js-sort-selected').addClass('link');
			   	$('.js-sort-list').find('li').removeClass('selected');
			   	$(this).addClass('selected');


			});
		});
	});
});