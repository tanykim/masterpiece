define(['moment'], function (moment) {

	'use strict';

	var status = 'closed';
	var prevId, prevYPos, contentH;
	var sortOption = 'year_asc';

	function rePosition(c, index, x1, x2, hasText) {
		d3.select('.js-' + c + '-' + index).transition()
			.attr('x1', x1)
			.attr('x2', x2);
		if (hasText) {
			d3.select('.js-' + c + '-text-' + index).transition()
				.attr('x', x2 + hasText);
		}
	}

	function changeAxis(x, xAxis, option, data) {

		//change axis
		d3.selectAll('.x.axis').call(xAxis);

		_.each(data, function (datum) {

			var index = datum.id;

			//birth, death
			var birth = 0;
			if (option === 'year') {
				if (+datum.bio.birthday.substring(0, 4) < 1910) {
					birth = moment('1910', 'YYYY');
				} else {
					birth = moment(datum.bio.birthday, 'YYYY-MM-DD');
				}
			}
			var death;
			if (option === 'year' && datum.bio.deathday === '') {
				death = moment();
			} else if (option === 'year' && datum.bio.deathday !== '') {
				death = moment(datum.bio.deathday, 'YYYY-MM-DD')
			} else if (option === 'age' && datum.bio.deathday === '') {
				death = moment().diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			} else {
				death = moment(datum.bio.deathday, 'YYYY-MM-DD')
					.diff(moment(datum.bio.birthday, 'YYYY-MM-DD'), 'years', true);
			}

			//career
			var firstDirecting = option === 'year'
				? moment(datum.movies[0].release_date, 'YYYY-MM-DD')
				: datum.movies[0].age;
			var firstOscars = option === 'year'
				? moment(datum.awards[0].date, 'MMMM D, YYYY')
				: datum.awards[0].age;

			rePosition('birth', index, x(birth), x(birth), 6);
			rePosition('death', index, x(death), x(death), -6);
			d3.select('.js-death-h-' + index)
				.attr('x1', x(death) - 5)
				.attr('x2', x(death) + 5);
			rePosition('death-v', index, x(death), x(death));
			rePosition('career', index, x(firstDirecting), x(firstOscars), 16);
			rePosition('age', index, x(birth), x(firstOscars), 16);
		});

		//movies & years of awards
		d3.selectAll('.js-movies').transition()
			.attr('cx', function (d) {
				return option === 'year'
					? x(moment(d.release_date, 'YYYY-MM-DD'))
					: x(d.age);
				});
		d3.selectAll('.js-years').transition()
			.attr('x1', function (d) {
				return option === 'year'
					? x(moment(d.date, 'MMMM D, YYYY'))
					: x(d.age);
				})
			.attr('x2', function (d) {
				return option === 'year'
					? x(moment(d.date, 'MMMM D, YYYY'))
					: x(d.age);
				})
		d3.selectAll('.js-years-text').transition()
			.attr('x', function (d) {
				return option === 'year'
					? x(moment(d.date, 'MMMM D, YYYY')) + 4
					: x(d.age) + 4;
				})
			.attr('transform', function (d) {
				return option === 'year'
					? 'rotate(-45, ' + (x(moment(d.date, 'MMMM D, YYYY')) + 8)+ ', 14)'
				    : 'rotate(-45, ' + (x(d.age) + 8)+ ', 14)';
				})
	}

	function updateSvgHeight(dir) {
		var currentH = $('#vis').find('svg').outerHeight();
		console.log('----', currentH, contentH);
		$('#vis').find('svg').attr('height', +currentH + contentH * dir);
	}

	function showVisElements(option) {

		//show elements depending on the selected option
		if (option !== 'firstname' && option !== 'count_asc' && option !== 'count_desc') {

			//cut option by _, e.g., year_asc --> year
			var o = option.split('_')[0];
			d3.selectAll('.' + o).transition().style('opacity', 1);
			d3.selectAll('.' + o + '-text').transition().style('opacity', 1);
		}
	}

	var callInteraction = function (vis, data) {

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

			//reset director open
			if (status === 'open') {
				$('.js-director-more').addClass('hide');
				updateDirectorVis(prevId, 0);
				slideDirectors(-1, prevYPos);
				$('.js-axis-open-' + prevId).attr('d', E.chevron().open);
				status = 'closed';
			}
			prevYPos = undefined;
			prevId = undefined;

			if ($(this).hasClass('clicked')) {
				$('.js-sort-selected').removeClass('clicked');
				$('.js-sort-list').addClass('invisible');
			} else {
				$('.js-sort-selected').addClass('clicked');
				$('.js-sort-list').removeClass('invisible');
			}

			$('.js-sort-list').find('li').click(function() {

				//hide all vis elements
				d3.selectAll('.js-elm').style('opacity', 0);

				//update the selection text
				$('.js-sort-selected').html($(this).text());
				$('.js-sort-selected').removeClass('clicked');
			    $('.js-sort-list').addClass('invisible');
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
			        		showVisElements(option);
			        	}
			        });
			    sortOption = option;
			});
		});
	}

	function getYPos(g) {
		var yPos;
		if (!g.attr('transform')) {
			yPos = 0;
		} else {
			var posStr = g.attr('transform').split(',')[1];
			yPos = +posStr.substring(0, posStr.length-1);
		}
		return yPos;
	}

	function updateDirectorVis(id, o) {

		if (o === 1) { //show all elements when open
			d3.selectAll('.js-elm-' + id).transition().style('opacity', o);
		} else { //hide elements that are not for the selected option
			var allElements = ['birth', 'death', 'death-h', 'death-v', 'career', 'age', 'year'];
			_.each(_.difference(allElements, [sortOption.split('_')[0]]), function (d) {
				d3.selectAll('.js-' + d + '-' + id).transition().style('opacity', 0);
				d3.selectAll('.js-' + d + '-text-' + id).transition().style('opacity', 0);
			});
		}
	}

	function putDirectorInfo(d) {

		var highlights = function (sort) {
			return _.filter(d.movies, function (m) {
				return m.oscars === sort;
			});
		};

		$('.js-d-name').html(d.name);
		$('.js-d-age').html(Math.floor(d.age)).css('color', E.color.age);
		$('.js-d-year').html(d.years[0]);
		$('.js-d-debut').html(d.movies[0].title + ' (' + d.movies[0].release_date.substring(0, 4) + ')');
		$('.js-d-career').html(Math.round((d.age - d.movies[0].age) * 10) / 10).css('color', E.color.career);;

		$('.js-d-won').html('');
		_.each(highlights('won'), function (m) {
			$('.js-d-won').append('<li>' + m.title + ' (' + m.year + ')</li>');
		});
		var nominated = highlights('nominated');
		if (!_.isEmpty(nominated)) {
			$('.js-d-nominated-wrapper').removeClass('hide');
			$('.js-d-nominated').html('');
			_.each(nominated, function (m) {
				$('.js-d-nominated').append('<li>' + m.title + ' (' + m.year + ')</li>');
			});
		} else {
			$('.js-d-nominated-wrapper').addClass('hide');
		}

		$('.js-d-number').html(d.movies.length).css('color', E.color.movie);;
		$('.js-d-imdb').attr('href', 'http://www.imdb.com/name/' + d.bio.imdb_id);

		contentH = $('.js-director-more').outerHeight();
	}

	function slideDirectors(dir, yPos) {

		updateSvgHeight(dir);

		_.each($('#vis').find('.director'), function (g) {
			var yTrans = getYPos($(g));
			if (yTrans > yPos) {
				d3.select(g).attr('transform', 'translate(0 ,' + (yTrans + contentH * dir) + ')');
			};
		});
	}

	var callDirectorOpen = function (data) {

		function showDirector(yPos, d) {
			$('.js-axis-open-' + d.id).attr('d', E.chevron().close);
			updateDirectorVis(d.id, 1); //show all elements
			putDirectorInfo(d); //html info in the expanded panel
			slideDirectors(1, yPos); //slide down directors below
			$('.js-director-more').removeClass('hide').css('top', yPos + E.unitH + E.margin.top);
			prevId = d.id;
			prevYPos = yPos;
			status = 'open';
		}

		$('.js-axis-text').click(function () {
			if (status == 'closed') {
				showDirector(getYPos($(this).parent()), this.__data__);
			} else {
				updateDirectorVis(prevId, 0); //hide all elements
				slideDirectors(-1, prevYPos); //slide up directors below
				var id = this.__data__.id;
				if (id === prevId) { //close the opened one
					$('.js-director-more').addClass('hide')
					$('.js-axis-open-' + prevId).attr('d', E.chevron().open);
					status = 'closed';
				} else {
					$('.js-axis-open-' + prevId).attr('d', E.chevron().open);
					showDirector(getYPos($(this).parent()), this.__data__);
				}
			}
		});
	}

	return {
		callInteraction: callInteraction,
		callDirectorOpen: callDirectorOpen
	};
});