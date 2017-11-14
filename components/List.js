import React, { Component, PropTypes } from 'react';
import Scroller from 'react-web-scroller';
import MeasureBox, { MODE } from './MeasureBox';
import Tick from './Tick';

const S_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
};

const noop = () => {};

const CONSOME_DETECT_TIMEOUT = 3000;

export default class List extends Component {
  static propTypes = {
    data: PropTypes.any.isRequired,
    itemHeight: PropTypes.number,
    itemHwRatio: PropTypes.number,
    itemClazz: PropTypes.func.isRequired,
    direction: PropTypes.string,
    rtl: PropTypes.bool,
    consumeNotification: PropTypes.bool,
  };

  static contextTypes = {
    dPix2cssRatio: PropTypes.number,
    tickInterval: PropTypes.number,
    showMeasures: PropTypes.bool,
    onRenderMeasures: PropTypes.func,
  };

  static defaultProps = {
    direction: 'v',
    onBlock: noop,
    onDrain: noop,
    consumeNotification: false,
  };

  constructor(props) {
    super(props);
    this._currentScrollItemCount = 0;
    this._listItems = [];
    this._visualItemCount = 0;
    this._initPosition = {x: 0, y: 0};
    this.setPadding(0, 0);
    this._itemHeight = 0;
    this._rafIds = [];
    this.state = {
      measureBoxs: [],
      selectedBox: null,
      topItemDataIdx: 0,
    };
    this.onDataReset = this.onDataReset.bind(this);
    this.onDataOverflow = this.onDataOverflow.bind(this);
    this._lastRemainScroll = 0;

    this.onMeasureBoxClick = this.onMeasureBoxClick.bind(this);
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
      y,
    };

