import React, { Component } from 'react';
import PropTypes from 'prop-types';

import core from '../../core/core';

class Draggable extends Component {
  componentWillReceiveProps(nextProps) {
    // update the state once parent state initialisation is done
    if (this.props.initDone !== nextProps.initDone && nextProps.initDone) {
      this.props.updateState();
    }
  }

  _dragEnd = (e) => {
    e.stopPropagation();

    // done dragging, reset dragged element
    core.setDraggedElement(null);
  }

  _dragStart = (e) => {
    e.stopPropagation();

    const {
      id,
      type,
      name,
      payload,
      dropzoneID,
      removeElement,
      checkAndRemoveElement
    } = this.props;

    const data = {
      id,
      type,
      name,
      payload
    };

    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('data', JSON.stringify(data)); // required, we cann't pass JS object

    // if element is already present in some canvas
    // then set draggedElement, so that this will help to remove the element from previous canvas
    if (dropzoneID) {
      core.setDraggedElement({
        elementID: id,
        dropzoneID,
        removeElement,
        checkAndRemoveElement
      });
    }
  }

  render() {
    const { elementProps } = this.props;

    return (
      <div
        className="drag-item"
        onDragStart={this._dragStart}
        onDragEnd={this._dragEnd}
        draggable
        {...elementProps}
      >
        {
          this.props.children
        }
      </div>
    );
  }
}

Draggable.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  initDone: PropTypes.bool,
  updateState: PropTypes.func,
  dropzoneID: PropTypes.string,
  payload: PropTypes.instanceOf(Object),
  elementProps: PropTypes.instanceOf(Object),
  type: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]).isRequired,
  removeElement: PropTypes.func,
  checkAndRemoveElement: PropTypes.func
};

Draggable.defaultProps = {
  checkAndRemoveElement: () => (true),
  elementProps: null,
  payload: null,
  updateState: () => (true)
};

export default Draggable;
