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
  return function(x) {
    return Math.floor(ratio * x);
  }
}

export default {
  // 宽度为维度
  grayBuf2RgbaBuf(buf, rgbaBuf, rgbaWidth, rgbaHeight) {
    if (!rgbaBuf) {
      let ln = rgbaWidth * rgbaHeight * 4;
      let arr = new Uint8ClampedArray(ln);
      let imageData = new ImageData(arr, rgbaWidth, rgbaHeight);
      rgbaBuf = {
        imageBuffer: imageData,
        full: false,
        idx: 0,
        width: rgbaWidth,
        height: rgbaHeight,
        fillHeight: 0,
      };
    }
    let imageBuffer = rgbaBuf.imageBuffer.data;
    let minHeight = Math.min(buf.imageHeight, rgbaHeight - rgbaBuf.fillHeight);
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
      rgbaBuf.fillHeight++;
      for (let j = 0; j < minWidth; j++) {
        let distJ = mapFn(j);
        imageBuffer[rgbaBuf.idx++] = buf.imageBuffer[distJ];
        imageBuffer[rgbaBuf.idx++] = buf.imageBuffer[distJ];
        imageBuffer[rgbaBuf.idx++] = buf.imageBuffer[distJ];
        imageBuffer[rgbaBuf.idx++] = 255;
      }
    }
    rgbaBuf.full = rgbaBuf.fillHeight === rgbaBuf.height;
    return rgbaBuf;
  }
}
