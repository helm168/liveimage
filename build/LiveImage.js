'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DIRECTION = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactWebScroller = require('react-web-scroller');

var _reactWebScroller2 = _interopRequireDefault(_reactWebScroller);

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _List = require('./List');

var _List2 = _interopRequireDefault(_List);

var _Image = require('./Image');

var _Image2 = _interopRequireDefault(_Image);

var _EditLayer = require('./EditLayer');

var _EditLayer2 = _interopRequireDefault(_EditLayer);

var _buf2pix = require('./buf2pix');

var _buf2pix2 = _interopRequireDefault(_buf2pix);

var _webglRenderPool = require('./webglRenderPool');

var _webglRenderPool2 = _interopRequireDefault(_webglRenderPool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DIRECTION = exports.DIRECTION = {
  LEFT: 'l',
  TOP: 't',
  RIGHT: 'r'
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  mask: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 5
  },
  hControls: {
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 45,
    left: 15,
    right: 15
  },
  vControls: {
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    top: 15,
    left: 15,
    bottom: 15,
    width: 100
  },
  btn: {
    minWidth: 55,
    padding: '4px 12px',
    fontSize: 14,
    lineHeight: '20px',
    cursor: 'pointer',
    textShadow: '0 1px 1px rgba(255, 255, 255, 0.75)',
    backgroundColor: '#f5f5f5',
    backgroundImage: 'linear-gradient(to bottom, #ffffff, #e6e6e6)',
    border: '1px solid #cccccc',
    borderBottomColor: '#b3b3b3',
    borderRadius: 3,
    marginLeft: 5,
    marginTop: 5
  },
  list: {
    display: 'inline-flex',
    height: '100%',
    width: '100%'
  }
};

