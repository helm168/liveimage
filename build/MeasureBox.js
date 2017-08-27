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
        mmWidth: (width * mm2cssRatio).toFixed(0),
        mmHeight: (height * mm2cssRatio).toFixed(0)
      };
    }
    return {
      cssWidth: (width / mm2cssRatio).toFixed(0),
      cssHeight: (height / mm2cssRatio).toFixed(0),
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
      left: cssWidth + 5,
      top: -20,
      color: '#fff',
      background: '#68af02',
      padding: '3px 5px'
    };
    let text = `w:${mmWidth} h:${mmHeight}`;
    return _react2.default.createElement(
      'p',
      { style: style },
      text
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