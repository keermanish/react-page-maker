import React, { Component } from 'react';
import PropTypes from 'prop-types';

import core from '../../core/core';

class Trash extends Component {
  constructor(props) {
    super(props);

    // create refrence for trash
    // to check whether is dragging on trash box or not
    this.trashRef = React.createRef();
  }

  /**
   * function to toggle/manage class(inside)
   * class gets appended to canvas
   * @param target {DOM} - current canvas upon which use is hovering
   * @param action {String} - add/remove - name of action
   */
  _manageInsideClass = ({ target }, action) => {
    if (this.trashRef.current === target) {
      target.classList[action]('inside');
    }
  }

  _onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // get dragged element
    const elementToBeTrashed = core.getDraggedElement();

    // dont allow elements which directly coming from palette
    if (!elementToBeTrashed) {
      return false;
    }

    const { onBeforeTrash, onAfterTrash } = this.props;
    const { removeElement } = elementToBeTrashed;
    const status = onBeforeTrash(elementToBeTrashed);

    this._manageInsideClass(e, 'remove');

    // user tried and confirm to remove element
    if (status && core.getAttemptToRemove()) {
      // remove element from current canvas
      removeElement(elementToBeTrashed.elementID, () => {
        // acknowledge
        onAfterTrash();
      });

      // done dragging, flush the dragged element
      core.setDraggedElement(null);
    }

    // reset attempt to remove
    core.setAttemptToRemove(false);

    return true;
  }

  // user is dragging over the trash
  // `preventDefault` - Required. Allows us to drop.
  // @param e {event}
  _onDragOver = (e) => {
    e.preventDefault();
  }

  /**
   * user is leaving the trash
   * @param e {event}
   */
  _onDragLeave = (e) => {
    this._manageInsideClass(e, 'remove');
  }

  /**
   * user is dragging over trash
   * @param e {event}
   */
  _onDragEnter = (e) => {
    const elementToBeTrashed = core.getDraggedElement();

    if (elementToBeTrashed) {
      this._manageInsideClass(e, 'add');
    }
  }

  render() {
    return (
      <div
        ref={this.trashRef}
        className="trash-box"
        onDragLeave={this._onDragLeave}
        onDragEnter={this._onDragEnter}
        onDragOver={this._onDragOver}
        onDrop={this._onDrop}
      >
        { this.props.children || <span>Trash Box</span> }
      </div>
    );
  }
}

Trash.propTypes = {
  onBeforeTrash: PropTypes.func,
  onAfterTrash: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
};

Trash.defaultProps = {
  onBeforeTrash: () => (true),
  onAfterTrash: () => (true)
};

export default Trash;
