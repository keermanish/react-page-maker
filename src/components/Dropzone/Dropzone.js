import React, { Component } from 'react';
import PropTypes from 'prop-types';

import state from '../../core/state';
import core from '../../core/core';

class Dropzone extends Component {
  constructor(props) {
    super(props);

    // create refrence for canvas
    // to check whether is dragging on current canvas or not
    this.canvasRef = React.createRef();

    // component state
    // initialElements - to keep track of initial elements
    // droppedElements - to keep track of newly added elements
    this.state = {
      initialElements: [],
      droppedElements: [],
      initDone: false
    };
  }

  componentWillMount() {
    this._setInitialElements(this.props.initialElements);
  }

  componentWillReceiveProps({ initialElements }) {
    this._setInitialElements(initialElements);
  }

  /**
   * function to set initial elements
   * @param initialElements {Array} - It holds all initial elements to be shown in canvas
   */
  _setInitialElements = (initialElements) => {
    // current component state(droppedElements) doesn't hold any elements
    // but initialElements has some element to be set
    const gotInitialItems = Array.isArray(initialElements) &&
                            initialElements.length &&
                            !this.state.initialElements.length;

    // for first time add initialElements to droppedElements
    if (gotInitialItems) {
      const { id: dropzoneID } = this.props;
      const updatedInitialItems = initialElements.map(e => ({
        ...e,
        key: e.id,
        dropzoneID,
        showBasicContent: false,
        updateState: this._updateState,
        removeElement: this._removeElement,
        flushDroppedElements: this._flushDroppedElements,
        checkAndRemoveElement: this._checkAndRemoveElement
      }));

      this.setState({
        initialElements: updatedInitialItems,
        droppedElements: updatedInitialItems
      }, () => (this._updateState(() => {
        this.setState({
          initDone: true
        });
      })));
    }
  }

  /**
   * function to toggle/manage class(inside)
   * class gets appended to canvas
   * @param target {DOM} - current canvas upon which use is hovering
   * @param action {String} - add/remove - name of action
   */
  _manageInsideClass = ({ target }, action) => {
    if (this.canvasRef.current === target) {
      target.classList[action]('inside');
    }
  }

  /**
   * function to remove element from droppedElements
   * @param elementID - {String} - ID of element
   */
  _removeElement = (elementID) => {
    const index = this.state.droppedElements.findIndex(e => e.id === elementID);

    this.setState({
      droppedElements: this.state.droppedElements.filter((d, i) => (i !== index))
    }, () => (this._updateState()));
  }

  /**
   * function to update the application state (not component state)
   * function will further call `updateState` from state API, which updates the application state
   * @param cb {function} - callback function - optional
   */
  _updateState = (cb = () => {}) => {
    const {
      id: dropzoneID,
      parentID
    } = this.props;

    state.updateState(
      dropzoneID,
      parentID,
      this.state.droppedElements,
      cb
    );
  }

  /**
   * function to flush the component state
   * once component state ths flushed, this will call `_updateState` to update the
   * application state
   * @param cb {function} - callback function - optional
   */
  _flushDroppedElements = (cb = () => {}) => {
    this.setState({
      droppedElements: []
    }, () => (this._updateState(cb)));
  }

  /**
   * function check below parameters
   * 1 - user's intend is to move element from one canvas to other
   * 2 - Get confirmation before remove
   * once both condition matched remove the element from current canvas
   */
  _checkAndRemoveElement = () => {
    const elementMoved = core.getDraggedElement();
    const { removeElement, elementID } = elementMoved;
    const status = this.props.onElementMove(elementMoved);
    const attemptToMove = !core.getAttemptToRemove();

    if (status && attemptToMove) {
      removeElement(elementID);
    }
  }

  // user is dragging over the canvas
  // `preventDefault` - Required. Allows us to drop.
  // @param e {event}
  _onDragOver = (e) => {
    e.preventDefault();
  }

  /**
   * user is leaving the canvas
   * @param e {event}
   */
  _onDragLeave = (e) => {
    this._manageInsideClass(e, 'remove');
    core.setAttemptToRemove(true);
  }

