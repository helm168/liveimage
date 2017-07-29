'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HTMLImage extends _react.Component {

  render() {
    const {
      src,
      width = 'auto',
      height = 'auto'
    } = this.props;

    let style = {
      maxWidth: width,
      maxHeight: height
    };

    // console.time("drawspend");
    // 0.017ms 图片大多重复，可能缓存导致的?
    let img = _react2.default.createElement('img', { src: src, style: style });
    // console.timeEnd("drawspend");

    return img;
  }
}
exports.default = HTMLImage;
HTMLImage.propTypes = {
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  src: _propTypes2.default.string.isRequired
};