import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scroller from 'react-web-scroller';
import List, { Store } from './List';
import Image from './Image';
import EditLayer from './EditLayer';
import buf2pix from './buf2pix';

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

let itemId = 0;

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
    this._store = new Store({
      maxLn: props.maxCacheData,
      data: this.state.imgs,
    });
  }

  static propTypes = {
    name: PropTypes.string,
    direction: PropTypes.string,
    velocity: PropTypes.number,
    imgWidth: PropTypes.number,
    imgHeight: PropTypes.number,
    imgs: PropTypes.array,
    column: PropTypes.number,
    scaleStep: PropTypes.number,
    maxCacheData: PropTypes.number,
    webgl: PropTypes.bool,
  }

  static defaultProps = {
    direction: DIRECTION.RIGHT,
    velocity: 1,
    imgWidth: 2560,
    imgHeight: 1280,
    // itemHeight: 176,
    column: 1,
    scaleStep: .5,
    maxCacheData: 1000,
    webgl: true,
  };

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
    let {
      velocity,
    } = this.props;
    cancelAnimationFrame(this._rafId);
    if (!this._inFlow && !this.state.paused) {
      this._rafId = requestAnimationFrame(() => {
        this._inFlow = true;
        let position = this._positionAdd(velocity);
        this._moveTo(position);
        this._inFlow = false;
        this._doFlow();
      });
    }
  }

  _positionAdd(distance) {
    let position = this._scroller.getPosition();
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
    this._scroller.scrollTo(position.x, position.y);
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
    })
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
        }
        break;
      // ESC
      case 27:
        this.setState({
          inEdit: false,
        });
        break;
      // s
      case 83:
        if (!this.state.inEdit && !this.state.paused) {
          this.setState({
            paused: true,
          });
        }
        break;
        // g
      case 71:
        if (!this.state.inEdit && this.state.paused) {
          this.setState({
            paused: false,
          });
        }
        break;
      default:
    }
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

  // 目前页面的结构采用多个Canvas, 每个Canvas画图片的一部分，数据流中的数据是2560*1的像素点
  // 需要将数据流中多个数据合并成一个canvas描绘用数据
  _addData(imgs=[]) {
    const {
      imgWidth,
      imgHeight,
      webgl,
    } = this.props;

    let imgRotate = this.props.direction === DIRECTION.RIGHT ? 1 : 0;

    // 先填满store中最后一个未填满的data
    let lastData = this._store.getLast();

    imgs.forEach((img, idx) => {
      if (!lastData || lastData.src.full) {
        lastData = {
          idx: itemId++,
          src: buf2pix.grayBuf2RgbaBuf(img, null, imgWidth, imgHeight),
          width: imgWidth,
          height: imgHeight,
          rotate: imgRotate,
          webgl,
        };
        this._store.addData([lastData]);
      } else {
        buf2pix.grayBuf2RgbaBuf(img, lastData.src, imgWidth, imgHeight);
      }
    });
  }

  renderControls() {
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

  renderMask() {
    return !this.state.paused &&
      <div className="_mask" style={styles.mask}
        onClick={this.onMaskClick.bind(this)}
      ></div>;
  }

  renderEditCanvas() {
    return this.state.inEdit && <EditLayer scale={this.state.scale}/>;
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

    let props = this.getListProps(imgs);
    return (
      <div className="_scale_container" style={scaleStyle}>
        <List {...props}
          itemHeight={this.props.itemHeight}
          itemHwRatio={hwRatio}
          itemClazz={Image}
          direction={listDirection}
          rtl={rtl}
          ref={(scroller) => {this._scroller = scroller;}}
        />
      </div>
    );
  }

  render() {
    this._doFlow();
    return (
      <div className="_liveimg" style={styles.container}>
        {this.renderControls()}
        {this.renderMask()}
        {this.renderEditCanvas()}
        {this.renderImgList()}
      </div>
    );
  }

  componentWillMount() {
    this._addData(this.props.imgs);
  }

  componentWillReceiveProps(nextProps) {
    this._addData(nextProps.imgs)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
  }
}
