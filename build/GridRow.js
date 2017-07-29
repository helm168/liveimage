'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DIRECTION = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const styles = {
  hbox: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center'
  },
  vbox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
};

const DIRECTION = exports.DIRECTION = {
  ROW: 'h',
  COLUMN: 'v'
};

class GridRow extends _react.Component {

  renderCells() {
    let {
      columns
    } = this.props;

    return columns.map((column, idx) => _react2.default.createElement(this.props.cellClazz, _extends({ key: idx }, column)));
  }

  render() {
    let style = this.props.direction === DIRECTION.ROW ? styles.hbox : styles.vbox;
    return _react2.default.createElement(
      'div',
      { style: style },
      this.renderCells()
    );
  }
}
exports.default = GridRow;
GridRow.propTypes = {
  columns: _propTypes2.default.array.isRequired,
  cellClazz: _propTypes2.default.func.isRequired,
  direction: _propTypes2.default.string
};
GridRow.defaultProps = {
  direction: DIRECTION.ROW
};