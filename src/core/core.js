class Core {
  constructor() {
    // main object/store
    const core = {};

    // all public getter/setter goes here

    /**
     * function to get attemptToRemove
     * @returns {Boolean} attemptToRemove
     */
    this.getAttemptToRemove = () => (core.attemptToRemove);

    /**
     * function to set user's attempt to remove the element
     * @param {Boolean} status
     */
    this.setAttemptToRemove = (status) => {
      core.attemptToRemove = status;
    };

    /**
     * function to set dragged element
     * @param {Object} draggedElement
     */
    this.setDraggedElement = (draggedElement) => {
      core.draggedElement = draggedElement;
    };

    /**
     * function to return dragged element
     * @returns {Object}
     */
    this.getDraggedElement = () => (core.draggedElement);

    /**
     * function to register palette elements
     * @param {Array} registeredPaletteElements - palette elements
     */
    this.registerPaletteElements = (registeredPaletteElements) => {
      core.registeredPaletteElements = registeredPaletteElements;
    };

    /**
     * function to return registered palette elements
     * @returns {Array} - array of palette elements
     */
    this.getRegisteredPaletteElements = () => (core.registeredPaletteElements || []);

    /**
     * function to set drop position
     * @param {Number} dropPosition
     */
    this.setDropPostion = (dropPosition) => {
      core.dropPosition = dropPosition;
    };

    /**
     * function to return drop position
     * @returns {Number}
     */
    this.getDropPostion = () => (core.dropPosition);

    /* eslint no-console:0 */

    /**
     * function to give an error message
     * @param {String} message - any message to be print
     * @returns {Boolean}
     */
    this.error = console.error;

    /**
     * function to log a message
     * @param {String} message - any message to be print
     * @returns {Boolean}
     */
    this.log = console.log;
  }
}

const core = new Core();

export default core;
