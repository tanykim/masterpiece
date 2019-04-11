import React, { Component } from 'react';
import Visualization from './Visualization';
import {
  allSortOptions,
  optionsWithColor,
  allTimelines,
  getOrderedDirectors
} from './processor';
import './Main.css';

class Main extends Component {

  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
    this.state = {
      isSortOpen: false,
      sortBy: 1,
      axis: 'age',
      wrapper: null,
    };
  }

  toggleSortOption() {
    this.setState(currentState => {
      return {isSortOpen: !currentState.isSortOpen};
    });
  }

  selectSortOption(sortBy) {
    this.setState({sortBy, isSortOpen: false});
  }

  selectAxis(axis) {
    this.setState({axis});
  }

  componentDidMount() {
    const wrapper = this.wrapperRef.current.clientWidth;
    this.setState({wrapper: Math.max(wrapper * 0.9, 920)});

  }

  render() {
    const {isSortOpen, sortBy, axis, wrapper} = this.state;
    const directors = getOrderedDirectors(sortBy);

    return (<div className="Main" ref={this.wrapperRef} >
      <div className="options-wrapper">
    		<div className="options">
    			<div className="option-title">Sort by</div>
    			<div className="sort">
    				<div
              className={`sort-selected link ${isSortOpen ? 'closed' : 'open'}`}
              onClick={() => this.toggleSortOption()}
              >
              {allSortOptions[sortBy].label}
            </div>
    				{isSortOpen && <ul className="list">
              {allSortOptions.map((option, i) => {
                const value = `${option.by}:${option.dir}`;
                const className = 'list-' +
                  (optionsWithColor.indexOf(option.by) > -1 ? option.by : 'normal') +
                  (option.dir === 'asc' && i > 0 ? ' divide' : '') +
                  (i === sortBy ? ' selected' : '');
                return <li
                  key={i}
                  className={className}
                  value={value}
                  onClick={() => this.selectSortOption(i)}
                  >
                    {option.label}
                  </li>;
              })}
    				</ul>}
    			</div>
    		</div>
    		<div className="options">
    			<div className="option-title">Timeline</div>
          {allTimelines.map(timeline => <span key={timeline.value} className="timeline">
            <input
              className="timeline-radio"
              type="radio"
              name="axis"
              value={timeline.value}
              checked={axis === timeline.value}
              onChange={(e) => this.selectAxis(e.target.value)}
            /> {timeline.label}
          </span>)}
    		</div>
    	</div>
      {wrapper != null && <Visualization
        sortBy={sortBy}
        axis={axis}
        wrapper={wrapper}
        directors={directors}
      />}
    </div>);
  }
}

export default Main;
