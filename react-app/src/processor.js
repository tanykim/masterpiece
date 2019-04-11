import data from './data/data.json';
import * as d3 from 'd3';
import moment from 'moment';

const allDirectors = data;

const directorsCount = allDirectors.length;

const allSortOptions = [
  {by: 'year', dir: 'asc', 'label': 'Year of the first Oscars (old to new)'},
  {by: 'year', dir: 'desc', 'label': 'Year of the first Oscars (new to old)'},
  {by: 'age', dir: 'asc', 'label': 'Age at the first Oscars (young to old)'},
  {by: 'age', dir: 'desc', 'label': 'Age at the first Oscars (old to young)'},
  {by: 'career', dir: 'asc', 'label': 'Years from debut (short to long)'},
  {by: 'career', dir: 'desc', 'label': 'Years from debut (long to short)'},
  {by: 'firstname', dir: 'asc', 'label': 'Name (A-Z)'},
  {by: 'firstname', dir: 'desc', 'label': 'Name (Z-A)'},
  {by: 'count', dir: 'asc', 'label': 'Number of directed movies (small to large)'},
  {by: 'count', dir: 'desc', 'label': 'Number of directed movies (large to small)'},
];

const optionsWithColor = ['year', 'age', 'career'];

const allTimelines = [
  {value: 'age', label: 'Age (0-100)'},
  {value: 'year', label: 'Year (1910-2020)'},
];

const getOrderedDirectors = (sortBy) => {
  const {by, dir} = allSortOptions[sortBy];
  const directors = allDirectors.slice(0).sort((a, b) => {
    if (by === 'age') {
      return a.age - b.age;
    } else if (by === 'year') {
      return a.years[dir === 'asc' ? 0 : a.years.length - 1] - b.years[dir === 'asc' ? 0 : b.years.length - 1];
    } else if (by === 'career') {
      return (a.age - a.movies[0].age) - (b.age - b.movies[0].age);
    } else if (by === 'firstname') {
      return a.name.localeCompare(b.name);
    } else {
      return a.movies.length - b.movies.length;
    }
  });
  if (dir === 'desc') {
    directors.reverse();
  }
  return directors;
};

const getSortType = (index) => {
  return allSortOptions[index].by;
};

const getDirectorVisData = (director, axis, x) => {

  // movies
  const movies = director.movies.map(movie => {
    const xPos = x[axis](
      axis === 'age' ?
      movie.age :
      moment(movie.release_date, 'YYYY-MM-DD')
    );
      // "release_date":"1917-03-03","title":"The Tornado","oscars":"","year":"","age":23.0801
    const {title, oscars, year, release_date} = movie;
    const isWon = oscars === 'won';
    const isNominated = oscars === 'nominated';

    return {
      xPos, title, isWon, isNominated,
      oscarYear: year,
      releaseYear: release_date.slice(0).slice(0, 4)
    };
  });

  // additional info
  // awards: highlighted as won or nominated
  const awards = director.awards.map((award, i) => {
    const xPos = x[axis](
      axis === 'age' ?
      award.age :
      moment(award.date, 'MMMM DD, YYYY')
    );
    const year = director.years[i];
    return {xPos, isFirst: i === 0, year};
  });

  // birth
  const birthMoment = moment(director.bio.birthday, 'YYYY-MM-DD');
  const birth = {
    xPos: axis === 'age' ? 0 : x.year(birthMoment),
    text: `Born on ${birthMoment.format('MMM D, YYYY')}, ${director.bio.place_of_birth}`,
  };

  // age to the first oscars
  const age = {
    x1: birth.xPos,
    x2: awards[0].xPos,
    text: `${Math.floor(director.awards[0].age)} years old`,
  };

  // year after debut
  const career = {
    x1: movies[0].xPos,
    x2: awards[0].xPos,
    text: (director.awards[0].age - director.movies[0].age).toFixed(1) + ' years',
  };

  // end age or death status
  const isDead = director.bio.deathday !== '';
  const endMoment = isDead ?
    moment(director.bio.deathday, 'YYYY-MM-DD') :
    moment();
  const endAge = endMoment.diff(birthMoment, 'years');
  const current = {
    xPos: x[axis](axis === 'age' ? endAge : endMoment),
    DiedOn: isDead ?
      `died on ${endMoment.format('MMM D, YYYY')}, ` :
      '',
    age: `${endAge} years old`,
  };

  const {name, years} = director;
  return {
    name, years, isDead,
    imdb: director.bio.imdb,
    movies, awards, age, career, birth, current,
  };
};

const getStarPath = (size) => {
  const c1 = Math.cos(0.2 * Math.PI);
  const c2 = Math.cos(0.4 * Math.PI);
  const s1 = Math.sin(0.2 * Math.PI);
  const s2 = Math.sin(0.4 * Math.PI);
  const r = 1;
  const r1 = 1.5 * r * c2/c1;
  const star = [
    [0,-r], [r1 * s1, -r1 * c1], [r * s2, -r * c2], [r1 * s2, r1 * c2],
    [r * s1, r * c1], [0, r1], [-r * s1, r * c1], [-r1 * s2, r1 * c2],
    [-r * s2, -r * c2], [-r1 * s1, -r1 * c1], [0, -r]
  ];
  const line = d3.line().x(d => d[0] * size).y(d => d[1] * size);
  return line(star) + 'Z';
};

export {
  allDirectors,
  directorsCount,
  allSortOptions,
  optionsWithColor,
  allTimelines,
  getOrderedDirectors,
  getSortType,
  getDirectorVisData,
  getStarPath,
};
