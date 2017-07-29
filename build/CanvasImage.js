'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function linearMap(extent1, extent2, x) {
  return Math.floor((extent2[1] - extent2[0]) / (extent1[1] - extent1[0]) * x);
}

const styles = {
  canvas: {
    width: '100%',
    height: '100%'
  }
};

class CanvasImage extends _react.Component {

  renderByPix1() {
    let src = this.props.src;
    let ctx = this.canvasEl.getContext('2d');
    let imgRealWidth = src.shape[0];
    let imgRealHeight = src.shape[1];
    let newCanvas = document.createElement('canvas');
    newCanvas.width = imgRealWidth;
    newCanvas.height = imgRealHeight;
    let newImageData = newCanvas.getContext('2d').getImageData(0, 0, imgRealWidth, imgRealHeight);
    for (let i = 0; i < newImageData.data.length; i += 4) {
      newImageData.data[i] = src.data[i];
      newImageData.data[i + 1] = src.data[i + 1];
      newImageData.data[i + 2] = src.data[i + 2];
      newImageData.data[i + 3] = src.data[i + 3];
    }
    newCanvas.getContext("2d").putImageData(newImageData, 0, 0);
    ctx.drawImage(newCanvas, 0, 0, this.props.width, this.props.height);
  }

  renderByPix2() {
    let {
      width,
      height,
      src
    } = this.props;
    let ctx = this.canvasEl.getContext('2d');
    let imageData = ctx.getImageData(0, 0, width, height);
    let imgRealWidth = src.shape[0];
    let imgRealHeight = src.shape[1];
    let widthExtent1 = [0, width];
    let widthExtent2 = [0, imgRealWidth];
    let heightExtent1 = [0, height];
    let heightExtent2 = [0, imgRealHeight];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        let idx = (row * width + col) * 4;
        let destRow = linearMap(heightExtent1, heightExtent2, row);
        let destCol = linearMap(widthExtent1, widthExtent2, col);
        let destIdx = (destRow * imgRealWidth + destCol) * 4;
        imageData.data[idx] = src.data[destIdx];
        imageData.data[idx + 1] = src.data[destIdx + 1];
        imageData.data[idx + 2] = src.data[destIdx + 2];
        imageData.data[idx + 3] = src.data[destIdx + 3];
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  renderByPix3() {
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
    if (!this._imageData) {
      this._imageData = dumpCtx.getImageData(0, 0, width, height);;
    }
    if (src) {
      this._imageData.data.set(src.imageBuffer, 0);
    }
    dumpCtx.putImageData(this._imageData, 0, 0);
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
    // 2. renderByPix1 3.729ms
    // 3. renderByPix2 0.215ms
    // console.time("drawspend");
    if (this.props.src instanceof Buffer) {
      this.renderByBuffer();
    } else {
      this.renderByPix3();
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
    if (nextProps.src.imageBuffer.length !== this._imageBufLn) {
      this._imageBufLn = nextProps.src.imageBuffer.length;
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    this.renderImg();
  }

  componentDidMount() {
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