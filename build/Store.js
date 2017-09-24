'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buf2pix = require('./buf2pix');

var _buf2pix2 = _interopRequireDefault(_buf2pix);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let itemId = 0;
/* list使用的数据源。主要有两类：一类是图像数据，一类是测量矩形
 * 图片数据特殊处理： 由于图片一直以流的方式显示，不仅ui需要动态删除，数据也需要删除，不然可能撑爆内存
 */
class Store extends _events2.default {
  constructor(options = {}) {
    super();
    this._maxLn = options.maxLn;
    this._fMaxLn = options.fMaxLn;
    this._minLn = 0;
    this._startIdx = 0;
    this._remainDataLnWhenReset = 0;
    this.setData(options.data);
  }
  getDataAt(idx) {
    return this._data[idx - this._startIdx];
  }
  getLast() {
    return this._data[this._data.length - 1];
  }
  getData() {
    return this._data;
  }
  addImageData(imgs = [], options = {}) {
    const {
      imgWidth,
      imgHeight,
      webgl
    } = options;

    // 先填满store中最后一个未填满的data
    let lastData = this.getLast();

    // webgl: single channel does the work
    let method = webgl ? 'bufCopy' : 'grayBuf2RgbaBuf';

    imgs.forEach((img, idx) => {
      if (!lastData || lastData.src.full) {
        lastData = {
          id: itemId++,
          src: _buf2pix2.default[method](img, null, imgWidth, imgHeight),
          width: imgWidth,
          height: imgHeight,
          webgl
        };
        this.addData([lastData]);
      } else {
        _buf2pix2.default[method](img, lastData.src, imgWidth, imgHeight);
      }
    });
  }
  addData(data = []) {
    this.setData(this._data.concat(data));
  }
  // 图片的矩形测量框
  getMeasureBoxs() {
    return this._measureBoxs;
  }
  setMeasureBoxs(measureBoxs) {
    this._measureBoxs = measureBoxs;
  }
  addMeasureBox(measureBox) {
    this._measureBoxs = this._measureBoxs || [];
    // store中的_measureBoxs 先要确保没有重复.
    if (!this._measureBoxs.find(thisBox => thisBox.id === measureBox.id)) {
      this._measureBoxs.push(measureBox);
    }
  }
  setData(data = []) {
    if (data.length > this._maxLn) {
      let delLn = this._minLn;
      let remainLn = data.length - delLn;
      if (remainLn > this._maxLn) {
        this._data = this._data.splice(this._minLn, this._remainDataLnWhenReset);
        this.emit('reset', delLn);
      } else {
        this._data = data.slice(this._minLn);
        this.emit('dataoverflow', delLn);
      }
    } else {
      this._data = data;
    }
  }
  setRemainDataLnWhenReset(count) {
    this._remainDataLnWhenReset = count;
  }
  getRemainDataLnWhenReset() {
    return this._remainDataLnWhenReset;
  }
  setMin(minLn) {
    this._minLn = minLn;
  }
  getMin() {
    return this._minLn;
  }
  setMax(maxLn) {
    this._maxLn = maxLn;
  }
  size() {
    return this._data.length + this._startIdx;
  }
  isWritable() {
    return this._data.length < this._maxLn;
  }
  start() {
    return this._startIdx;
  }
  clear() {
    this._startIdx = 0;
  }
}
exports.default = Store;