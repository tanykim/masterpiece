import React, { Component } from 'react';
import {getStarPath} from './processor';
import './Detail.css';

class Detail extends Component {

  render() {
    const {name, imdb, age, career, movies} = this.props;
    const first = movies[0];
    const oscarsWon = movies.filter(m => m.isWon);
    const firstOscar = oscarsWon[0];
    const otherOscars = oscarsWon.slice(0).slice(1, oscarsWon.length);
    const nominated = movies.filter(m => m.isNominated);

    const Star = (<svg width="16" height="16" className="heading-icon">
        <path d={getStarPath(8)} transform="translate(8, 8)" className="star"/>
      </svg>);

    const OscarsList = (id, title, moveList) => {
      return (<div className="award-type">
        <div className={`heading ${id}`}>
          {id === 'other' ?
            Star :
            <div className="heading-icon"><div className="icon-nominated"/></div>
          }
          {title}
        </div>
        <div className="time">
          {moveList
            .map((movie, i) => !(id === 'isWon' && i === 0) && <div key={i}>
              {movie.title} ({movie.oscarYear})
            </div>)}
        </div>
      </div>)
    };

    return (<div className="Detail">
      <div className="name">
        <span>{name}</span>
        <span className="imdb">
          <a href={`https://www.imdb.com/name/${imdb}`} target="_blank" rel="noopener noreferrer">
            imdb
          </a>
        </span>
      </div>
      <div className="first">
        <div className="heading other">{Star}First Oscars</div>
        <div className="time">
          <div><span className="won">{firstOscar.title}</span> ({firstOscar.oscarYear})</div>
          <div>
            when {` `}<span className="age">{age}</span>
          </div>
          <div>
            After <span className="career">{career}</span> of debut,
            {` `}{first.title} in {first.releaseYear}
          </div>
        </div>
      </div>
      <div className="awards">
        {otherOscars.length > 0 && OscarsList('other', 'Other Oscars', otherOscars)}
        {nominated.length > 0 && OscarsList('nominated', 'Nominated', nominated)}
        <div className="total">
           Directed total <span className="count">{movies.length}</span>
          {` `}movie{movies.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>);
  }
}

export default Detail;
