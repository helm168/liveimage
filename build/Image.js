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

var _WebglImage = require('./WebglImage');

var _WebglImage2 = _interopRequireDefault(_WebglImage);

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
    let src = this.props.src;
    if (!src) {
      return null;
    } else if (typeof src === 'string') {
      return _react2.default.createElement(_HTMLImage2.default, this.props);
    } else if (this.props.webgl) {
      return _react2.default.createElement(_WebglImage2.default, this.props);
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
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  src: _propTypes2.default.any
};