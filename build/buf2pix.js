"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * inputBuf: {
 *  imageBuffer
 *  imageBufferSize,
 *  imageHeight,
 *  imageWidth,
 * }
 * outputBuf: {
 *  imageBuffer
 *  full
 *  width
 *  height
 * }
 */

function linearMap(extent1, extent2) {
  let ratio = (extent2[1] - extent2[0]) / (extent1[1] - extent1[0]);
  return function (x) {
    return Math.floor(ratio * x);
  };
}

exports.default = {
  // 宽度为维度
  grayBuf2RgbaBuf(buf, rgbaBuf, rgbaWidth, rgbaHeight) {
    rgbaBuf = rgbaBuf || {
      imageBuffer: [],
      full: false,
      width: rgbaWidth,
      height: 0
    };
    let minHeight = Math.min(buf.imageHeight, rgbaHeight - rgbaBuf.height);
    let minWidth;
    let mapFn;
    if (rgbaWidth <= buf.imageWidth) {
      mapFn = linearMap([0, rgbaWidth], [0, buf.imageWidth]);
      minWidth = rgbaWidth;
    } else {
      mapFn = linearMap([0, buf.imageWidth], [0, rgbaWidth]);
      minWidth = buf.imageWidth;
    }
    for (let i = 0; i < minHeight; i++) {
      rgbaBuf.height++;
      for (let j = 0; j < minWidth; j++) {
        let distJ = mapFn(j);
        rgbaBuf.imageBuffer.push(buf.imageBuffer[distJ]);
        rgbaBuf.imageBuffer.push(buf.imageBuffer[distJ]);
        rgbaBuf.imageBuffer.push(buf.imageBuffer[distJ]);
        rgbaBuf.imageBuffer.push(255);
      }
    }
    rgbaBuf.full = rgbaBuf.height === rgbaHeight;
    return rgbaBuf;
  }
};