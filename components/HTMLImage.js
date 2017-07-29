import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class HTMLImage extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    src: PropTypes.string.isRequired,
  };

  render() {
    const {
      src,
      width = 'auto',
      height = 'auto',
    } = this.props;

    let style = {
      maxWidth: width,
      maxHeight: height,
    };

    // console.time("drawspend");
    // 0.017ms 图片大多重复，可能缓存导致的?
    let img = <img src={src} style={style} / >
    // console.timeEnd("drawspend");

    return img;
  }
}
