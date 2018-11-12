import React from 'react';
import PropTypes from 'prop-types';

import core from '../../core/core';
import state from '../../core/state';

class Preview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentState: state.getState()
    };

    this.registeredPaletteElements = core.getRegisteredPaletteElements();
    state.addEventListener(this._onStateChange);
  }

  // keep track of state tree changes
  _onStateChange = (newState) => {
    this.setState({
      currentState: newState
    });
  }

  /**
   * recuresive function to iterate through all node of state tree and
   * render approprate component and pass necessary props
   * @param element {Object} - infomation of state tree node
   * @returns {JSX} - Preview/JSX representation of current state tree
   */
  _renderElementInPreviewMode = (element) => {
    const children = {};
    const elementData = this.registeredPaletteElements
      .find(e => e.type === element.type);

    // element has sub fields, render those fields first
    // and then come back to current field
    if (Array.isArray(element.fields)) {
      element.fields.forEach((field) => {
        children[field.dropzoneID] = this._renderElementInPreviewMode(field);
      });
    }

    // render corresponding component and pass necessary props
    // showPreview is mandatory
    return (
      <elementData.component
        id={element.id}
        childNode={children}
        {...{ ...element, showPreview: true, showBasicContent: false }}
      />
    );
  }

  render() {
    const root = this.state.currentState[0];

    // if you want more flexiblity
    if (typeof this.props.children === 'function') {
      return this.props.children({
        children: root.fields.map(this._renderElementInPreviewMode)
      });
    }

    // standard render - only <Preview /> and done
    return (
      <div className="preview-container">
        {
          root.fields.map(this._renderElementInPreviewMode)
        }
      </div>
    );
  }
}

Preview.propTypes = {
  children: PropTypes.func
};

export default Preview;
