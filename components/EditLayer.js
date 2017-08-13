import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import MeasureBox from './MeasureBox';

const styles = {
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    cursor: 'pointer',
  }
};

export default class EditLayer extends Component {

  static propTypes = {
    onMeasure: PropTypes.func,
  };

  onTouchStart(evt) {
    this._sp = this._getPosition(evt);
  }
  onTouchMove(evt) {
    this._mp = this._getPosition(evt);
    this.forceUpdate();
  }
  onTouchEnd(evt) {
    if (this.props.onMeasure && this._measureBox) {
      this.props.onMeasure(this._measureBox);
    }
    this._sp = this._mp = null;
    this.forceUpdate();
  }
  _getPosition(evt) {
    let position = {
      x: 0,
      y: 0,
    };

    let touches = evt.changedTouches;
    if(touches) {
      let touch = touches[0];
      position.x = touch.pageX;
      position.y = touch.pageY;
    } else {
      position.x = evt.pageX;
      position.y = evt.pageY;
    }
    return position;
  }
  renderRect() {
    let p1 = this._sp;
    let p2 = this._mp;
    if (p1 && p2) {
      let style = {
        position: 'absolute',
        width: Math.abs(p2.x - p1.x),
        height: Math.abs(p2.y - p1.y),
        left: Math.min(p2.x, p1.x),
        top: Math.min(p2.y, p1.y),
        border: '1px dashed #fff',
      }
      return <div style={style}></div>
    } else {
      return null;
    }
  }
  renderMeasure() {
    let p1 = this._sp;
    let p2 = this._mp;
    let scale = this.props.scale || 1;
    if (p1 && p2) {
      let w = Math.abs(p2.x - p1.x);
      w = (w / scale).toFixed(0);
      let h = Math.abs(p2.y - p1.y);
      h = (h / scale).toFixed(0);
      let style = {
        position: 'absolute',
        left: Math.max(p2.x, p1.x) + 5,
        top: Math.min(p2.y, p1.y) - 20,
        color: '#fff',
        background: '#68af02',
        padding: '3px 24px',
      };
      let text = `w:${w} h:${h}`;
      return <p style={style}>{text}</p>
    } else {
      return null;
    }
  }
  renderMeasureBox() {
    let p1 = this._sp;
    let p2 = this._mp;
    if (p1 && p2) {
      let scale = this.props.scale || 1;
      let w = Math.abs(p2.x - p1.x);
      w = (w / scale).toFixed(0);
      let h = Math.abs(p2.y - p1.y);
      h = (h / scale).toFixed(0);
      let layout = this._measureBox = {
        top: Math.min(p2.y, p1.y),
        left: Math.min(p2.x, p1.x),
        width: Number(w),
        height: Number(h),
      }
      return <MeasureBox {...layout} />
    }
    return null;
  }
  render() {
    return (
      <div style={styles.layer}
        ref={(el) => { this.el = el; }}
        onTouchStart={this.onTouchStart.bind(this)}
        onMouseDown={this.onTouchStart.bind(this)}
        onTouchMove={this.onTouchMove.bind(this)}
        onMouseMove={this.onTouchMove.bind(this)}
        onTouchEnd={this.onTouchEnd.bind(this)}
        onMouseUp={this.onTouchEnd.bind(this)}
        onTouchCancel={this.onTouchEnd.bind(this)}>
        {this.renderMeasureBox()}
      </div>
    )
  }
}
