import core from './core';
import state from './state';

// dont want any conflicts with JS Event and CustomEvent Object hence keeping name as RpmEvent
class RpmEvent {
  constructor() {
    // supported events
    this.event = {
      change: [],
      flush: [],
      removeElement: [],
      updateElement: []
    };
  }

  // private function to trigger all change CB
  notifyStateChange = () => {
    // trigger all events
    this.event.change.forEach(e => e(state.getState()));
  };

  // private function to trigger all flush CB
  // state has been reset to empty, trigger final change and then flush event
  notifyStateFlush = (triggerChange) => {
    if (triggerChange) {
      this.notifyStateChange();
    }

    // trigger all events
    this.event.flush.forEach(e => e(true));
  };

  // private function to trigger all element update CB
  notifyElementUpdate = (element) => {
    // trigger all events
    this.event.updateElement.forEach(e => e(element));
  };

  // private function to trigger all element remove CB
  notifyElementRemove = (element) => {
    // trigger all events
    this.event.removeElement.forEach(e => e(element));
  };

  /**
   * function to add event
   * @param {String} eventName
   * @param {function} cb - callback
   */
  addEventListener = (eventName, cb) => {
    let returnCB = null;

    if (typeof cb !== 'function') {
      core.error('`cb` param has to be function');
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(this.event, eventName)) {
      this.event[eventName].push(cb);

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
  removeEventListener = (eventName, cb) => {
    if (Object.prototype.hasOwnProperty.call(this.event, eventName)) {
      this.event[eventName] = this.event[eventName].filter(e => e !== cb);
    } else {
      core.error('No such event');
    }
  };
}

const rpmEvent = new RpmEvent();

export default rpmEvent;