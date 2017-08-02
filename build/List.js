'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactWebScroller = require('react-web-scroller');

var _reactWebScroller2 = _interopRequireDefault(_reactWebScroller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const S_DIRECTION = {
  UP: 'up',
  DOWN: 'down'
};

class List extends _react.Component {

  constructor(props) {
    super(props);
    this._topItemDataIdx = 0;
    this._currentScrollItemCount = 0;
    this._listItems = [];
    this._visualItemCount = 0;

    // 多加点padding, 隐藏启动时的抖动
    this._initPadding = {
      x: window.innerWidth + 100,
      y: window.innerHeight + 100
    };
    this._itemHeight = 0;
    this._paddingStyle = {
      width: this._initPadding.x,
      height: this._initPadding.y
    };
    this.state = {};
  }

  getDataSize(data) {
    return data && data.size();
  }

  // list无限滚动需要知道list item的高度
  // 1. itemHeight可以由外部传入
  // 2. 当外部没有传入itemHeight时需要传入高宽比(itemHwRatio), 用于自动计算itemHeight
  renderItemHeightDetectorEl() {
    let itemHeightDetectorStyle = styles.itemHeightDetector;
    let {
      itemHeight,
      itemHwRatio,
      direction
    } = this.props;
    if (!this.props.itemHeight) {
      if (direction === 'v') {
        itemHeightDetectorStyle.width = '100vw';
        itemHeightDetectorStyle.height = `${100 * itemHwRatio}vw`;
      } else {
        itemHeightDetectorStyle.height = '100vh';
        itemHeightDetectorStyle.width = `${100 * itemHwRatio}vh`;
      }
    }
    if (itemHeight) {
      return null;
    }
    return _react2.default.createElement('div', { style: itemHeightDetectorStyle,
      ref: el => this._itemHeightDetectorEl = el
    });
  }

  renderListItem(key, data, itemStyle) {
    return _react2.default.createElement(this.props.itemClazz, _extends({ key: key }, data, { style: itemStyle }));
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
    let axis = direction === 'v' ? 'y' : 'x';
    let itemStyle = {};
    if (itemHeight) {
      itemStyle[heightName] = itemHeight;
    }
    let renderItemCount = Math.min(this._visualItemCount, data.size());
    if (this._sDirection === S_DIRECTION.UP) {
      this._paddingStyle[heightName] -= itemCount * itemHeight;
      for (let i = itemCount - 1; i >= 0; i--) {
        items.pop();
        let dataIdx = topItemIdx + i;
        let itemData = data.getDataAt(dataIdx);
        if (itemData) {
          items.unshift(this.renderListItem(dataIdx, itemData, itemStyle));
        }
      }
    } else if (this._sDirection === S_DIRECTION.DOWN) {
      this._paddingStyle[heightName] += itemCount * itemHeight;
      for (let i = 0; i < itemCount; i++) {
        items.shift();
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
        let itemData = data.getDataAt(dataIdx);
        if (itemData) {
          items.push(this.renderListItem(dataIdx, itemData, itemStyle));
        }
      }
    }
    this._sDirection = null;

    let contentStyle = Object.assign({}, style);
    contentStyle[heightName] = itemHeight * data.size() + this._initPadding[axis];
    let holderStyle = {};
    holderStyle[heightName] = this._paddingStyle[heightName];

    return _react2.default.createElement(
      'div',
      { className: '_list', style: contentStyle },
      _react2.default.createElement('div', { style: holderStyle }),
      this.renderItemHeightDetectorEl(),
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
    let size = this.getDataSize(nextProps.data);
    if (size !== this._dataLn) {
      this._dataLn = size;
      this._scroller._refreshPosition();
      this._positionMap.setCount(size);
    }
  }

  componentDidMount() {
    let widthProp = this.props.direction === 'v' ? 'clientHeight' : 'clientWidth';
    this._itemHeight = Math.floor(this.props.itemHeight || this._itemHeightDetectorEl[widthProp]);
    this._initPositionMap(this._itemHeight, this.props.data.size());
    this._calcVisualItemCount(this.props.height, this._itemHeight);
    this._scroller.on('scroll', this.onScroll.bind(this));
    let resize = this._scroller._resize;
    this._scroller._resize = () => {
      this._calcVisualItemCount(this.props.height, this._itemHeight);
      resize();
    };
  }

  componentDidUpdate() {}

  onScroll(scroller, position) {
    let axis = this.props.direction === 'v' ? 'y' : 'x';
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

  _calcVisualItemCount(height, itemHeight) {
    if (!height) {
      height = Math.max(window.innerWidth, window.innerHeight);
    }
    this._visualItemCount = Math.max(this._visualItemCount, Math.ceil(height / itemHeight) + 1);
  }

  getPosition() {
    if (this._scroller) {
      return this._scroller.getPosition();
    } else {
      return {
        x: 0,
        y: 0
      };
    }
  }

  scrollTo(x, y) {
    if (this._scroller) {
      this._scroller.scrollTo(x, y);
    }
  }
}

exports.default = List; // 用来控制数据缓存的类
// 由于图片一直以流的方式显示，不仅ui需要动态删除，数据也需要删除，不然可能撑爆内存

List.propTypes = {
  data: _react.PropTypes.any.isRequired,
  itemHeight: _react.PropTypes.number,
  itemHwRatio: _react.PropTypes.number,
  itemClazz: _react.PropTypes.func.isRequired,
  direction: _react.PropTypes.string,
  rtl: _react.PropTypes.bool
};
List.defaultProps = {
  direction: 'v'
};
class Store {
  constructor(options = {}) {
    this._maxLn = options.maxLn;
    this._minLn = 0;
    this._startIdx = 0;
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
  addData(data = []) {
    this.setData(this._data.concat(data));
  }
  setData(data = []) {
    if (data.length > this._maxLn) {
      let delLn = data.length - this._maxLn;
      this._startIdx += delLn;
      if (this._startIdx > this._minLn) {
        this._data = data.slice(delLn - (this._startIdx - this._minLn));
        this._startIdx = this._minLn;
      } else {
        this._data = data.slice(delLn);
      }
    } else {
      this._startIdx = 0;
      this._data = data;
    }
  }
  setMin(minLn) {
    this._minLn = minLn;
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

exports.Store = Store;
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
  }
};