    this._paddingStyle = {
      width: x,
      height: y,
    };
  }

  onMeasureBoxClick(boxId) {
    this.setState({
      selectedBox: this.state.selectedBox === boxId ? null: boxId
    });
  }

  renderMeasureBoxs() {
    let {
      showMeasures,
      dPix2cssRatio,
      onRenderMeasures,
    } = this.context;
    if (!showMeasures) {
      return null;
    }
    let measureBoxs = this.state.measureBoxs;
    let mappedMeasureBoxs = [];
    let axis = this.getAxis();
    measureBoxs.forEach(box => {
      let lineIndex = this._getTopItemLineIndex();
      if (isNaN(lineIndex)) return;
      let boxLineIndex = box.lineIndex;
      if (isNaN(boxLineIndex) || boxLineIndex < lineIndex) return;

      if (!box.positionMapped) {
        box.top = box.top / dPix2cssRatio;
        delete box.left;
        box.positionMapped = true;
      }
      box.right = (boxLineIndex - lineIndex) / dPix2cssRatio + this._infinitePadding;
      mappedMeasureBoxs.push(box);
    });
    return (
      <div style={styles.measureBoxContainer} className="_measureBoxs">
        {mappedMeasureBoxs.map(box => <MeasureBox key={box.id} {...box} showMeasure={box.id === this.state.selectedBox } mode={MODE.TOGGLE_MEASURE} onRenderMeasures={onRenderMeasures} onBoxClick={this.onMeasureBoxClick}/>)}
      </div>
    );
  }

  renderTicks() {
    let {
      tickInterval,
      dPix2cssRatio,
    } = this.context;
    if (tickInterval) {
      // 根据top listitem的lineindex决定tick的值
      let lineIndex = this._getTopItemLineIndex();
      if (isNaN(lineIndex)) return;
      let tickIntervalCss = tickInterval / dPix2cssRatio;
      let startTickValue = Math.ceil(lineIndex / tickInterval) * tickInterval;
      let startTickCssValue = (startTickValue - lineIndex) / dPix2cssRatio + this._infinitePadding;
      let tickCount = Math.floor(this._visualItemCount * this._itemHeight / tickIntervalCss);
      let ticks = [];
      ticks.push({
        id: startTickValue,
        right: startTickCssValue,
        value: startTickValue,
      });
      for (let i = 1; i < tickCount; i++) {
        let lastTick = ticks[i - 1];
        let currentTickValue = lastTick.value + tickInterval;
        ticks.push({
          id: currentTickValue,
          right: lastTick.right + tickIntervalCss,
          value: currentTickValue,
        });
      }
      return (
        <div style={styles.tickContainer} className="_tickBox">
          {ticks.map(tick => <Tick key={tick.id} {...tick} />)}
        </div>
      );
    } else {
      return null;
    }
  }

  // list无限滚动需要知道list item的高度
  // 1. itemHeight可以由外部传入
  // 2. 当外部没有传入itemHeight时需要传入高宽比(itemHwRatio), 用于自动计算itemHeight
  renderItemHeightDetectorEl() {
    if (this._itemHeight) {
      return null;
    }
    return (
      <div style={styles.itemHeightDetector}
        ref={(el) => this._itemHeightDetectorEl = el}
      ></div>
    );
  }

  renderListItem(data, itemStyle) {
    let key = data.id;
    return <this.props.itemClazz key={key} {...data} style={itemStyle}
      rotate={this.props.rotate}/>;
  }

  renderMeasureBox() {
    return <EditLayer scale={this.state.scale}/>;
  }

  renderListItems() {
    let {
      data,
      style,
      direction,
    } = this.props;
    let itemHeight = this._itemHeight;
    let items = this._listItems;
    let itemCount = this._currentScrollItemCount;
    let topItemIdx = this.state.topItemDataIdx;
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
          this._listItemData.pop();
        }
        let dataIdx = topItemIdx + i;
        let itemData = data.getDataAt(dataIdx);
        if (itemData) {
          items.unshift(this.renderListItem(itemData, itemStyle));
          this._listItemData.unshift(itemData);
        }
      }
    } else if (this._sDirection === S_DIRECTION.DOWN) {
      this._paddingStyle[heightName] += itemCount * itemHeight;
      for (let i = 0; i < itemCount; i++) {
        // 当items的数量超过最大数量时才删除
        if (items.length >= itemLength) {
          items.shift();
          this._listItemData.shift();
        }
        let dataIdx = topItemIdx + i + itemLength - itemCount;
        let itemData = data.getDataAt(dataIdx);

        if (itemData) {
          items.push(this.renderListItem(itemData, itemStyle));
          this._listItemData.push(itemData);
        }
      }
    } else {
      this._listItems = items = [];
      this._listItemData = [];
      if (this._overflowRender) {
        this._paddingStyle[heightName] = this._initPadding[axis];
        this._overflowRender = false;
      }
      for(let i = 0; i < renderItemCount; i++) {
        let dataIdx = topItemIdx + i;
        // 考虑store数据被截断的case
        let itemData = data.getDataAt(dataIdx) || {id: Math.random()};
        items.push(this.renderListItem(itemData, itemStyle));
        this._listItemData.push(itemData);
      }
    }
    this._sDirection = null;

    let contentStyle = Object.assign({}, style);
    contentStyle[heightName] = itemHeight * data.size() + this._initPadding[axis];
    let holderStyle = {};
    holderStyle[heightName] = this._infinitePadding = this._paddingStyle[heightName];

    return (
      <div className='_list' style={contentStyle}
        ref={(el) => { this.el = el; }} >
        <div style={holderStyle}></div>
        {this.renderItemHeightDetectorEl()}
        {this.renderMeasureBoxs()}
        {this.renderTicks()}
        {items}
      </div>
    );
  }

  render() {
    return <Scroller style={styles.scroller}
      ref={(scroller) => {this._scroller = scroller;}}
      direction={this.props.direction}
      useCssTransition={false}
      showIndicator={false}
      rtl={this.props.rtl} >
      {this.renderListItems()}
    </Scroller>
  }

  componentWillMount() {
    let store = this._store = this.props.data;
    this._dataLn = this.getDataSize(store);
    store.on('reset', this.onDataReset);
    store.on('dataoverflow', this.onDataOverflow);
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
    
    if (!this._scroller) { console.error('List::componentDidMount _scroller undefined!') }

    this._scroller.on('scroll', this.onScroll.bind(this));
    let resize = this._scroller._resize;
    this._scroller._resize = () => {
      this._calcVisualItemCount(this.props.height, this._itemHeight);
      resize();
    }
    // 第一次render时可能需要识别itemHeight, 这里立即第二次render可以保证宽度正常
    // 主要解决组件初始化后立即调用scrollTo方法
    this._rafIds.push(requestAnimationFrame(() => {
      if (this._scroller) {
        this.forceUpdate();
        this._scroller._refreshPosition();
        this._didMount = true;
        this.scrollTo(this._initPosition.x, this._initPosition.y);

        this.onConsumeProcess();
      }
    }));
  }

  componentWillUnmount() {
    this._rafIds.forEach(rafId => cancelAnimationFrame(rafId));
    clearTimeout(this._consumeDetectId);
    let store = this._store;
    if (store) {
      store.removeListener('reset', this.onDataReset);
      store.removeListener('dataoverflow', this.onDataOverflow);
    }
  }

  doConsumeDetect() {
    let lastRemainScroll = this._lastRemainScroll;
    let remainScroll = this._getRemainScroll();
    let diff = Math.abs(remainScroll - lastRemainScroll);
    if (remainScroll - lastRemainScroll > 0) {
      this.props.onBlock();
    } else {
      this.props.onDrain();
    }
    this._lastRemainScroll = remainScroll;
    this._consumeDetectId = setTimeout(() => {
      this.doConsumeDetect();
    }, CONSOME_DETECT_TIMEOUT);
  }

  // 取得list第一个item的lineIndex, 用来给其他元素定位做参考(tick/measurebox)
  _getTopItemLineIndex() {
    let topItemData = this._listItemData && this._listItemData[0];
    if (!topItemData) return;
    return topItemData.lineIndex;
  }

  _getRemainScroll() {
    let px = this.getPosition().x;
    let mpx = this.getMinPosition().x;
    return Math.abs(px - mpx);
  }

  _rePositionAfterDataRemove(removeCount) {
    let store = this.props.data;
    store.setMin(0);
    this.setState({ topItemDataIdx: 0 });
    this._overflowRender = true;
    let position = this.getPosition()[this.getAxis()];
    this._scroller && this._scroller.scrollTo(position + removeCount * this._itemHeight, 0);
  }

  onDataReset(removeCountBeforeScreen) {
    this._rePositionAfterDataRemove(removeCountBeforeScreen);
  }

  onDataOverflow(removeCount) {
    this._rePositionAfterDataRemove(removeCount);
  }

  /*
   * 通知外部组件当前数据的消费情况
   * TODO: 垂直方向的考虑
   */
  onConsumeProcess() {
    if (this.props.consumeNotification) {
      this._consumeDetectId = setTimeout(() => {
        this.doConsumeDetect();
      }, CONSOME_DETECT_TIMEOUT);
    }
  }

  onScroll(scroller, position) {
    let topPosition = this._getTopPosition(position);
    let itemIdx = this._positionMap.findIndex(topPosition);
    let maxIndex = this.props.data.size() - this._listItems.length;
    itemIdx = Math.min(itemIdx, maxIndex);
    this.props.data.setMin(itemIdx);
    if (itemIdx !== this.state.topItemDataIdx) {
      if (this.state.topItemDataIdx > itemIdx) {
        this._sDirection = S_DIRECTION.UP;
        this._currentScrollItemCount = this.state.topItemDataIdx - itemIdx;
      } else {
        this._sDirection = S_DIRECTION.DOWN;
        this._currentScrollItemCount = itemIdx - this.state.topItemDataIdx;
      }
      this.setState({ topItemDataIdx: itemIdx });
      // this.forceUpdate();
    } else {
      this._currentScrollItemCount = 0;
    }
  }

  _getTopPosition(position) {
    let axis = this.getAxis();
    let dis = this.props.rtl ? -position[axis] : position[axis];
    return dis - this._initPadding[axis];
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
      count: size,
    });
  }

  _calcItemHeight() {
    let {
      itemHwRatio,
      itemHeight,
      direction,
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
      height = Math.max(window.innerWidth, window.innerHeight);
    }
    this._visualItemCount =  Math.max(this._visualItemCount, Math.ceil(height / itemHeight) + 2);
    let store = this.props.data;
    if (store) {
      // FIXME ugly
      store.__inScreenDataNum = this._visualItemCount;
      store.setRemainDataLnWhenReset(this._visualItemCount);
    }
  }

  _mapPropsMeasureboxToState(nextProps) {
    let size = this.getDataSize(nextProps.data);
    let nextMeasureBoxs = nextProps.data.getMeasureBoxs() || [];
    let mergeMeasureBox = [];
    nextMeasureBoxs.forEach(box => {
      let find = this.state.measureBoxs.find(thisBox => (thisBox.id === box.id));
      if (!find) {
        mergeMeasureBox.push(box);
      } else {
        // 这里还有可能是box数据更新.
        mergeMeasureBox.push(box);
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

  getMaxPosition() {
    if (this._scroller) {
      return this._scroller.getMaxPosition();
    } else {
      return {
        x: 0,
        y: 0,
      }
    }
  }

  getMinPosition() {
    if (this._scroller) {
      return this._scroller.getMinPosition();
    } else {
      return {
        x: 0,
        y: 0,
      }
    }
  }

  getContainerSize() {
    if (this._scroller) {
      return this._scroller.getContainerSize();
    } else {
      return {
        x: 0,
        y: 0,
      }
    }
  }

  scrollTo(x, y) {
    if (this._didMount) {
      if (!this._scroller) { console.error('List::componentDidMount _scroller undefined!') }
      this._scroller.scrollTo(x, y);
    } else {
      this._initPosition = {x: x, y: y};
    }
  }

  scrollToMiddle() {
    let minPosition = this.getMinPosition();
    let scrollX = minPosition.x / 2;
    this.scrollTo(scrollX, 0);
  }
}

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
    // return this.binarySearch(this._map, y);
    return this.fixSearch(this._map, y, this._height);
  }
  fixSearch(arr, value, height) {
    let idx = 0;
    let ln = arr.length;
    if (ln <= 0) return 0;
    if (value < 0) return 0;
    idx = Math.floor(value / height);
    return Math.min(ln - 1, idx);
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
    width: '100%',
  },
  itemHeightDetector: {
    position: 'absolute',
    top: 0,
  },
  measureBoxContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 10,
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 10,
  },
};
