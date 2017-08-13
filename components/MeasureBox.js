import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class MeasureBox extends Component {
  static propTypes = {
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  getStyle() {
    return {
      position: 'absolute',
      ...this.props,
    };
  }
  renderRect() {
    let style = {
      width: this.props.width,
      height: this.props.height,
      border: '1px dashed #fff',
    }
    return <div style={style}></div>
  }
  renderMeasure() {
    let {
      width,
      height,
      top,
      left,
    } = this.props;
    let style = {
      position: 'absolute',
      left: width + 5,
      top: -20,
      color: '#fff',
      background: '#68af02',
      padding: '3px 5px',
    };
    let text = `w:${width} h:${height}`;
    return <p style={style}>{text}</p>
  }
  render() {
    return (
      <div style={ this.getStyle() }
        ref={(el) => { this.el = el; }}>
        {this.renderRect()}
        {this.renderMeasure()}
      </div>
    )
  }
}