class LiveImage extends _react.Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      paused: false,
      scale: 1,
      inEdit: false,
      imgs: []
    };
    this.onKeydown = this.onKeydown.bind(this);
  }

  getChildContext() {
    let dPix2cssRatio = 1;
    // TODO 方向
    if (this.el) {
      dPix2cssRatio = this.props.imgWidth / this.el.clientHeight;
    }
    return {
      mm2dPixRatio: this.props.mm2dPixRatio,
      dPix2cssRatio,
      webgl: this.props.webgl,
      tickInterval: this.props.tickInterval
    };
  }

  _flow() {
    if (this.state.paused && !this.state.inEdit) {
      this.setState({
        paused: false
      });
    }
  }

  _pause() {
    cancelAnimationFrame(this._rafId);
    if (!this.state.paused && !this.state.inEdit) {
      this.setState({
        paused: true
      });
    }
  }

  _doFlow() {
    cancelAnimationFrame(this._rafId);
    if (!this._inFlow && !this.state.paused) {
      this._rafId = requestAnimationFrame(() => {
        this._inFlow = true;
        let position = this._positionAdd(this._velocity);
        this._moveTo(position);
        this._inFlow = false;
        this._doFlow();
      });
    }
  }

  _positionAdd(distance) {
    let position = this.getPosition();
    switch (this.props.direction) {
      case DIRECTION.TOP:
        position.y += distance;
        break;
      case DIRECTION.LEFT:
        position.x += distance;
        break;
      case DIRECTION.RIGHT:
        position.x -= distance;
        break;
      default:
    }
    return position;
  }

  _moveTo(position) {
    this._scroller.scrollTo(position.x, position.y);
  }

  _addKeydownListener() {
    if (this.props.showControls && this._keydownListenerAdded) {
      document.addEventListener('keydown', this.onKeydown);
      this._keydownListenerAdded = true;
    }
  }

  scrollTo(position) {
    if (this._scroller) {
      this._moveTo(position);
    }
  }

  scrollToMiddle() {
    if (this._scroller) {
      this._scroller.scrollToMiddle();
    }
  }

  getPosition() {
    if (this._scroller) {
      return this._scroller.getPosition();
    }
    return { x: 0, y: 0 };
  }

  onPauseClick() {
    if (this.state.paused) {
      this._flow();
    } else {
      this._pause();
    }
  }

  onMaskClick() {
    this._pause();
  }

  onZoomin() {
    this.setState({
      scale: this.state.scale + this.props.scaleStep
    });
  }

  onZoomout() {
    this.setState({
      scale: this.state.scale - this.props.scaleStep
    });
  }

  onToggleEdit() {
    this.setState({
      inEdit: !this.state.inEdit,
      paused: true
    });
    this.forceUpdate();
  }

  onKeydown(evt) {
    let code = evt.keyCode || evt.which;
    switch (code) {
      // e
      case 69:
        if (!this.state.inEdit) {
          this.setState({
            inEdit: true,
            paused: true
          });
          this.forceUpdate();
        }
        break;
      // ESC
      case 27:
        this.setState({
          inEdit: false
        });
        this.forceUpdate();
        break;
      // s
      case 83:
        if (!this.state.inEdit && !this.state.paused) {
          this.setState({
            paused: true
          });
          this.forceUpdate();
        }
        break;
      // g
      case 71:
        if (!this.state.inEdit && this.state.paused) {
          this.setState({
            paused: false
          });
          this.forceUpdate();
        }
        break;
      default:
    }
  }

  onBlock() {
    this._velocity = Math.min(this._velocity + .5, this.props.maxVelocity);
  }

  onDrain() {
    this._velocity = Math.max(this._velocity - .5, this.props.minVelocity);
  }

  getListProps(imgs = []) {
    let style = Object.assign({}, styles.list);
    if (this.props.direction === DIRECTION.TOP) {
      style.flexDirection = 'column';
    }
    return {
      data: this._store,
      style: style
    };
  }

  renderControls() {
    if (!this.props.showControls) return null;
    let text = this.state.paused ? '继续' : '暂停';
    let editText = this.state.inEdit ? '编辑中' : '编辑';
    let style;
    if (this.props.direction === DIRECTION.TOP) {
      style = styles.vControls;
    } else {
      style = styles.hControls;
    }
    return _react2.default.createElement(
      'div',
      { className: '_controls', style: style },
      _react2.default.createElement(
        'button',
        { className: 'btn', style: styles.btn, onClick: this.onPauseClick.bind(this) },
        text
      ),
      _react2.default.createElement(
        'button',
        { className: 'btn', style: styles.btn, onClick: this.onZoomin.bind(this) },
        '+'
      ),
      _react2.default.createElement(
        'button',
        { className: 'btn', style: styles.btn, onClick: this.onZoomout.bind(this) },
        '-'
      ),
      _react2.default.createElement(
        'button',
        { className: 'btn', style: styles.btn, onClick: this.onToggleEdit.bind(this) },
        editText
      )
    );
  }

  enterEditMode() {
    this.setState({
      inEdit: true,
      paused: true
    });
    this.forceUpdate();
  }

  exitEditMode() {
    this.setState({
      inEdit: false,
      paused: true
    });
    this.forceUpdate();
  }

  flow() {
    this._flow();
  }

  pause() {
    this._pause();
  }

  renderMask() {
    return this.props.showControls && !this.state.paused && _react2.default.createElement('div', { className: '_mask', style: styles.mask,
      onClick: this.onMaskClick.bind(this)
    });
  }

  renderEditCanvas() {
    return this.state.inEdit && _react2.default.createElement(_EditLayer2.default, { scale: this.state.scale,
      onMeasure: this.props.onMeasure
    });
  }

  renderImgList() {
    const {
      direction,
      imgWidth,
      imgHeight
    } = this.props;

    let imgs = this.state.imgs;
    let listDirection;
    let transformOrigin;
    if (direction === DIRECTION.TOP) {
      listDirection = 'v';
      transformOrigin = 'top';
    } else if (direction === DIRECTION.RIGHT) {
      listDirection = 'h';
      transformOrigin = 'right';
    } else {
      listDirection = 'h';
      transformOrigin = 'left';
    }

    let scaleStyle = _extends({}, styles.container, {
      transform: `scale(${this.state.scale})`,
      transformOrigin
    });

    let rtl = direction === DIRECTION.RIGHT;
    if (rtl) {
      scaleStyle.direction = 'rtl';
    }

    let hwRatio = imgHeight / imgWidth;

    let imgRotate = this.props.direction === DIRECTION.RIGHT ? 1 : 0;

    let props = this.getListProps(imgs);
    let blockscope = this.props.autoVelocity ? this.props.blockscope : null;
    return _react2.default.createElement(
      'div',
      { className: '_scale_container', style: scaleStyle },
      _react2.default.createElement(_List2.default, _extends({}, props, {
        itemHeight: this.props.itemHeight,
        itemHwRatio: hwRatio,
        itemClazz: _Image2.default,
        rotate: imgRotate,
        direction: listDirection,
        rtl: rtl,
        onBlock: this.onBlock.bind(this),
        onDrain: this.onDrain.bind(this),
        blockscope: blockscope,
        padding2Smooth: this.props.padding2Smooth,
        ref: scroller => {
          this._scroller = scroller;
        }
      }))
    );
  }

  render() {
    this._doFlow();
    return _react2.default.createElement(
      'div',
      { className: '_liveimg', style: styles.container,
        ref: el => this.el = el },
      this.renderControls(),
      this.renderMask(),
      this.renderEditCanvas(),
      this.renderImgList()
    );
  }

  createStore() {
    return new _Store2.default({
      maxLn: this.props.maxCacheData,
      data: this.state.imgs
    });
  }

  addData(imgs) {
    if (imgs) {
      this._store.addImageData(imgs, {
        imgWidth: this.props.imgWidth,
        imgHeight: this.props.imgHeight,
        webgl: this.props.webgl
      });
    }
  }

  componentWillMount() {
    this.state.paused = this.props.paused;
    this._store = this.props.store || this.createStore();
    this.addData(this.props.imgs);
    if (!this._initPool && this.props.webgl) {
      let {
        imgWidth,
        imgHeight,
        rotate
      } = this.props;
      _webglRenderPool2.default.init({
        image: {
          imageBuffer: new Uint8Array(imgWidth * imgHeight).fill(255),
          width: imgWidth,
          height: imgHeight
        },
        rotate: 1
      }, 12);
      this._initPool = true;
    }
  }

  shouldComponentUpdate() {
    if (this.state.paused || this.state.inEdit) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.imgs) {
      this.addData(nextProps.imgs);
    }
  }

  componentDidMount() {
    this._velocity = this.props.velocity;
    this._addKeydownListener();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._rafId);
    document.removeEventListener('keydown', this.onKeydown);
    this._keydownListenerAdded = false;
  }
}
exports.default = LiveImage;
LiveImage.propTypes = {
  direction: _propTypes2.default.string,
  velocity: _propTypes2.default.number,
  autoVelocity: _propTypes2.default.bool,
  minVelocity: _propTypes2.default.number,
  maxVelocity: _propTypes2.default.number,
  blockscope: _propTypes2.default.array,
  imgWidth: _propTypes2.default.number,
  imgHeight: _propTypes2.default.number,
  imgs: _propTypes2.default.array,
  column: _propTypes2.default.number,
  scaleStep: _propTypes2.default.number,
  maxCacheData: _propTypes2.default.number,
  webgl: _propTypes2.default.bool,
  onMeasure: _propTypes2.default.func,
  store: _propTypes2.default.object,
  paused: _propTypes2.default.bool,
  showControls: _propTypes2.default.bool,
  // 实际尺寸(mm)和物理像素的比值
  mm2dPixRatio: _propTypes2.default.number,
  padding2Smooth: _propTypes2.default.bool,
  // 刻度间隔，用来debug用
  tickInterval: _propTypes2.default.number
};
LiveImage.defaultProps = {
  direction: DIRECTION.RIGHT,
  velocity: .5,
  autoVelocity: true,
  minVelocity: .5,
  maxVelocity: 2,
  blockscope: [200, 300],
  imgWidth: 2560,
  imgHeight: 320,
  // itemHeight: 176,
  column: 1,
  scaleStep: .5,
  maxCacheData: 1000,
  webgl: true,
  paused: false,
  showControls: true,
  mm2dPixRatio: 1,
  padding2Smooth: true
};
LiveImage.childContextTypes = {
  mm2dPixRatio: _propTypes2.default.number,
  dPix2cssRatio: _propTypes2.default.number,
  webgl: _propTypes2.default.bool,
  tickInterval: _propTypes2.default.number
};