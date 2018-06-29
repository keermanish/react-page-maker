import React, { Component } from 'react';
import PropTypes from 'prop-types';

import core from '../../core/core';

class Draggable extends Component {
  constructor(props) {
    super(props);

    this.dragElemRef = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    // update the state once parent state initialisation is done
    if (this.props.initDone !== nextProps.initDone && nextProps.initDone) {
      this.props.updateState();
    }
  }

  _dragEnd = (e) => {
    e.stopPropagation();

    this.dragElemRef.current.classList.remove('before', 'after');

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

  /**
   * function to set drop position.
   * first fine mid of element upon which user is dragging over and
   * based on that decide whether user trying to drop an element above or below
   */
  _onDragOver = (e) => {
    const elemCord = this.dragElemRef.current.getBoundingClientRect();
    const dragElemY = e.clientY;

    if (dragElemY >= elemCord.y && dragElemY <= elemCord.y + elemCord.height) {
      const midY = elemCord.y + elemCord.height / 2;
      if (dragElemY < midY) {
        this.dragElemRef.current.classList.remove('after');
        this.dragElemRef.current.classList.add('before');
        core.setDropPostion(this.props.index);
      } else {
        this.dragElemRef.current.classList.remove('before');
        this.dragElemRef.current.classList.add('after');
        core.setDropPostion(this.props.index + 1);
      }
    }
  }

  _onDragLeave = () => {
    // remove before/after class from dragged element
    this.dragElemRef.current.classList.remove('before', 'after');
  }

  render() {
    const { elementProps } = this.props;
    let e = null;

    if (this.props.dropzoneID) {
      // add this required function only if element is dropped in canvas
      e = {
        onDragOver: this._onDragOver,
        onDragLeave: this._onDragLeave
      };
    }

    return (
      <div
        ref={this.dragElemRef}
        className="drag-item"
        onDragStart={this._dragStart}
        onDragEnd={this._dragEnd}
        draggable
        {...elementProps}
        {...e}
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
  index: PropTypes.number,
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
