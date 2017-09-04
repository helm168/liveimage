import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class Tick extends Component {
  static propTypes = {
    value: PropTypes.number,
    right: PropTypes.number,
    height: PropTypes.number,
  };
  getStyle() {
    let {
      right,
      height = '100%',
    } = this.props;
    return {
      position: 'absolute',
      width: 1,
      top: 30,
      right,
      height,
      backgroundColor: 'red',
    }
  }
  renderTickValue() {
    let style = {
      display: 'inline-block',
      color: 'red',
      transform: 'translate(50%, -20px)',
      fontSize: 12,
    }
    return <span style={ style }>{this.props.value}</span>
  }
  render() {
    return (
      <div style={ this.getStyle() }
        ref={(el) => { this.el = el; }}>
        {this.renderTickValue()}
      </div>
    )
  }
}
