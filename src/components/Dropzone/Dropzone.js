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

  

	findFields( fields ){
		for (let i = 0; i < fields.length; i++) {
			const element = fields[i];
			if (element.id==this.props.parentID) {
		
				return element.initialElements
			}
			else if (  element.initialElements && element.initialElements.length>0  ) {
				this.findFields(  element.fields  )
			}		
		}
		return false
	}


	componentWillMount() {	
		 this._setInitialElements(this.props.initialElements);
		 
		 state.addEventListener("change", (newState) => {
			 const currentState =  state.getStorableState()
			 const fields = this.findFields( currentState )
			 
			 if (fields) {
				this.setState({
					droppedElements:fields
				 })
			 }
		
		  });
	}

  componentWillReceiveProps({ initialElements }) {
    this._setInitialElements(initialElements);
  }

  /**
   * function to allow manual element update
   * Note - function is only accessible through ref and make sure
   * valid data is pass through else application state/hierarchy can break
   * @param data {Array/Function} - if its function then make sure you are
   * returning valida array
   * @param done {function} - success call back function
   */
  dangerouslySetElements = (data, done) => {
    let elements = [];
    if (typeof data === 'function') {
      elements = data(this.state.droppedElements) || [];
    } else {
      elements = data;
    }
    const { id: dropzoneID, parentID } = this.props;

    elements = elements.map(e => ({
      ...e,
      dropzoneID,
      parentID,
      showBasicContent: false,
      updateState: this._updateState,
      removeElement: this._removeElement,
      updateElement: this._updateElement,
      flushDroppedElements: this._flushDroppedElements,
      checkAndRemoveElement: this._checkAndRemoveElement
    }));

    this.setState({
      initialElements: elements,
      droppedElements: elements
    }, () => this._updateState(done));
  }

  /**
   * function to remove before/after class form all canvas elements
   */
  _unmarkDragElements = () => {
    [].forEach.call(this.canvasRef.current.querySelectorAll('.drag-item'), e => e.classList.remove('before', 'after'));
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
                            !this.state.initDone &&
                            !this.state.initialElements.length;

    // for first time add initialElements to droppedElements
    if (gotInitialItems) {
      const { id: dropzoneID, parentID } = this.props;
      const updatedInitialItems = initialElements.map(e => ({
        ...e,
        key: e.id,
        dropzoneID,
        parentID,
        showBasicContent: false,
        updateState: this._updateState,
        removeElement: this._removeElement,
        updateElement: this._updateElement,
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
   * @param cb - {function}
   * @param dispatchElementRemove {Boolean} - trigger `removeElement` event if its true
   */
  _removeElement = (elementID, cb = () => {}, dispatchElementRemove) => {
    const index = this.state.droppedElements.findIndex(e => e.id === elementID);

    this.setState({
      droppedElements: this.state.droppedElements.filter((d, i) => (i !== index))
    }, () => this._updateState(cb, dispatchElementRemove ? elementID : null));
  }

  /**
   * function to update element from droppedElements
   * @param newData - {element} - { id, name, type, payload }
   * @param cb - {function}
   */
  _updateElement = (newData, cb = () => {}) => {
    const elementIndex = this.state.droppedElements.findIndex(e => e.id === newData.id);

    if (elementIndex === -1) {
      return cb(null);
    }

    // support is limited to below keys only, to avoid possible breaks
    const supportedKeys = ['name', 'type', 'payload'];
    const newElementData = {};
    Object.keys(newData)
      .forEach((key) => {
        if (supportedKeys.indexOf(key) !== -1) {
          newElementData[key] = newData[key];
        }
      });

    this.setState({
      droppedElements: this.state.droppedElements
        .map((e) => {
          if (e.id === newData.id) {
            return { ...e, ...newElementData };
          }

          return e;
        })
    }, () => this._updateState(cb));

    return true;
  }

  /**
   * function to update the application state (not component state)
   * function will further call `updateState` from state API, which updates the application state
   * @param cb {function} - callback function - optional
   */
  _updateState = (cb = () => {}, dispatchElementRemove) => {
    const {
      id: dropzoneID,
      parentID
    } = this.props;

    state.updateState(
      dropzoneID,
      parentID,
      this.state.droppedElements,
      cb,
      dispatchElementRemove
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
      initialElements: [],
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
    e.stopPropagation();
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
    const { droppedElements } = this.state;

    core.setAttemptToRemove(false);
    this._manageInsideClass(e, 'remove');

    const { onDrop } = this.props;
    let data = JSON.parse(e.dataTransfer.getData('data'));
    data = { ...data };

    this._unmarkDragElements();

    return onDrop ? onDrop(data, this._addElement, {
      dropIndex: !droppedElements.length ? core.getDropPostion() + 1 : 0,
      currentElements: droppedElements
    }) : this._addElement(data);
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
      capacity,
      parentID,
      allowHorizontal
    } = this.props;
    const dropPosition = core.getDropPostion();
    const draggedElement = core.getDraggedElement();
    const invalidUpdatedData = !updatedData || !updatedData.id;
    let indexOfPresentElement = -1;
    const keyAlreadyPresent = updatedData.id &&
      this.state.droppedElements.filter((e, i) => {
        if (e.id === updatedData.id) {
          indexOfPresentElement = i;

          return true;
        }

        return false;
      }).length;
    const isSameIndex = indexOfPresentElement === dropPosition;
    let newElements = [].concat(this.state.droppedElements);
    let elementAlreadyRemoved = false;

    // check fo unique key
    if (invalidUpdatedData || keyAlreadyPresent) {
      if (isSameIndex) {
        return core.error('Duplicate or invalid ID');
      }

      elementAlreadyRemoved = true;
      newElements = newElements.map((e) => {
        if (e.id === updatedData.id) {
          return { ...e, remove: true };
        }
        return e;
      });
    }

    const elementToDrop = {
      ...updatedData,
      key: updatedData.id,
      dropzoneID,
      parentID,
      allowHorizontal,
      showBasicContent: false,
      updateState: this._updateState,
      removeElement: this._removeElement,
      updateElement: this._updateElement,
      // initialElements helps figuring out initDone
      initialElements: this.state.initialElements,
      flushDroppedElements: this._flushDroppedElements,
      checkAndRemoveElement: this._checkAndRemoveElement
    };

    if (dropPosition > 0) {
      newElements = [
        ...newElements.slice(0, dropPosition),
        elementToDrop,
        ...newElements.slice(dropPosition)
      ];
    } else {
      newElements = [
        elementToDrop,
        ...newElements
      ];
    }

    if (!isSameIndex) {
      newElements = newElements.filter(e => !e.remove);
    }

    // check new list against max-capacity
    if (capacity && newElements.length > capacity) {
      return core.error(`Maximum capacity of canvas(${dropzoneID}) is ${capacity}`);
    }

    // update the current list
    this.setState({
      droppedElements: newElements
    }, () => {
      // remove element from previous canvas
      if (!elementAlreadyRemoved && draggedElement && typeof draggedElement.checkAndRemoveElement === 'function') {
        draggedElement.checkAndRemoveElement();
      }

      // update the application state
      this._updateState();
    });

    // adding dropping class to dropzone, it can be used for animation purpose
    this.canvasRef.current.classList.add('dropping');
    setTimeout(() => {
      this.canvasRef.current.classList.remove('dropping');
    }, 500);

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
    const spaceAvailable = capacity ? capacity > droppedElements.length : true;

    return (
      <div
        ref={this.canvasRef}
        className={`${!spaceAvailable ? 'no-space' : ''} ${id === 'root' ? 'canvas' : ''} ${!droppedElements.length ? 'empty' : ''} dropzone`}
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
              spaceAvailable,
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
  allowHorizontal: PropTypes.bool,
  initialElements: PropTypes.arrayOf(Object),
  parentID: PropTypes.string.isRequired,
  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ])
};

Dropzone.defaultProps = {
  initialElements: [],
  placeholder: 'Drop Here',
  onElementMove: () => (true)
};

export default Dropzone;
