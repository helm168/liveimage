'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MeasureBox extends _react.Component {
  getStyle() {
    return _extends({
      position: 'absolute'
    }, this.props);
  }
  renderRect() {
    let style = {
      width: this.props.width,
      height: this.props.height,
      border: '1px dashed #fff'
    };
    return _react2.default.createElement('div', { style: style });
  }
  renderMeasure() {
    let {
      width,
      height,
      top,
      left
    } = this.props;
    let style = {
      position: 'absolute',
      left: width + 5,
      top: -20,
      color: '#fff',
      background: '#68af02',
      padding: '3px 5px'
    };
    let text = `w:${width} h:${height}`;
    return _react2.default.createElement(
      'p',
      { style: style },
      text
    );
  }
  render() {
    return _react2.default.createElement(
      'div',
      { style: this.getStyle(),
        ref: el => {
          this.el = el;
        } },
      this.renderRect(),
      this.renderMeasure()
    );
  }
}
exports.default = MeasureBox;
MeasureBox.propTypes = {
  left: _propTypes2.default.number,
  right: _propTypes2.default.number,
  top: _propTypes2.default.number.isRequired,
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired
};