import React, { Component } from 'react';
import * as d3 from 'd3';
import './Axis.css';

class Axis extends Component {

  componentDidMount() {
		d3.select('.js-axis').call(d3.axisTop(this.props.x));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.x !== this.props.x) {
      d3.select('.js-axis')
        .transition()
        .call(d3.axisTop(this.props.x));
    }
  }

  render() {
    const {margin, width} = this.props;
    const height = 40;
    return (<div className="Axis">
      <svg
        width={width + margin.left}
        height={height}
        >
        <g
          transform={`translate(${margin.left}, ${height})`}
          >
          <g className="x axis js-axis"/>
        </g>
      </svg>
    </div>);
  }
}

export default Axis;
