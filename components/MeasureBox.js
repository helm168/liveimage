import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export const UNIT_TYPE = {
  MM: 'MM',
  CSS: 'CSS',
};

export default class MeasureBox extends Component {
  static propTypes = {
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    lnUnit: PropTypes.string,
  };
  static defaultProps = {
    lnUnit: UNIT_TYPE.MM,
  };
  static contextTypes = {
    mm2dPixRatio: PropTypes.number,
    dPix2cssRatio: PropTypes.number,
  };
  getRenderProps() {
    let {
      width,
      height,
      lnUnit,
    } = this.props;
    let {
      mm2dPixRatio,
      dPix2cssRatio,
    } = this.context;
    let mm2cssRatio = mm2dPixRatio * dPix2cssRatio;
    if (lnUnit == UNIT_TYPE.CSS) {
      return {
        cssWidth: width,
        cssHeight: height,
        mmWidth: (width * mm2cssRatio).toFixed(0),
        mmHeight: (height * mm2cssRatio).toFixed(0),
      };
    }
    return {
      cssWidth: (width / mm2cssRatio).toFixed(0),
      cssHeight: (height / mm2cssRatio).toFixed(0),
      mmWidth: width,
      mmHeight: height,
    }
  }
  getStyle(renderProps) {
    return Object.assign({}, this.props, {
      position: 'absolute',
      width: renderProps.cssWidth,
      height: renderProps.cssHeight,
    });
  }
  renderRect(renderProps) {
    let style = {
      width: renderProps.cssWidth,
      height: renderProps.cssHeight,
      border: '1px dashed #fff',
    }
    return <div style={style}></div>
  }
  renderMeasure(renderProps) {
    let {
      top,
      left,
    } = this.props;
    let {
      cssWidth,
      mmWidth,
      mmHeight,
    } = renderProps
    let style = {
      position: 'absolute',
      left: cssWidth + 5,
      top: -20,
      color: '#fff',
      background: '#68af02',
      padding: '3px 5px',
    };
    let text = `w:${mmWidth} h:${mmHeight}`;
    return <p style={style}>{text}</p>
  }
  render() {
    let renderProps = this.getRenderProps();
    return (
      <div style={ this.getStyle(renderProps) }
        ref={(el) => { this.el = el; }}>
        {this.renderRect(renderProps)}
        {this.renderMeasure(renderProps)}
      </div>
    )
  }
}
