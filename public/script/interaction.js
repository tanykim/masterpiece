define(['moment'], function (moment) {

	'use strict';

	function changeAxis(x, xAxis, option, data) {

		//change axis
		d3.selectAll('.x.axis').call(xAxis);

		_.each(data, function (datum) {

			var index = datum.id;

			//birth, current, death
			var birth = 0;
			if (option === 'year') {
				if (+datum.bio.birthday.substring(0, 4) < 1910) {
					birth = moment('1910', 'YYYY');
				} else {
					birth = moment(datum.bio.birthday, 'YYYY-MM-DD');
				}
			}
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
			// d3.select('.js-birth-' + index)
			// 	.attr('x1', x(birth))
			// 	.attr('x2', x(birth));
			d3.select('.js-current-' + index)
				.attr('x1', x(currentAge))
				.attr('x2', x(currentAge));
			d3.select('.js-death-h-' + index)
				.attr('x1', x(death) - 5)
				.attr('x2', x(death) + 5);
			d3.select('.js-death-v-' + index)
				.attr('x1', x(death))
				.attr('x2', x(death));

			//career
			var firstDirecting = option === 'year'
				? moment(datum.movies[0].release_date, 'YYYY-MM-DD')
				: datum.movies[0].age;
			d3.select('.js-first-directing-' + index)
				.attr('x1', x(firstDirecting))
				.attr('x2', x(firstDirecting));
			var firstOscars = option === 'year'
				? moment(datum.awards[0].date, 'MMMM D, YYYY')
				: datum.awards[0].age;
			// d3.select('.js-year-' + index)
			// 	.attr('x1', x(firstOscars))
			// 	.attr('x2', x(firstOscars));
			// d3.select('.js-year-text-' + index)
			// 	.attr('x', x(firstOscars) + 4);
			d3.select('.js-career-' + index)
				.attr('x1', x(firstDirecting))
				.attr('x2', x(firstOscars))
			d3.select('.js-career-text-' + index)
				.attr('x', x(firstOscars) + 6)
			d3.select('.js-age-' + index)
				.attr('x1', x(birth))
				.attr('x2', x(firstOscars))
			d3.select('.js-age-text-' + index)
				.attr('x', x(firstOscars) + 6);
		});

		d3.selectAll('.js-movies')
			.attr('cx', function (d) { return option === 'year' ? x(moment(d.release_date, 'YYYY-MM-DD')) : x(d.age); });
		d3.selectAll('.js-years')
			.attr('x1', function (d) { return option === 'year' ? x(moment(d.date, 'MMMM D, YYYY')) : x(d.age); })
			.attr('x2', function (d) { return option === 'year' ? x(moment(d.date, 'MMMM D, YYYY')) : x(d.age); })
		d3.selectAll('.js-years-text')
			.attr('x', function (d) { return option === 'year' ? x(moment(d.date, 'MMMM D, YYYY')) + 4 : x(d.age) + 4; });
	}

	function updateVisElements(option) {
		console.log(option);
		if (option === 'year_asc' || option === 'year_desc') {
			d3.selectAll('.year').transition().style('opacity', 1);
			d3.selectAll('.year-text').transition().style('opacity', 1);
		} else if (option === 'age_asc' || option === 'age_desc') {
			d3.selectAll('.age').transition().style('opacity', 1);
			d3.selectAll('.age-text').transition().style('opacity', 1);
			// d3.selectAll('.birth').transition().style('opacity', 1);
			d3.selectAll('.current').transition().style('opacity', 1);
			d3.selectAll('.death-v').transition().style('opacity', 1);
			d3.selectAll('.death-h').transition().style('opacity', 1);
		} else if (option === 'career_asc' || option === 'career_desc') {
			d3.selectAll('.career').transition().style('opacity', 1);
			d3.selectAll('.career-text').transition().style('opacity', 1);
			d3.selectAll('.first-oscars').transition().style('opacity', 1);
			// d3.selectAll('.first-oscars').transition().style('opacity', 1);
		}
	}

	var callSort = function (vis, data) {

		var dataSort = function (option, a, b) {
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

		var posSort = function (option, newY, a, b) {
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

		$('input[name=axis]').change(function() {
			var option = $(this).data().value;
			changeAxis(vis.x[option], vis.xAxis[option], option, data);
		});

		$('.js-sort-selected').click(function() {

			$(this).removeClass('link');
			$('.js-sort-list').removeClass('invisible');

			$('.js-sort-list').find('li').click(function() {

				//hide all vis elements
				d3.selectAll('.js-elm').style('opacity', 0);

				//update the selection text
				$('.js-sort-selected').html($(this).text());
			    $('.js-sort-list').addClass('invisible');
			   	$('.js-sort-selected').addClass('link');
			   	$('.js-sort-list').find('li').removeClass('selected');
			   	$(this).addClass('selected');

				//new axis
				var option = $(this).data().value;
				var newY = vis.y.domain(data.sort(function (a, b) { return dataSort(option, a, b); })
					.map(function(d) { return d.id }))
					.copy();
				vis.svg.selectAll('.director')
					.sort(function(a, b) { return posSort(option, newY, a, b); })

				//transition
				vis.svg.selectAll('.director')
			    	.transition().duration(1000)
			        .attr('transform', function (d) { return 'translate(0, ' + newY(d.id) + ')'; })
			        .each('end', function(d, i) {
			        	if (i === _.size(data) - 1) {
			        		updateVisElements(option);
			        	}
			        });
			});
		});
	}

	function getYPos(g) {
		var yPos = g.attr('transform').split(',')[1];
		return +yPos.substring(0, yPos.length-1);
	}

	function slideDirectors(dir, yPos) {

		console.log(dir, yPos);

		var currentH = $('#vis').find('svg').attr('height');
		$('#vis').find('svg').attr('height', +currentH + E.more * dir);

		_.each($('#vis').find('.director'), function (g) {
			var yTrans = getYPos($(g));
			if (yTrans > yPos) {
				$(g).attr('transform', 'translate(0 ,' + (yTrans + E.more * dir) + ')');
			};
		});

	}

	var callDirectorOpen = function (data) {

		var status = 'closed';
		var yPos;

		var imdb, id;
		var content = function(id) {
			var obj = _.filter(data, function (d) {
				return d.id === id;
			})[0];
			var highlights = function (sort) {
				return _.filter(obj.movies, function (m) {
					return m.oscars === sort;
				});
			};
			imdb = obj.bio.imdb_id;
			id = obj.id;
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

		$('.js-axis-text')
		// .tipsy({
		// 	gravity: 'w',
		// 	html: true,
		// 	title: function() {
		// 		console.log(this.__data__.id);
		// 		var d = content(this.__data__.id);
		// 		var won = '';
		// 		var nominated = '';
		// 		_.each(d.won, function (w, i) {
		// 			won = won + w.title + ' ('+ d.years[i] + ')<br/>';
		// 		});
		// 		_.each(d.nominated, function (n, i) {
		// 			nominated = nominated + n.title + '<br/>';
		// 		});
		// 		return '<span class="name">' + this.__data__ + '</span> (' + d.life + ')<br/>' +
		// 			'<div class="first"> First Oscars </div>' +
		// 			'<div class="first-time">At the age of <span class="time">' + Math.floor(d.age)  + '</span>, ' +
		// 			'After <span class="time">' + Math.ceil(+d.career) + '</span> years of debut </div>' +
		// 			'<div class="highlighted">Won: <br/>' + won + '</div>' +
		// 			(_.size(d.nominated) > 0 ? ('<div class="highlighted">Nominated: <br/>' + nominated + '</div>') : '') +
		// 			'<div class="directed">directed total ' + d.number + ' movies</div>';
		// 	}
		// })
		// .attr('class', 'link')
		.click(function () {
			console.log(status);
			if (status == 'closed') {
				yPos = getYPos($(this).parent());
				slideDirectors(1, yPos);
				status = 'open';
				$('.js-director-more').removeClass('hide').css('top', yPos + 40);
			} else {
				slideDirectors(-1, yPos);
				status = 'closed';
			}
		});
	}

	return {
		callSort: callSort,
		callDirectorOpen: callDirectorOpen
	};
});