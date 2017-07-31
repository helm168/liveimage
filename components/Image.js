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
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    src: PropTypes.any.isRequired,
  };

  renderImg() {
    if (typeof src === 'string') {
      return <HTMLImage {...this.props} />
    } else if (this.props.webgl) {
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