import React, { Component } from 'react';
import PropTypes from 'prop-types';

const styles = {
  hbox: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  vbox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
};

export const DIRECTION = {
  ROW: 'h',
  COLUMN: 'v',
};

export default class GridRow extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    cellClazz: PropTypes.func.isRequired,
    direction: PropTypes.string,
  };

  static defaultProps = {
    direction: DIRECTION.ROW,
  };

  renderCells() {
    let {
      columns,
    } = this.props;

    return columns.map((column, idx) => <this.props.cellClazz key={idx} {...column} />)
  }

  render() {
    let style = this.props.direction === DIRECTION.ROW ?
      styles.hbox : styles.vbox;
    return <div style={style}>{this.renderCells()}</div>
  }
}
