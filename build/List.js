'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactWebScroller = require('react-web-scroller');

var _reactWebScroller2 = _interopRequireDefault(_reactWebScroller);

var _MeasureBox = require('./MeasureBox');

var _MeasureBox2 = _interopRequireDefault(_MeasureBox);

var _Tick = require('./Tick');

var _Tick2 = _interopRequireDefault(_Tick);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const S_DIRECTION = {
  UP: 'up',
  DOWN: 'down'
};

const noop = () => {};

class List extends _react.Component {

  constructor(props) {
    super(props);
    this._topItemDataIdx = 0;
    this._currentScrollItemCount = 0;
    this._listItems = [];
    this._visualItemCount = 0;
    this._initPosition = { x: 0, y: 0 };
    this.setPadding(0, 0);
    this._itemHeight = 0;
    this._rafIds = [];
    this.state = {
      measureBoxs: []
    };
  }

  getDataSize(data) {
    return data && data.size();
  }

  getAxis() {
    return this.props.direction === 'v' ? 'y' : 'x';
  }

  setPadding(x, y) {
    this._initPadding = {
      x,
      y
    };

    this._paddingStyle = {
      width: x,
      height: y
    };
  }

  renderMeasureBoxs() {
    let measureBoxs = this.state.measureBoxs;
    let mappedMeasureBoxs = [];
    let axis = this.getAxis();
    measureBoxs.forEach(box => {
      if (box.positionMapped) {
        mappedMeasureBoxs.push(box);
      } else {
        box.top = box.top / this.context.dPix2cssRatio;
        box.right = box.lineIndex / this.context.dPix2cssRatio + this._initPadding[axis];
        delete box.left;
        box.positionMapped = true;
        mappedMeasureBoxs.push(box);
      }
    });
    return _react2.default.createElement(
      'div',
      { style: styles.measureBoxContainer, className: '_measureBoxs' },
      mappedMeasureBoxs.map(box => _react2.default.createElement(_MeasureBox2.default, _extends({ key: box.id }, box)))
    );
  }

  renderTicks() {
    if (this.context.tickInterval) {
      if (!this._ticks) this._ticks = [];
      let lastTick = this._ticks[this._ticks.length - 1];
      let nextTickValue;
      if (lastTick) {
        nextTickValue = lastTick.value + this.context.tickInterval;
      } else {
        nextTickValue = 0;
      }
      let axis = this.getAxis();
      let nextTick = {
        id: nextTickValue,
        right: nextTickValue / this.context.dPix2cssRatio + this._initPadding[axis],
        value: nextTickValue
      };
      let minPosition = Math.abs(this.getMinPosition()[axis]);
      if (nextTick.right < minPosition) {
        this._ticks.push(nextTick);
      }
      return _react2.default.createElement(
        'div',
        { style: styles.tickContainer, className: '_tickBox' },
        this._ticks.map(tick => _react2.default.createElement(_Tick2.default, _extends({ key: tick.id }, tick)))
      );
    } else {
      return null;
    }
  }

  // list无限滚动需要知道list item的高度
  // 1. itemHeight可以由外部传入
  // 2. 当外部没有传入itemHeight时需要传入高宽比(itemHwRatio), 用于自动计算itemHeight
  renderItemHeightDetectorEl() {
    if (this.props.itemHeight) {
      return null;
    }
    return _react2.default.createElement('div', { style: styles.itemHeightDetector,
      ref: el => this._itemHeightDetectorEl = el
    });
  }

  renderListItem(key, data, itemStyle) {
    return _react2.default.createElement(this.props.itemClazz, _extends({ key: key }, data, { style: itemStyle,
      rotate: this.props.rotate }));
  }

  renderMeasureBox() {
    return _react2.default.createElement(EditLayer, { scale: this.state.scale });
  }

