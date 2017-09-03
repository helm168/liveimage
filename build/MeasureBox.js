'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UNIT_TYPE = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UNIT_TYPE = exports.UNIT_TYPE = {
  MM: 'MM',
  CSS: 'CSS'
};

class MeasureBox extends _react.Component {
  getRenderProps() {
    let {
      width,
      height,
      lnUnit
    } = this.props;
    let {
      mm2dPixRatio,
      dPix2cssRatio
    } = this.context;
    let mm2cssRatio = mm2dPixRatio * dPix2cssRatio;
    if (lnUnit == UNIT_TYPE.CSS) {
      return {
        cssWidth: width,
        cssHeight: height,
        mmWidth: Number((width * mm2cssRatio).toFixed(0)),
        mmHeight: Number((height * mm2cssRatio).toFixed(0))
      };
    }
    return {
      cssWidth: Number((width / mm2cssRatio).toFixed(0)),
      cssHeight: Number((height / mm2cssRatio).toFixed(0)),
      mmWidth: width,
      mmHeight: height
    };
  }
  getStyle(renderProps) {
    return Object.assign({}, this.props, {
      position: 'absolute',
      width: renderProps.cssWidth,
      height: renderProps.cssHeight
    });
  }
  renderRect(renderProps) {
    let style = {
      width: renderProps.cssWidth,
      height: renderProps.cssHeight,
      border: '1px dashed #fff'
    };
    return _react2.default.createElement('div', { style: style });
  }
  renderMeasure(renderProps) {
    let {
      top,
      left
    } = this.props;
    let {
      cssWidth,
      mmWidth,
      mmHeight
    } = renderProps;
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
      fontSize: 12
    };
    let lineStyle = {
      whiteSpace: 'nowrap',
      lineHeight: 1.5,
      textAlign: 'left'
    };
    mmWidth = Number(mmWidth);
    mmHeight = Number(mmHeight);
    let mmLength = Math.sqrt(mmWidth * mmWidth + mmHeight * mmHeight).toFixed(1);
    let angle = (Math.atan(mmHeight / mmWidth) / Math.PI * 180).toFixed(0);
    mmWidth = mmWidth.toFixed(1);
    mmHeight = mmHeight.toFixed(1);
    return _react2.default.createElement(
      'p',
      { style: style },
      _react2.default.createElement(
        'span',
        { style: lineStyle },
        '\u6C34\u5E73\u8DDD\u79BB:',
        mmWidth,
        'mm'
      ),
      _react2.default.createElement(
        'span',
        { style: lineStyle },
        '\u5782\u76F4\u8DDD\u79BB:',
        mmHeight,
        'mm'
      ),
      _react2.default.createElement(
        'span',
        { style: lineStyle },
        '\u957F\u5EA6:',
        mmLength,
        'mm'
      ),
      _react2.default.createElement(
        'span',
        { style: lineStyle },
        '\u89D2\u5EA6:',
        angle
      )
    );
  }
  render() {
    let renderProps = this.getRenderProps();
    return _react2.default.createElement(
      'div',
      { style: this.getStyle(renderProps),
        ref: el => {
          this.el = el;
        } },
      this.renderRect(renderProps),
      this.renderMeasure(renderProps)
    );
  }
}
exports.default = MeasureBox;
MeasureBox.propTypes = {
  left: _propTypes2.default.number,
  right: _propTypes2.default.number,
  top: _propTypes2.default.number.isRequired,
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  lnUnit: _propTypes2.default.string
};
MeasureBox.defaultProps = {
  lnUnit: UNIT_TYPE.MM
};
MeasureBox.contextTypes = {
  mm2dPixRatio: _propTypes2.default.number,
  dPix2cssRatio: _propTypes2.default.number
};