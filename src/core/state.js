import rpmEvent from './event';

class State {
  constructor() {
    // all private varibale goes here
    const state = {};
    const shareableElementProps = ['id', 'type', 'name', 'payload', 'dropzoneID', 'parentID'];

    // set base
    state.tree = [{
      id: 'root',
      fields: []
    }];

    /**
     * private function to traverse through each node and update the corresponding node
     * @param {String} dropzoneID
     * @param {String} parentID
     * @param {Array} updatedFields - new fields/elements
     * @param {Array} fields - fields/elements of current canvas
     * @returns {Boolean}
     */
    const traverseAndUpdateTree = (dropzoneID, parentID, updatedFields, fields = state.tree) => {
      const matchedParentCanvas = fields.find(field => field.id === parentID);
      let returnStatus = false;

      // found element
      if (matchedParentCanvas) {
        if (dropzoneID === parentID) {
          // first time, create fields
          matchedParentCanvas.fields = updatedFields;
        } else if (!matchedParentCanvas.fields || !updatedFields.length) {
          // user tried to remove elements
          if (dropzoneID && matchedParentCanvas.fields) {
            matchedParentCanvas.fields = matchedParentCanvas.fields
              .filter(f => f.dropzoneID !== dropzoneID);
          } else {
            // matched canvas does not has such field, create one
            matchedParentCanvas.fields = updatedFields;
          }
        } else {
          const fieldsToBeAdded = [];

          // if user working on multi dropzone field
          const matchedDropzoneFields = matchedParentCanvas.fields
            .filter(f => f.dropzoneID === dropzoneID);

          if (matchedDropzoneFields.length !== updatedFields.length) {
            // some of the field got deleted from dropzone
            // replace all fields with new fields
            matchedParentCanvas.fields = updatedFields
              .concat(matchedParentCanvas.fields
                .filter(f => f.dropzoneID !== dropzoneID));
          } else {
            updatedFields.forEach((uField) => {
              const fieldIndex = matchedParentCanvas.fields
                .findIndex(f => f.id === uField.id);

              // user try to add new field
              if (fieldIndex === -1) {
                fieldsToBeAdded.push(uField);
              }
            });

            // no new fields
            if (!fieldsToBeAdded.length) {
              // either user has updated the field or changed the order
              matchedParentCanvas.fields = matchedParentCanvas.fields
                .map((f) => {
                  const uF = updatedFields.find(uf => uf.id === f.id);
                  return uF || f;
                });
            }
          }

          // add new field to existing array
          if (fieldsToBeAdded.length) {
            matchedParentCanvas.fields = matchedParentCanvas.fields.concat(fieldsToBeAdded);
          }
        }

        returnStatus = true;

        /* eslint no-else-return: 0 */
      } else {
        for (let i = 0; i < fields.length; i++) {
          const childFields = fields[i].fields;
          let status = false;

          // field has sub-fields, check inside sub-fields
          if (childFields) {
            status = traverseAndUpdateTree(dropzoneID, parentID, updatedFields, childFields);
          }

          if (status) {
            break;
          }
        }
      }

      return returnStatus;
    };

    /**
     * private function to traverse through each node and return the field parent
     * @param {String} dropzoneID
     * @param {String} parentID
     * @param {Array} fields - fields/elements of current canvas
     * @returns {Object} - Parent element
     */
    const traverseAndReturnParent = (dropzoneID, parentID, fields = state.tree) => {
      const foundParent = fields.find(element => element.id === parentID);

      if (!foundParent) {
        for (let i = 0; i < fields.length; i++) {
          const element = fields[i];
          if (element.fields) {
            const status = traverseAndReturnParent(dropzoneID, parentID, element.fields);
            if (status) {
              return status;
            }
          }
        }
      }

      return foundParent;
    };

    /**
     * private function to traverse through each node and return the corresponding element
     * @param {String} elementID
     * @param {String} dropzoneID
     * @param {String} parentID
     * @returns {Field/Object}
     */
    const traverseAndReturnElement = (elementID, dropzoneID, parentID) => {
      const fieldParent = traverseAndReturnParent(dropzoneID, parentID);
      if (fieldParent) {
        return fieldParent.fields.find(field => field.id === elementID);
      }

      return null;
    };

    /**
     * private function to remove the field
     * @param {String} elementID
     * @param {String} dropzoneID
     * @param {String} parentID
     * @param {Function} cb
     * @returns {Boolean}
     */
    const removeElement = (elementID, dropzoneID, parentID, cb) => {
      const element = traverseAndReturnElement(elementID, dropzoneID, parentID);

      if (element) {
        element.removeElement(elementID, cb);
        rpmEvent.notifyElementRemove({
          elementID, dropzoneID, parentID, trashed: false
        });
        return true;
      }

      return false;
    };

    /**
     * function to filter out sensitive information from element
     * @param {Object} element
     * @param {Boolean} onlyRemoveFunctions - in-case of `getStorableState` result we only
     * need to filter out functions and in other cases we will filter out other props also
     * based on `shareableElementProps`
     * @returns {Boolean}
     */
    const removeSensitiveProps = (element, onlyRemoveFunctions) => {
      const shareableElement = {};

      if (!element) {
        return null;
      }

      // remove all private/functinal properties
      Object.keys(element).forEach((key) => {
        if (
          typeof element[key] !== 'function' &&
          (
            onlyRemoveFunctions ||
            !onlyRemoveFunctions && shareableElementProps.indexOf(key) !== -1
          )
        ) {
          shareableElement[key] = element[key];
        }
      });

      return shareableElement;
    };

    // function to return element, filter sensitive props before return
    const getElement = (...args) => removeSensitiveProps(traverseAndReturnElement(...args));

    /**
     * private function to update the exisiting field
     * @param {String} elementID
     * @param {String} dropzoneID
     * @param {String} parentID
     * @param {Element/Object} newData - { id, type, name, payload }
     * @param {Function} cb
     * @returns {Boolean}
     */
    const updateElement = (elementID, dropzoneID, parentID, newData, cb) => {
      const element = traverseAndReturnElement(elementID, dropzoneID, parentID);

      if (element) {
        element.updateElement({
          ...newData,
          id: elementID
        }, cb);

        rpmEvent.notifyElementUpdate(getElement(elementID, dropzoneID, parentID));

        return true;
      }

      return false;
    };

    // function to traverse through all node
    // remove all private/functional properties
    // and return flat object for each node
    const traverseAndTakeSnapshot = (element) => {
      const subFields = [];
      // remove all functinal properties
      const necessaryDetails = removeSensitiveProps(element, true);

      // check for sub fields and perform same operations recursively
      if (element.fields && element.fields.length) {
        element.fields.forEach((f) => {
          subFields.push(traverseAndTakeSnapshot(f));
        });
      }

      // if append initialElements and updated fields
      if (subFields.length) {
        necessaryDetails.initialElements = [];
        necessaryDetails.fields = [];

        subFields.forEach((sf) => {
          necessaryDetails.initialElements.push(sf);
          necessaryDetails.fields.push(sf);
        });
      }

      // return flat object which represent current node in tree
      return necessaryDetails;
    };

    // function to update the state
    // once update is done then triggers CB and notifyStateChange
    this.updateState = (dropzoneID, parentID, fields, cb = () => {}, dispatchElementRemove) => {
      traverseAndUpdateTree(dropzoneID, parentID, fields);
      cb(state.tree);
      rpmEvent.notifyStateChange();

      // dispatch elementRemove event if necessary
      if (dispatchElementRemove) {
        rpmEvent.notifyElementRemove({
          dropzoneID,
          parentID,
          dispatchElementRemove,
          // just to distinguish whether field removed from `removeField` API or trash component
          trashed: true
        });
      }
    };

    // function to return element parent
    this.getElementParent = traverseAndReturnParent;

    // function to return element
    this.getElement = getElement;

    // function to remove element
    this.removeElement = removeElement;

    // function to update element
    this.updateElement = updateElement;

    /**
     * function to return current state of tree (as is)
     * keeping this function to give backward compatibility
     * @param {Object} - state tree
     */
    this.getState = () => (state.tree);

    /**
     * function to return storable current state
     * this function does same job as getState only it make sure
     * returned data is in proper format and unecessary properties removed
     * @param {Object} - state tree
     */
    this.getStorableState = () => (state.tree[0].fields
      .map(f => traverseAndTakeSnapshot(f)));

    /**
     * function to clear the state
     * loop though all parent(end level) nodes, and call `flushDroppedElements` function
     * so that component as well as application state gets flushed
     */
    this.clearState = (cb = () => {}) => {
      const rootNode = state.tree[0];
      const topLevelFields = rootNode.fields.length;

      // canvas is empty, just notify other
      if (!rootNode.fields.length) {
        rpmEvent.notifyStateFlush();
        cb();
      }

      rootNode.fields.forEach((topLevelElement, i) => {
        topLevelElement.flushDroppedElements(() => {
          if (i === topLevelFields - 1) {
            rpmEvent.notifyStateFlush(true);
            cb();
          }
        });
      });

      return true;
    };

    /**
     * function to add event
     * @param {String} eventName
     * @param {function} cb - callback
     */
    this.addEventListener = rpmEvent.addEventListener;

    /**
     * function to remove event
     * @param {String} eventName
     * @param {function} cb - callback
     */
    this.removeEventListener = rpmEvent.removeEventListener;
  }
}

const state = new State();

export default state;
