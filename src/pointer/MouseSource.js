// Based on https://github.com/Polymer/PointerEvents
import EventSource from './EventSource'
class MouseSource extends EventSource {
  constructor (dispatcher) {
    super()

    let mapping = {
      'mousedown': this.mousedown,
      'mousemove': this.mousemove,
      'mouseup': this.mouseup,
      'mouseover': this.mouseover,
      'mouseout': this.mouseout
    }
    /**
     * call
     */
    EventSource.call(this, dispatcher, mapping)

    /**
     * @const
     * @type {!Object.<string, Event|Object>}
     */
    this.pointerMap = dispatcher.pointerMap

    /**
     * lastTouches
     * @type {Array}
     */
    this.lastTouches = []
  }

  /**
   * @const
   * @type {number}
   */
  static POINTER_ID = 1

  /**
   * @const
   * @type {string}
   */
  static POINTER_TYPE = 'mouse'

  /**
   * Radius around touchend that swallows mouse events.
   * @const
   * @type {number}
   */
  static DEDUP_DIST = 25

  isEventSimulatedFromTouch_ (inEvent) {
    let [lts, x, y] = [this.lastTouches, inEvent.clientX, inEvent.clientY]
    for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
      // simulated mouse events will be swallowed near a primary touchend
      let [dx, dy] = [Math.abs(x - t[0]), Math.abs(y - t[1])]
      if (dx <= MouseSource.DEDUP_DIST &&
        dy <= MouseSource.DEDUP_DIST) {
        return true
      }
    }
    return false
  }

  /**
   * Creates a copy of the original event that will be used
   * for the fake pointer event.
   * @param inEvent
   * @param dispatcher
   * @returns {Object}
   */
  static prepareEvent = function (inEvent, dispatcher) {
    let e = dispatcher.cloneEvent(inEvent, inEvent)
    // forward mouse preventDefault
    let pd = e.preventDefault
    e.preventDefault = function () {
      inEvent.preventDefault()
      pd()
    }
    e.pointerId = MouseSource.POINTER_ID
    e.isPrimary = true
    e.pointerType = MouseSource.POINTER_TYPE
    return e
  }

  /**
   * Handler for `mousedown`.
   * @param {Event} inEvent The in event.
   */
  mousedown (inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      if (MouseSource.POINTER_ID.toString() in this.pointerMap) {
        this.cancel(inEvent)
      }
      let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
      this.pointerMap[MouseSource.POINTER_ID.toString()] = inEvent
      this.dispatcher.down(e, inEvent)
    }
  }

  /**
   * Handler for `mousemove`.
   * @param {Event} inEvent The in event.
   */
  mousemove (inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
      this.dispatcher.move(e, inEvent)
    }
  }

  /**
   * Handler for `mouseup`.
   * @param {Event} inEvent The in event.
   */
  mouseup (inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      let p = this.pointerMap[MouseSource.POINTER_ID.toString()]
      if (p && p.button === inEvent.button) {
        let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
        this.dispatcher.up(e, inEvent)
        this.cleanupMouse()
      }
    }
  }

  /**
   * Handler for `mouseover`.
   * @param {Event} inEvent The in event.
   */
  mouseover (inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
      this.dispatcher.enterOver(e, inEvent)
    }
  }

  /**
   * Handler for `mouseout`.
   * @param {Event} inEvent The in event.
   */
  mouseout (inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
      this.dispatcher.leaveOut(e, inEvent)
    }
  }

  /**
   * Dispatches a `pointercancel` event.
   * @param {Event} inEvent The in event.
   */
  cancel (inEvent) {
    let e = MouseSource.prepareEvent(inEvent, this.dispatcher)
    this.dispatcher.cancel(e, inEvent)
    this.cleanupMouse()
  }

  /**
   * Remove the mouse from the list of active pointers.
   */
  cleanupMouse () {
    delete this.pointerMap[MouseSource.POINTER_ID.toString()]
  }
}

export default MouseSource