  renderListItems() {
    let {
      data,
      style,
      direction
    } = this.props;
    let itemHeight = this._itemHeight;
    let items = this._listItems;
    let itemCount = this._currentScrollItemCount;
    let topItemIdx = this._topItemDataIdx;
    let itemLength = this._listItems.length;
    let heightName = direction === 'v' ? 'height' : 'width';
    let axis = this.getAxis();
    let itemStyle = {};
    if (itemHeight) {
      itemStyle[heightName] = itemHeight;
    }
    let renderItemCount = Math.min(this._visualItemCount, data.size());
    if (this._sDirection === S_DIRECTION.UP) {
      this._paddingStyle[heightName] -= itemCount * itemHeight;
      for (let i = itemCount - 1; i >= 0; i--) {
        // 当items的数量超过最大数量时才删除
        if (items.length >= itemLength) {
          items.pop();
        }
        let dataIdx = topItemIdx + i;
        let itemData = data.getDataAt(dataIdx);
        if (itemData) {
          items.unshift(this.renderListItem(dataIdx, itemData, itemStyle));
        }
      }
    } else if (this._sDirection === S_DIRECTION.DOWN) {
      this._paddingStyle[heightName] += itemCount * itemHeight;
      for (let i = 0; i < itemCount; i++) {
        // 当items的数量超过最大数量时才删除
        if (items.length >= itemLength) {
          items.shift();
        }
        let dataIdx = topItemIdx + i + itemLength - itemCount;
        let itemData = data.getDataAt(dataIdx);

        if (itemData) {
          items.push(this.renderListItem(dataIdx, itemData, itemStyle));
        }
      }
    } else {
      this._listItems = items = [];
      for (let i = 0; i < renderItemCount; i++) {
        let dataIdx = topItemIdx + i;
        // 考虑store数据被截断的case
        let itemData = data.getDataAt(dataIdx) || {};
        items.push(this.renderListItem(dataIdx, itemData, itemStyle));
      }
    }
    this._sDirection = null;

    let contentStyle = Object.assign({}, style);
    contentStyle[heightName] = itemHeight * data.size() + this._initPadding[axis];
    let holderStyle = {};
    holderStyle[heightName] = this._paddingStyle[heightName];

    return _react2.default.createElement(
      'div',
      { className: '_list', style: contentStyle,
        ref: el => {
          this.el = el;
        } },
      _react2.default.createElement('div', { style: holderStyle }),
      this.renderItemHeightDetectorEl(),
      this.renderMeasureBoxs(),
      this.renderTicks(),
      items
    );
  }

  render() {
    return _react2.default.createElement(
      _reactWebScroller2.default,
      { style: styles.scroller,
        ref: scroller => {
          this._scroller = scroller;
        },
        direction: this.props.direction,
        useCssTransition: false,
        showIndicator: false,
        rtl: this.props.rtl },
      this.renderListItems()
    );
  }

  componentWillMount() {
    this._dataLn = this.getDataSize(this.props.data);
  }

  componentWillReceiveProps(nextProps) {
    this._mapPropsMeasureboxToState(nextProps);
    this._updatePositionMap(nextProps);
  }

  componentDidMount() {
    if (this.props.padding2Smooth) {
      // 加点padding, 隐藏启动时的抖动
      let containerSize = this.getContainerSize();
      this.setPadding(containerSize.x + 100, containerSize.y + 100);
    }

    this._calcItemHeight();
    this._initPositionMap(this._itemHeight, this.props.data.size());
    this._calcVisualItemCount(this.props.height, this._itemHeight);
    this._scroller.on('scroll', this.onScroll.bind(this));
    let resize = this._scroller._resize;
    this._scroller._resize = () => {
      this._calcVisualItemCount(this.props.height, this._itemHeight);
      resize();
    };
    // 第一次render时可能需要识别itemHeight, 这里立即第二次render可以保证宽度正常
    // 主要解决组件初始化后立即调用scrollTo方法
    this._rafIds.push(requestAnimationFrame(() => {
      if (this._scroller) {
        this.forceUpdate();
        this._scroller._refreshPosition();
        this._didMount = true;
        this.scrollTo(this._initPosition.x, this._initPosition.y);
      }
    }));
  }

  componentDidUpdate() {
    this.onConsumeProcess();
  }

  componentWillUnmount() {
    this._rafIds.forEach(rafId => cancelAnimationFrame(rafId));
  }

  /*
   * 通知外部组件当前数据的消费情况
   * TODO: 垂直方向的考虑
   */
  onConsumeProcess() {
    if (this.props.blockscope) {
      let px = this.getPosition().x;
      let mpx = this.getMinPosition().x;
      let remainScroll = Math.abs(px - mpx);
      if (remainScroll > this.props.blockscope[1]) {
        this.props.onBlock();
      } else if (remainScroll < this.props.blockscope[0]) {
        this.props.onDrain();
      }
    }
  }

  onScroll(scroller, position) {
    let axis = this.getAxis();
    let dis = this.props.rtl ? -position[axis] : position[axis];
    dis = dis - this._initPadding[axis];
    let itemIdx = this._positionMap.findIndex(dis);
    let maxIndex = this.props.data.size() - this._listItems.length;
    itemIdx = Math.min(itemIdx, maxIndex);
    let start = this.props.data.start();
    if (itemIdx < start) {
      itemIdx = start;
      this._clear();
    }
    this.props.data.setMin(itemIdx);
    if (itemIdx !== this._topItemDataIdx) {
      if (this._topItemDataIdx > itemIdx) {
        this._sDirection = S_DIRECTION.UP;
        this._currentScrollItemCount = this._topItemDataIdx - itemIdx;
      } else {
        this._sDirection = S_DIRECTION.DOWN;
        this._currentScrollItemCount = itemIdx - this._topItemDataIdx;
      }
      this._topItemDataIdx = itemIdx;
      this.forceUpdate();
    } else {
      this._currentScrollItemCount = 0;
    }
  }

  _clear() {
    setTimeout(() => {
      this.props.data.clear();
      this._positionMap.setCount(this.props.data.size());
      this.scrollTo(0, 0);
      this.forceUpdate();
    });
  }

