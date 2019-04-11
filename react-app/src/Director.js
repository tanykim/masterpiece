import React, { Component } from 'react';
import Detail from './Detail';
import {getDirectorVisData, getStarPath} from './processor';
import './Director.css';

class Director extends Component {

  state = {
    hoveredMovie: null,
  };

  handleMouseOver(left, movie) {
    this.setState({hoveredMovie: {left, ...movie}});
  }

  handleMouseOut() {
    this.setState({hoveredMovie: null});
  }

  toggleDetail() {
    this.props.selectDirector(this.props.director.id);
  }

  render() {
    const {margin, width, sortType, selected, director, axis, x} = this.props;
    const {id} = director;
    const {name, years, imdb, isDead, movies, awards, age, career, birth, current
      } = getDirectorVisData(director, axis, x);

    const {hoveredMovie} = this.state;
    const isSelected = selected === id;

    // height of each director, hight when it's expanded to show the detail
    const height = 44;
    const wrapperHeight = height + (isSelected ? 40 : 0);

    const Info = (info, yPos, type) => {
      const {x1, x2, text} = info;
      return (<g>
        <line
          className={`horizontal-line ${type}`}
          x1={x1} x2={x2} y1={yPos} y2={yPos} />
        {!isSelected && <text
          className={`sort-info-text ${type}`}
          x={x2 + 8}
          y={yPos + 4}>
          {text}
        </text>}
        {!isSelected && <line className={`win-line ${type}`}
          x1={x2} x2={x2} y1={0} y2={height}/>}
      </g>);
    }

    const AgeLines = () => {
      return (<g>
        <line
          className="detail-line"
          x1={birth.xPos} x2={birth.xPos}
          y1={0} y2={wrapperHeight} />
        <text className="detail-text" x={birth.xPos + 8} y={height - 26}>
          {birth.text}
        </text>
        <line
          className="detail-line"
          x1={current.xPos} x2={current.xPos}
          y1={0} y2={wrapperHeight} />
        <text
          className="detail-text current"
          x={current.xPos - 8} y={wrapperHeight - 8}>
          {current.diedOn}{current.age}
        </text>
        {/* draw cross for dead person */}
        {isDead && <g
          className="dead"
          transform={`translate(${current.xPos}, ${wrapperHeight - 12})`}>
          <line x1={-6} x2={6} y1={0} y2={0} />
          <line x1={0} x2={0} y1={-6} y2={6} />
         </g>}
      </g>);
    };
    return (<div className="Director">
      <div className="director-wrapper">
        <div className="director-label"
          style={{width: margin.left}}
          onClick={() => this.toggleDetail()}>
          <div className="director-text">
            <div>{name}</div>
            <div className="director-text-year">({years.join(', ')})</div>
          </div>
          <div className={`director-button${isSelected ? ' selected' : ''}`}/>
        </div>
        <div className="director-vis">
          <div className="vis-wrapper" style={{height: wrapperHeight}}>
            <svg width={width} height={wrapperHeight}>
              <g transform={`translate(0, ${isSelected ? 20 : 0})`}>
                {movies.map((movie, i) => {
                  const cx = movie.xPos;
                  const cy = height / 2;
                  const props = {cx, cy};
                  return (<g key={i}
                    onMouseOver={() => this.handleMouseOver(cx, movie)}
                    onMouseOut={() => this.handleMouseOut()}
                    >
                      <circle className="movie" {...props} r={8}/>
                      {movie.isNominated && <circle className="nominated" {...props} r={5}/>}
                      {movie.isWon && <path
                        className="won"
                        d={getStarPath(6)}
                        transform={`translate(${cx}, ${cy})`}
                      />}
                    </g>);
                  })}
                {(sortType === 'age' || isSelected) && Info(age, 10, 'age')}
                {(sortType === 'career' || isSelected) && Info(career, height - 10, 'career')}
                {(sortType === 'year' || isSelected) && awards.map((award, i) => {
                  if (isSelected) {
                    return false;
                  }
                  const {xPos, isFirst, year} = award;
                  const lineProps = {x1: xPos, x2: xPos, y1: 0, y2: height};
                  return (<g key={i}>
                    <line className={`win-line year${isFirst ? ' first' : ''}`}
                      {...lineProps}
                    />
                    <text
                      className={`win-text`}
                      x={xPos}
                      y={16}
                      transform={`rotate(-45, ${xPos + 14}, 12)`}
                    >
                      {year}
                    </text>
                  </g>);
                })}
              </g>
              {isSelected && AgeLines()}
            </svg>
          </div>
          {isSelected && <Detail
            name={name}
            imdb={imdb}
            age={age.text}
            career={career.text}
            movies={movies}
          />}
        </div>
      </div>
      {hoveredMovie != null && <div
        className="tooltip"
        style={{
          top: height / 2 - 52,
          left: hoveredMovie.left + margin.left,
          display: 'flex',
        }}>
        <div>
          {hoveredMovie.title} ({hoveredMovie.releaseYear})
          {hoveredMovie.isWon && <span className="tooltip-oscars">won</span>}
          {hoveredMovie.isNominated && <span className="tooltip-oscars">nominated</span>}
        </div>
      </div>}
    </div>);
  }
}

export default Director;
