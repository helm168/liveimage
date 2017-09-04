'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Tick extends _react.Component {
  getStyle() {
    let {
      right,
      height = '100%'
    } = this.props;
    return {
      position: 'absolute',
      width: 1,
      top: 30,
      right,
      height,
      backgroundColor: 'red'
    };
  }
  renderTickValue() {
    let style = {
      display: 'inline-block',
      color: 'red',
      transform: 'translate(50%, -20px)',
      fontSize: 12
    };
    return _react2.default.createElement(
      'span',
      { style: style },
      this.props.value
    );
  }
  render() {
    return _react2.default.createElement(
      'div',
      { style: this.getStyle(),
        ref: el => {
          this.el = el;
        } },
      this.renderTickValue()
    );
  }
}
exports.default = Tick;
Tick.propTypes = {
  value: _propTypes2.default.number,
  right: _propTypes2.default.number,
  height: _propTypes2.default.number
};