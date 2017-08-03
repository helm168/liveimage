'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _webglRenderPool = require('./webglRenderPool');

var _webglRenderPool2 = _interopRequireDefault(_webglRenderPool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const styles = {
  wrapper: {
    width: '100%',
    height: '100%'
  }
};

class WebglImage extends _react.Component {

  render() {
    return _react2.default.createElement('div', { style: styles.wrapper,
      ref: el => {
        this.wrapperEl = el;
      } });
  }

  shouldComponentUpdate(nextProps) {
    if (!this._full) {
      this._full = this.props.src.full;
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    this._render.render(this.props.src);
  }

  componentDidMount() {
    this._full = this.props.src.full;
    this._render = _webglRenderPool2.default.pop();
    if (!this._render) {
      this._render = new _webglRenderPool.Render({
        image: this.props.src,
        rotate: this.props.rotate
      });
    }
    this.wrapperEl.appendChild(this._render.getCanvasEl());
  }

  componentWillUnmount() {
    _webglRenderPool2.default.push(this._render);
  }
}
exports.default = WebglImage;
WebglImage.propTypes = {
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  src: _propTypes2.default.object.isRequired
};