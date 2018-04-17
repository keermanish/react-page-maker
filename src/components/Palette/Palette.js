import React, { Component } from 'react';
import PropTypes from 'prop-types';

import core from '../../core/core';

class Palette extends Component {
  /**
   * function to render the dragged element
   * @param props {Object} - An object which hold the info of dragged element/component
   * @returns JSX
   */
  _renderList = (props) => {
    const element = core.getRegisteredPaletteElements().find(e => e.type === props.type);
    return element ? <element.component {...props} /> : null;
  }

  render() {
    const { paletteElements } = this.props;

    return (
      <div className="palette">
        {
          paletteElements.map(item => (
            this._renderList({ ...item, key: item.id, showBasicContent: true })
          ))
        }
      </div>
    );
  }
}

Palette.propTypes = {
  paletteElements: PropTypes.arrayOf((propValue) => {
    let isError = false;

    // all palette elements should have unique ID
    propValue.forEach((item) => {
      if (item && !item.id) {
        isError = '`id` is required in all palette element';
      }

      if (propValue.filter(i => i.id === item.id).length > 1) {
        isError = '`id` of palette element should be unique';
      }
    });

    return isError ? new Error(isError) : true;
  })
};

Palette.defaultProps = {
  paletteElements: []
};

export default Palette;
