import React, { Component } from 'react';
import * as d3 from 'd3';
import moment from 'moment';
import Axis from './Axis';
import Director from './Director';
import {getSortType} from './processor';
import './Visualization.css';

class Visualization extends Component {

  state = {
    selected: null,
  };

  selectDirector = (selected) => {
    this.setState(currentState => {
      if (selected === currentState.selected) {
        return {selected: null};
      } else {
        return {selected};
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({selected: null});
    }
  }

  render() {
    const {axis, sortBy, wrapper, directors} = this.props;
    const {selected} = this.state;
    const margin = {top: 40, left: 220};
    const width = wrapper - margin.left;
    const x = {
      age: d3.scaleLinear().range([0, width]).domain([0, 100]),
      year: d3.scaleTime().range([0, width]).domain([
        moment('1910', 'YYYY'),
        moment('2020', 'YYYY')
      ]),
    };

    return (<div className="Visualization" style={{width: wrapper}}>
      <Axis
        margin={margin}
        width={width}
        x={x[axis]}
      />
      {directors.map(director =>
        <Director
          key={director.id}
          margin={margin}
          width={width}
          sortType={getSortType(sortBy)}
          selected={selected}
          selectDirector={this.selectDirector}
          director={director}
          axis={axis}
          x={x}
        />)}
      </div>
    );
  }
}

export default Visualization;
