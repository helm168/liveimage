import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scroller from 'react-web-scroller';
import Store from './Store';
import List from './List';
import Image from './Image';
import EditLayer from './EditLayer';
import buf2pix from './buf2pix';
import pool from './webglRenderPool';

export const DIRECTION = {
  LEFT: 'l',
  TOP: 't',
  RIGHT: 'r',
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  mask: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  hControls: {
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 45,
    left: 15,
    right: 15,
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
    width: 100,
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
    marginTop: 5,
  },
  list: {
    display: 'inline-flex',
    height: '100%',
    width: '100%',
  }
};

export default class LiveImage extends Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      paused: false,
      scale: 1,
      inEdit: false,
      imgs: [],
    };
    this.onKeydown = this.onKeydown.bind(this);
  }

  static propTypes = {
    direction: PropTypes.string,
    velocity: PropTypes.number,
    autoVelocity: PropTypes.bool,
    minVelocity: PropTypes.number,
    maxVelocity: PropTypes.number,
    imgWidth: PropTypes.number,
    imgHeight: PropTypes.number,
    imgs: PropTypes.array,
    column: PropTypes.number,
    scaleStep: PropTypes.number,
    maxCacheData: PropTypes.number,
    webgl: PropTypes.bool,
    onMeasure: PropTypes.func,
    store: PropTypes.object,
    paused: PropTypes.bool,
    showControls: PropTypes.bool,
    // 实际尺寸(mm)和物理像素的比值
    mm2dPixRatio: PropTypes.number,
    padding2Smooth: PropTypes.bool,
    // 刻度间隔，用来debug用
    tickInterval: PropTypes.number,
    showMeasures: PropTypes.bool,
    onRenderMeasures: PropTypes.func,
    onanimation: PropTypes.func,
    bufLength: PropTypes.number
  }

  static defaultProps = {
    direction: DIRECTION.RIGHT,
    velocity: .5,
    autoVelocity: true,
    minVelocity: .5,
    maxVelocity: 2,
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
    padding2Smooth: true,
    showMeasures: false,
    onRenderMeasures: null, 
    onanimation: (liveimage, ln)=> {},
    bufLength: 5
  }

  static childContextTypes = {
    mm2dPixRatio: PropTypes.number,
    dPix2cssRatio: PropTypes.number,
    webgl: PropTypes.bool,
    tickInterval: PropTypes.number,
    showMeasures: PropTypes.bool,
    onRenderMeasures: PropTypes.func,
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
      tickInterval: this.props.tickInterval,
      showMeasures: this.props.showMeasures,
      onRenderMeasures: this.props.onRenderMeasures,
    };
  }

  _flow() {
    if (this.state.paused && !this.state.inEdit) {
      this.setState({
        paused: false,
      });
    }
  }

  _pause() {
    cancelAnimationFrame(this._rafId);
    if (!this.state.paused && !this.state.inEdit) {
      this.setState({
        paused: true,
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
        this.props.onanimation(this, this.props.bufLength);
        this._inFlow = false;
        this._doFlow();
      });
    }
  }

  _positionAdd(distance) {
    let position = this.getPosition();
    switch(this.props.direction) {
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
    if (this._scroller) {
      this._scroller.scrollTo(position.x, position.y);
    }
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
    return {x : 0, y: 0};
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
      scale: this.state.scale + this.props.scaleStep,
    });
  }

  onZoomout() {
    this.setState({
      scale: this.state.scale - this.props.scaleStep,
    });
  }

  onToggleEdit() {
    this.setState({
      inEdit: !this.state.inEdit,
      paused: true,
    });
    this.forceUpdate();
  }

  onKeydown(evt) {
    let code = evt.keyCode || evt.which;
    switch(code) {
      // e
      case 69:
        if (!this.state.inEdit) {
          this.setState({
            inEdit: true,
            paused: true,
          });
          this.forceUpdate();
        }
        break;
      // ESC
      case 27:
        this.setState({
          inEdit: false,
        });
        this.forceUpdate();
        break;
      // s
      case 83:
        if (!this.state.inEdit && !this.state.paused) {
          this.setState({
            paused: true,
          });
          this.forceUpdate();
        }
        break;
        // g
      case 71:
        if (!this.state.inEdit && this.state.paused) {
          this.setState({
            paused: false,
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

  getListProps(imgs=[]) {
    let style = Object.assign({}, styles.list);
    if (this.props.direction === DIRECTION.TOP) {
      style.flexDirection = 'column';
    }
    return {
      data: this._store,
      style: style,
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
    return (
      <div className='_controls' style={style}>
        <button className="btn" style={styles.btn} onClick={this.onPauseClick.bind(this)}>{text}</button>
        <button className="btn" style={styles.btn} onClick={this.onZoomin.bind(this)}>+</button>
        <button className="btn" style={styles.btn} onClick={this.onZoomout.bind(this)}>-</button>
        <button className="btn" style={styles.btn} onClick={this.onToggleEdit.bind(this)}>{editText}</button>
      </div>
    );
  }

  enterEditMode() {
    this.setState({
      inEdit: true,
      paused: true,
    });
    this.forceUpdate();
  }

  exitEditMode() {
    this.setState({
      inEdit: false,
      paused: true,
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
    return this.props.showControls && !this.state.paused &&
      <div className="_mask" style={styles.mask}
        onClick={this.onMaskClick.bind(this)}
      ></div>;
  }

  renderEditCanvas() {
    return this.state.inEdit &&
      <EditLayer scale={this.state.scale}
        onMeasure={this.props.onMeasure}
      />;
  }

  renderImgList() {
    const {
      direction,
      imgWidth,
      imgHeight,
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

    let scaleStyle = {
      ...styles.container,
      transform: `scale(${this.state.scale})`,
      transformOrigin,
    }

    let rtl = direction === DIRECTION.RIGHT;
    if (rtl) {
      scaleStyle.direction = 'rtl';
    }

    let hwRatio = imgHeight / imgWidth;

    let imgRotate = this.props.direction === DIRECTION.RIGHT ? 1 : 0;

    let props = this.getListProps(imgs);
    let blockscope = this.props.autoVelocity ? this.props.blockscope : null;
    return (
      <div className="_scale_container" style={scaleStyle}>
        <List {...props}
          itemHeight={this.props.itemHeight}
          itemHwRatio={hwRatio}
          itemClazz={Image}
          rotate={imgRotate}
          direction={listDirection}
          rtl={rtl}
          onBlock={this.onBlock.bind(this)}
          onDrain={this.onDrain.bind(this)}
          consumeNotification={this.props.autoVelocity}
          padding2Smooth={this.props.padding2Smooth}
          ref={(scroller) => {this._scroller = scroller;}}
        />
      </div>
    );
  }

  render() {
    this._doFlow();
    return (
      <div className="_liveimg" style={styles.container}
        ref={(el) => this.el = el}>
        {this.renderControls()}
        {this.renderMask()}
        {this.renderEditCanvas()}
        {this.renderImgList()}
      </div>
    );
  }

  createStore() {
    return new Store({
      maxLn: this.props.maxCacheData,
      data: this.state.imgs,
    });
  }

  addData(imgs) {
    if (imgs) {
      this._store.addImageData(imgs, {
        imgWidth: this.props.imgWidth,
        imgHeight: this.props.imgHeight,
        webgl: this.props.webgl,
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
        rotate,
      } = this.props;
      pool.init({
        image: {
          imageBuffer: new Uint8Array(imgWidth * imgHeight).fill(255),
          width: imgWidth,
          height: imgHeight,
        },
        rotate: 1,
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
    if (nextProps.store) { 
      this._store = nextProps.store;
    } else if (nextProps.imgs) {
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
