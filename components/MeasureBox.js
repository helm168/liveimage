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
      display: 'flex',
      flexDirection: 'column',
      left: cssWidth + 5,
      top: 0,
      margin: 0,
      color: '#fff',
      background: 'rgb(34, 34, 34)',
      color: 'rgb(223, 223, 223)',
      padding: '10px 5px',
      fontSize: 12,
    };
    let lineStyle = {
      whiteSpace: 'nowrap',
      lineHeight: 1.5,
    };
    mmWidth = Number(mmWidth);
    mmHeight = Number(mmHeight);
    let mmLength = Math.sqrt(mmWidth * mmWidth + mmHeight * mmHeight).toFixed(1);
    let angle = (Math.atan(mmHeight / mmWidth) / Math.PI * 180).toFixed(0);
    mmWidth = mmWidth.toFixed(1);
    mmHeight = mmHeight.toFixed(1);
    return (
      <p style={style}>
        <span style={lineStyle}>水平距离:{mmWidth}mm</span>
        <span style={lineStyle}>垂直距离:{mmHeight}mm</span>
        <span style={lineStyle}>长度:{mmLength}mm</span>
        <span style={lineStyle}>角度:{angle}</span>
      </p>
    );
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
