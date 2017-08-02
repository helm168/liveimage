import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pool from './webglRenderPool';

const styles = {
  wrapper: {
    width: '100%',
    height: '100%',
  },
};

export default class WebglImage extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    src: PropTypes.object.isRequired,
  };

  render() {
    return <div style={styles.wrapper}
      ref={(el) => {this.wrapperEl = el;}}/ >
  }

  shouldComponentUpdate(nextProps) {
    if (!this._full) {
      this._full = this.props.src.full;
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    this._render.render(this.props.src);
  }

  componentDidMount() {
    this._full = this.props.src.full;
    this._render = pool.pop();
    if (!this._render) {
      this._render = new Render({
        image: this.props.src,
        rotate: this.props.rotate,
      });
    }
    this.wrapperEl.appendChild(this._render.getCanvasEl());
  }

  componentWillUnmount() {
    pool.push(this._render);
  }
}
