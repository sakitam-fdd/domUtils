/**
 * @classdesc
 * A simplified implementation of the W3C DOM Level 2 EventTarget interface.
 * @see {@link https://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget}
 *
 * There are two important simplifications compared to the specification:
 *
 * 1. The handling of `useCapture` in `addEventListener` and
 *    `removeEventListener`. There is no real capture model.
 * 2. The handling of `stopPropagation` and `preventDefault` on `dispatchEvent`.
 *    There is no event target hierarchy. When a listener calls
 *    `stopPropagation` or `preventDefault` on an event object, it means that no
 *    more listeners after this one will be called. Same as when the listener
 *    returns false.
 */
import * as Events from './Events'
import Event from './Event'
class EventTarget {
  constructor () {
    /**
     * @private
     * @type {!Object.<string, number>}
     */
    this.pendingRemovals_ = {}

    /**
     * @private
     * @type {!Object.<string, number>}
     */
    this.dispatching_ = {}

    /**
     * @private
     * @type {!Object}
     */
    this.listeners_ = {}
  }

  /**
   * addEventListener
   * @param type
   * @param listener
   */
  addEventListener (type, listener) {
    let listeners = this.listeners_[type]
    if (!listeners) {
      listeners = this.listeners_[type] = []
    }
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener)
    }
  }

  /**
   * dispatchEvent
   * @param event
   * @returns {*}
   */
  dispatchEvent (event) {
    let evt = typeof event === 'string' ? new Event(event) : event
    let type = evt.type
    evt.target = this
    let listeners = this.listeners_[type]
    let propagate
    if (listeners) {
      if (!(type in this.dispatching_)) {
        this.dispatching_[type] = 0
        this.pendingRemovals_[type] = 0
      }
      ++this.dispatching_[type]
      for (var i = 0, ii = listeners.length; i < ii; ++i) {
        if (listeners[i].call(this, evt) === false || evt.propagationStopped) {
          propagate = false
          break
        }
      }
      --this.dispatching_[type]
      if (this.dispatching_[type] === 0) {
        let pendingRemovals = this.pendingRemovals_[type]
        delete this.pendingRemovals_[type]
        while (pendingRemovals--) {
          this.removeEventListener(type, function () {})
        }
        delete this.dispatching_[type]
      }
      return propagate
    }
  }

  /**
   * @inheritDoc
   */
  disposeInternal () {
    Events.unlistenAll(this)
  }

  /**
   * getListeners
   * @param type
   * @returns {*}
   */
  getListeners (type) {
    return this.listeners_[type]
  }

  /**
   * hasListener
   * @param optType
   * @returns {boolean}
   */
  hasListener (optType) {
    return optType ? optType in this.listeners_ : Object.keys(this.listeners_).length > 0
  }

  /**
   * removeEventListener
   * @param type
   * @param listener
   */
  removeEventListener (type, listener) {
    let listeners = this.listeners_[type]
    if (listeners) {
      let index = listeners.indexOf(listener)
      if (type in this.pendingRemovals_) {
        // make listener a no-op, and remove later in #dispatchEvent()
        listeners[index] = function () {}
        ++this.pendingRemovals_[type]
      } else {
        listeners.splice(index, 1)
        if (listeners.length === 0) {
          delete this.listeners_[type]
        }
      }
    }
  }
}

export default EventTarget
