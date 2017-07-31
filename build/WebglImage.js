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
  }
};

const vertexShaderRotateTpl = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  uniform vec2 u_rotation;

  varying vec2 v_texCoord;

  void main() {

    vec2 rotatedPosition = vec2(
      a_position.x * u_rotation.y + a_position.y * u_rotation.x,
      a_position.y * u_rotation.y - a_position.x * u_rotation.x);

    vec2 position = rotatedPosition + u_translation;

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord;
  }
`;

const vertexShaderTpl = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;

  varying vec2 v_texCoord;

  void main() {

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderTpl = `
  precision mediump float;

  // our texture
  uniform sampler2D u_image;

  // the texCoords passed in from the vertex shader.
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

function createProgram(gl, rotate) {
  let shaderProgram = gl.createProgram();

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, rotate ? vertexShaderRotateTpl : vertexShaderTpl);
  gl.compileShader(vertexShader);

  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderTpl);
  gl.compileShader(fragmentShader);

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  return shaderProgram;
}

function createBuffers(gl, image) {
  let positionBuffer = gl.createBuffer();
  let width = image.width;
  let height = image.height;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, width, 0.0, 0.0, height, 0.0, height, width, 0.0, width, height]), gl.STATIC_DRAW);

  let texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]), gl.STATIC_DRAW);

  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, image.imageBuffer);

  return {
    positionBuffer,
    texCoordBuffer,
    count: 6
  };
}

class CanvasImage extends _react.Component {

  renderByPix() {
    let {
      width,
      height,
      src,
      rotate
    } = this.props;
    let gl = this.canvasEl.getContext("webgl");
    let program = createProgram(gl, rotate);
    let bufs = createBuffers(gl, src);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);

    gl.useProgram(program);

    let positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.texCoordBuffer);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, this.canvasEl.width, this.canvasEl.height);

    if (rotate) {
      let translationLocation = gl.getUniformLocation(program, "u_translation");
      let rotationLoaction = gl.getUniformLocation(program, "u_rotation");
      gl.uniform2fv(translationLocation, [0, width]);
      // rotate 90deg
      gl.uniform2fv(rotationLoaction, [1, 0]);
    }

    gl.drawArrays(gl.TRIANGLES, 0, bufs.count);
  }

  renderImg() {
    if (this._webglRendered) {
      let gl = this.canvasEl.getContext('webgl');
      let image = this.props.src;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, image.width, image.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, image.imageBuffer);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      this.renderByPix();
      this._webglRendered = true;
    }
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
    if (rotate) {
      this.canvasEl.width = height;
      this.canvasEl.height = width;
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