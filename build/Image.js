'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _HTMLImage = require('./HTMLImage');

var _HTMLImage2 = _interopRequireDefault(_HTMLImage);

var _CanvasImage = require('./CanvasImage');

var _CanvasImage2 = _interopRequireDefault(_CanvasImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

class Image extends _react.Component {

  renderImg() {
    if (typeof src === 'string') {
      return _react2.default.createElement(_HTMLImage2.default, this.props);
    }
    return _react2.default.createElement(_CanvasImage2.default, this.props);
  }

  render() {
    let style = Object.assign({}, styles.wrapper, this.props.style);
    return _react2.default.createElement(
      'div',
      { style: style },
      this.renderImg()
    );
  }
}
exports.default = Image;
Image.propTypes = {
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  src: _propTypes2.default.any.isRequired
};