  _initPositionMap(height, size) {
    this._positionMap = new PositionMap({
      height: height,
      count: size
    });
  }

  _calcItemHeight() {
    let {
      itemHwRatio,
      itemHeight,
      direction
    } = this.props;
    if (itemHeight) {
      this._itemHeight = itemHeight;
    } else {
      let el2viewportRatio = this.el.clientHeight / window.innerHeight;
      let base = el2viewportRatio * 100;
      if (direction === 'v') {
        this._itemHeightDetectorEl.style.height = `${base * itemHwRatio}vw`;
        this._itemHeightDetectorEl.style.width = `${base}vw`;
      } else {
        this._itemHeightDetectorEl.style.height = `${base}vh`;
        this._itemHeightDetectorEl.style.width = `${base * itemHwRatio}vh`;
      }

      let widthProp = this.props.direction === 'v' ? 'clientHeight' : 'clientWidth';
      this._itemHeight = Math.floor(this._itemHeightDetectorEl[widthProp]);
    }
  }

  _calcVisualItemCount(height, itemHeight) {
    if (!height) {
      if (this.el) {
        height = Math.max(this.el.clientWidth || this.el.clientHeight);
      } else {
        height = Math.max(window.innerWidth, window.innerHeight);
      }
    }
    this._visualItemCount = Math.max(this._visualItemCount, Math.ceil(height / itemHeight) + 1);
    // FIXME ugly
    if (this.props.data) {
      this.props.data.__inScreenDataNum = this._visualItemCount;
    }
  }

  _mapPropsMeasureboxToState(nextProps) {
    let size = this.getDataSize(nextProps.data);
    let nextMeasureBoxs = nextProps.data.getMeasureBoxs() || [];
    let mergeMeasureBox = [];
    nextMeasureBoxs.forEach(box => {
      let find = this.state.measureBoxs.find(thisBox => thisBox.id === box.id);
      if (!find) {
        mergeMeasureBox.push(box);
      } else {
        mergeMeasureBox.push(find);
      }
    });
    this.state.measureBoxs = mergeMeasureBox;
  }

  _updatePositionMap(nextProps) {
    let size = this.getDataSize(nextProps.data);
    if (size !== this._dataLn) {
      this._dataLn = size;
      this._scroller && this._scroller._refreshPosition();
      this._positionMap && this._positionMap.setCount(size);
    }
  }

  getPosition() {
    if (this._didMount) {
      return this._scroller.getPosition();
    } else {
      return this._initPosition;
    }
  }

  getMinPosition() {
    if (this._scroller) {
      return this._scroller.getMinPosition();
    } else {
      return {
        x: 0,
        y: 0
      };
    }
  }

  getContainerSize() {
    if (this._scroller) {
      return this._scroller.getContainerSize();
    } else {
      return {
        x: 0,
        y: 0
      };
    }
  }

  scrollTo(x, y) {
    if (this._didMount) {
      this._scroller.scrollTo(x, y);
    } else {
      this._initPosition = { x: x, y: y };
    }
  }

  scrollToMiddle() {
    let minPosition = this.getMinPosition();
    let scrollX = minPosition.x / 2;
    this.scrollTo(scrollX, 0);
  }
}

exports.default = List;
List.propTypes = {
  data: _react.PropTypes.any.isRequired,
  itemHeight: _react.PropTypes.number,
  itemHwRatio: _react.PropTypes.number,
  itemClazz: _react.PropTypes.func.isRequired,
  direction: _react.PropTypes.string,
  rtl: _react.PropTypes.bool
};
List.contextTypes = {
  dPix2cssRatio: _react.PropTypes.number,
  tickInterval: _react.PropTypes.number
};
List.defaultProps = {
  direction: 'v',
  onBlock: noop,
  onDrain: noop
};
class PositionMap {
  constructor(options) {
    this._height = options.height;
    this.setCount(options.count);
  }
  setCount(count) {
    if (this._count !== count && count != null) {
      this._map = [];
      var i = 0;
      for (; i < count; i++) {
        this._map.push(i * this._height);
      }
      this._count = count;
    }
  }
  findIndex(y) {
    return this.binarySearch(this._map, y);
  }
  binarySearch(arr, value) {
    let ln = arr.length;
    let startIdx = 0;
    let endIdx = ln - 1;

    if (value <= arr[startIdx]) {
      return startIdx;
    }

    if (value >= arr[endIdx]) {
      return endIdx;
    }

    while (startIdx + 1 < endIdx) {
      let middleIdx = Math.floor((startIdx + endIdx) / 2);
      if (value < arr[middleIdx]) {
        endIdx = middleIdx;
      } else if (value > arr[middleIdx]) {
        startIdx = middleIdx;
      } else {
        return middleIdx;
      }
    }
    return startIdx;
  }
}

let styles = {
  scroller: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%'
  },
  itemHeightDetector: {
    position: 'absolute',
    top: 0
  },
  measureBoxContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 10
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 10
  }
};