  /**
   * user is dragging over canvas
   * @param e {event}
   */
  _onDragEnter = (e) => {
    this._manageInsideClass(e, 'add');
    core.setAttemptToRemove(false);
  }

  /**
   * use has dropped the element into the canvas
   * perform all required checks
   * function also triggers `onDrop` prop so that uset can provide additional info
   * once all done `_addElement` get called with all required info
   * @param e {event}
   */
  _onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    core.setAttemptToRemove(false);
    this._manageInsideClass(e, 'remove');

    const { onDrop } = this.props;
    let data = JSON.parse(e.dataTransfer.getData('data'));
    data = { ...data };

    return onDrop ? onDrop(data, this._addElement) : this._addElement(data);
  }

  /**
   * function to add element into droppedElements
   * prior to add it perfom below check
   * 1 - element has unique key
   * 2 - element has invalid data
   * 3 - check against max-capacity
   * once element added remove the element from previous canvas
   * @param updatedData {Object} - element information
   * @returns Object - new list of canvas elements
   */
  _addElement = (updatedData) => {
    const {
      id: dropzoneID,
      capacity
    } = this.props;
    const draggedElement = core.getDraggedElement();
    const invalidUpdatedData = !updatedData || !updatedData.id;
    const keyAlreadyPresent = updatedData.id &&
      this.state.droppedElements.filter(e => e.id === updatedData.id).length;

    // check fo unique key
    if (invalidUpdatedData || keyAlreadyPresent) {
      return core.error('Duplicate or invalid ID');
    }

    // make new list
    const newElements = this.state.droppedElements.concat({
      ...updatedData,
      key: updatedData.id,
      dropzoneID,
      showBasicContent: false,
      updateState: this._updateState,
      removeElement: this._removeElement,
      flushDroppedElements: this._flushDroppedElements,
      checkAndRemoveElement: this._checkAndRemoveElement
    });

    // check new list against max-capacity
    if (capacity && newElements.length > capacity) {
      return core.error(`Maximum capacity of canvas(${dropzoneID}) is ${capacity}`);
    }

    // update the current list
    this.setState({
      droppedElements: newElements
    }, () => {
      // remove element from previous canvas
      if (draggedElement && typeof draggedElement.checkAndRemoveElement === 'function') {
        draggedElement.checkAndRemoveElement();
      }

      // update the application state
      this._updateState();
    });

    return {
      dropzoneID,
      elements: newElements
    };
  }

  /**
   * function to render the dragged element
   * @param props {Object} - An object which hold the info of dragged element/component
   * @returns JSX
   */
  _renderDragItem = (props) => {
    const element = core.getRegisteredPaletteElements().find(e => e.type === props.type);
    return element ? <element.component {...props} /> : null;
  }

  render() {
    const { droppedElements } = this.state;
    const { capacity, id, placeholder } = this.props;

    return (
      <div
        ref={this.canvasRef}
        className={`${capacity && capacity === droppedElements.length ? 'no-space' : ''} ${id === 'root' ? 'canvas' : ''} ${!droppedElements.length ? 'empty' : ''} dropzone`}
        onDragOver={this._onDragOver}
        onDragLeave={this._onDragLeave}
        onDragEnter={this._onDragEnter}
        onDrop={this._onDrop}
        onDragEnd={this._onDragEnd}
      >
        {
          droppedElements.map((e, i) => (
            this._renderDragItem({
              ...e,
              index: i,
              initDone: this.state.initDone,
              dropzoneProps: {
                initDone: this.state.initDone,
                parentID: e.id
              }
            })
          ))
        }

        {
          !droppedElements.length ?
            <p className="dropzone-placeholder">{placeholder}</p> : null
        }
      </div>
    );
  }
}

Dropzone.propTypes = {
  id: PropTypes.string.isRequired,
  capacity: PropTypes.number,
  onDrop: PropTypes.func,
  onElementMove: PropTypes.func,
  initialElements: PropTypes.arrayOf(Object),
  parentID: PropTypes.string.isRequired,
  placeholder: PropTypes.string
};

Dropzone.defaultProps = {
  initialElements: [],
  placeholder: 'Drop Here',
  onElementMove: () => (true)
};

export default Dropzone;
