'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const styles = {
  canvas: {
    width: '100%',
    height: '100%'
    // transform: 'scale(2)',
    // transformOrigin: 'right center 0px',
  }
};

class CanvasImage extends _react.Component {

  renderByPix() {
    let {
      width,
      height,
      src
    } = this.props;
    let ctx = this.canvasEl.getContext('2d');
    let deg = Math.PI;
    let dumpCanvas = document.createElement('canvas');
    dumpCanvas.width = width;
    dumpCanvas.height = height;
    let dumpCtx = dumpCanvas.getContext('2d');
    dumpCtx.putImageData(src.imageBuffer, 0, 0);
    ctx.drawImage(dumpCanvas, 0, 0);
  }

  renderByBuffer() {
    let ctx = this.canvasEl.getContext('2d');
    let imgSource = new Blob([this.props.src], { type: "application/octet-binary" });
    createImageBitmap(imgSource).then(bitMap => {
      ctx.drawImage(bitMap, 0, 0, this.props.width, this.props.height);
    });
  }

  renderImg() {
    // 性能
    // 1. renderByBuffer最快 0.138ms
    // console.time("drawspend");
    if (this.props.src instanceof Buffer) {
      this.renderByBuffer();
    } else {
      this.renderByPix();
    }
    // console.timeEnd("drawspend");
  }

  render() {
    return _react2.default.createElement('canvas', { style: styles.canvas,
      ref: el => {
        this.canvasEl = el;
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
    this.renderImg();
  }

  componentDidMount() {
    this._full = this.props.src.full;
    const {
      width,
      height,
      rotate
    } = this.props;
    let ctx = this.canvasEl.getContext('2d');
    if (rotate) {
      this.canvasEl.width = height;
      this.canvasEl.height = width;
      ctx.translate(height, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      this.canvasEl.width = width;
      this.canvasEl.height = height;
    }

    this._imageBufLn = this.props.src.imageBuffer.length;
    this.renderImg();
  }
}
exports.default = CanvasImage;
CanvasImage.propTypes = {
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  src: _propTypes2.default.object.isRequired
};