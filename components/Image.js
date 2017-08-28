import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HTMLImage from './HTMLImage';
import CanvasImage from './CanvasImage';
import WebglImage from './WebglImage';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export default class Image extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    src: PropTypes.any,
  };
  static contextTypes = {
    webgl: PropTypes.bool,
  };
  renderImg() {
    let src = this.props.src;
    if (!src) {
      return null;
    } else if (typeof src === 'string') {
      return <HTMLImage {...this.props} />
    } else if (this.context.webgl) {
      return <WebglImage {...this.props} />
    }
    return <CanvasImage {...this.props} />
  }

  render() {
    let style = Object.assign({}, styles.wrapper, this.props.style);
    return (
      <div style={style}>
        {this.renderImg()}
      </div>
    );
  }
}
