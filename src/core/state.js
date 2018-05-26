import core from './core';

class State {
  constructor() {
    // all private varibale goes here
    const state = {};
    const event = {
      change: []
    };

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
              } else {
                // user try to update existing field
                matchedParentCanvas.fields = matchedParentCanvas.fields
                  .map((f, i) => (i === fieldIndex ? uField : f));
              }
            });
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

    // private function to trigger all change CB
    const notifyStateChange = () => {
      // trigger all events
      event.change.forEach(e => e(state.tree));
    };

    // function to update state
    // once update done, triggers CB and notifyStateChange
    this.updateState = (dropzoneID, parentID, fields, cb = () => {}) => {
      traverseAndUpdateTree(dropzoneID, parentID, fields);
      cb(state.tree);
      notifyStateChange();
    };

    /**
     * function to return current state of tree
     * @param {Object} - state tree
     */
    this.getState = () => (state.tree);

    /**
     * function to clear the state
     * loop though all parent(end level) nodes, and call `flushDroppedElements` function
     * so that component as well as application state gets flushed
     */
    this.clearState = (cb = () => {}) => {
      const rootNode = state.tree[0];
      const topLevelFields = rootNode.fields.length;

      rootNode.fields.forEach((topLevelElement, i) => {
        topLevelElement.flushDroppedElements(() => {
          if (i === topLevelFields - 1) {
            notifyStateChange();
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
    this.addEventListener = (eventName, cb) => {
      let returnCB = null;

      if (typeof cb !== 'function') {
        core.error('`cb` param has to be function');
        return false;
      }

      if (Object.prototype.hasOwnProperty.call(event, eventName)) {
        event[eventName].push(cb);

        returnCB = cb;
      } else {
        core.error('No such event');
      }

      return returnCB;
    };

    /**
     * function to remove event
     * @param {String} eventName
     * @param {function} cb - callback
     */
    this.removeEventListener = (eventName, cb) => {
      if (Object.prototype.hasOwnProperty.call(event, eventName)) {
        event[eventName] = event[eventName].filter(e => e !== cb);
      } else {
        core.error('No such event');
      }
    };
  }
}

const state = new State();

export default state;
