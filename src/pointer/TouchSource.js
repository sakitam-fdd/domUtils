// Based on https://github.com/Polymer/PointerEvents

import EventSource from './EventSource'
import MouseSource from './MouseSource'
import {arrayRemove} from '../utils/utils'
class TouchSource extends EventSource {
  constructor (dispatcher, mouseSource) {
    super()
    let mapping = {
      'touchstart': this.touchstart,
      'touchmove': this.touchmove,
      'touchend': this.touchend,
      'touchcancel': this.touchcancel
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
     * @const
     * @type {MouseSource}
     */
    this.mouseSource = mouseSource

    /**
     * @private
     * @type {number|undefined}
     */
    this.firstTouchId_ = undefined

    /**
     * @private
     * @type {number}
     */
    this.clickCount_ = 0

    /**
     * @private
     * @type {number|undefined}
     */
    this.resetId_ = undefined
  }

  /**
   * Mouse event timeout: This should be long enough to
   * ignore compat mouse events made by touch.
   * @const
   * @type {number}
   */
  static DEDUP_TIMEOUT = 2500

  /**
   * @const
   * @type {number}
   */
  static CLICK_COUNT_TIMEOUT = 200

  /**
   * @const
   * @type {string}
   */
  static POINTER_TYPE = 'touch'

  /**
   * @private
   * @param {Touch} inTouch The in touch.
   * @return {boolean} True, if this is the primary touch.
   */
  isPrimaryTouch_ (inTouch) {
    return this.firstTouchId_ === inTouch.identifier
  }

  /**
   * Set primary touch if there are no pointers, or the only pointer is the mouse.
   * @param {Touch} inTouch The in touch.
   * @private
   */
  setPrimaryTouch_ (inTouch) {
    let count = Object.keys(this.pointerMap).length
    if (count === 0 || (count === 1 &&
      MouseSource.POINTER_ID.toString() in this.pointerMap)) {
      this.firstTouchId_ = inTouch.identifier
      this.cancelResetClickCount_()
    }
  }

  /**
   * @private
   * @param {Object} inPointer The in pointer object.
   */
  removePrimaryPointer_ (inPointer) {
    if (inPointer.isPrimary) {
      this.firstTouchId_ = undefined
      this.resetClickCount_()
    }
  }

  /**
   * @private
   */
  resetClickCount_ () {
    this.resetId_ = setTimeout(
      this.resetClickCountHandler_.bind(this),
      TouchSource.CLICK_COUNT_TIMEOUT)
  }

  /**
   * @private
   */
  resetClickCountHandler_ () {
    this.clickCount_ = 0
    this.resetId_ = undefined
  }

  /**
   * @private
   */
  cancelResetClickCount_ () {
    if (this.resetId_ !== undefined) {
      clearTimeout(this.resetId_)
    }
  }

  /**
   * @private
   * @param {Event} browserEvent Browser event
   * @param {Touch} inTouch Touch event
   * @return {Object} A pointer object.
   */
  touchToPointer_ (browserEvent, inTouch) {
    let e = this.dispatcher.cloneEvent(browserEvent, inTouch)
    e.pointerId = inTouch.identifier + 2
    // TODO: check if this is necessary?
    e.bubbles = true
    e.cancelable = true
    e.detail = this.clickCount_
    e.button = 0
    e.buttons = 1
    e.width = inTouch.webkitRadiusX || inTouch.radiusX || 0
    e.height = inTouch.webkitRadiusY || inTouch.radiusY || 0
    e.pressure = inTouch.webkitForce || inTouch.force || 0.5
    e.isPrimary = this.isPrimaryTouch_(inTouch)
    e.pointerType = TouchSource.POINTER_TYPE
    // make sure that the properties that are different for
    // each `Touch` object are not copied from the BrowserEvent object
    e.clientX = inTouch.clientX
    e.clientY = inTouch.clientY
    e.screenX = inTouch.screenX
    e.screenY = inTouch.screenY
    return e
  }

  /**
   * @private
   * @param {Event} inEvent Touch event
   * @param {function(Event, Object)} inFunction In function.
   */
  processTouches_ (inEvent, inFunction) {
    let touches = Array.prototype.slice.call(inEvent.changedTouches)
    let count = touches.length
    function preventDefault () {
      inEvent.preventDefault()
    }
    let pointer
    for (let i = 0; i < count; ++i) {
      pointer = this.touchToPointer_(inEvent, touches[i])
      // forward touch preventDefaults
      pointer.preventDefault = preventDefault
      inFunction.call(this, inEvent, pointer)
    }
  }

  /**
   * @private
   * @param {TouchList} touchList The touch list.
   * @param {number} searchId Search identifier.
   * @return {boolean} True, if the `Touch` with the given id is in the list.
   */
  findTouch_ (touchList, searchId) {
    let [l, touch] = [touchList.length]
    for (let i = 0; i < l; i++) {
      touch = touchList[i]
      if (touch.identifier === searchId) {
        return true
      }
    }
    return false
  }

  /**
   * In some instances, a touchstart can happen without a touchend. This
   * leaves the pointermap in a broken state.
   * Therefore, on every touchstart, we remove the touches that did not fire a
   * touchend event.
   * To keep state globally consistent, we fire a pointercancel for
   * this "abandoned" touch
   * @param inEvent
   * @private
   */
  vacuumTouches_ (inEvent) {
    let touchList = inEvent.touches
    let keys = Object.keys(this.pointerMap)
    let count = keys.length
    if (count >= touchList.length) {
      var d = []
      var i, key, value
      for (i = 0; i < count; ++i) {
        key = keys[i]
        value = this.pointerMap[key]
        if (key !== MouseSource.POINTER_ID &&
          !this.findTouch_(touchList, key - 2)) {
          d.push(value.out)
        }
      }
      for (i = 0; i < d.length; ++i) {
        this.cancelOut_(inEvent, d[i])
      }
    }
  }

  /**
   * Handler for `touchstart`, triggers `pointerover`,
   * `pointerenter` and `pointerdown` events.
   * @param {Event} inEvent The in event.
   */
  touchstart (inEvent) {
    this.vacuumTouches_(inEvent)
    this.setPrimaryTouch_(inEvent.changedTouches[0])
    this.dedupSynthMouse_(inEvent)
    this.clickCount_++
    this.processTouches_(inEvent, this.overDown_)
  }

  /**
   * @private
   * @param {Event} browserEvent The event.
   * @param {Object} inPointer The in pointer object.
   */
  overDown_ (browserEvent, inPointer) {
    this.pointerMap[inPointer.pointerId] = {
      target: inPointer.target,
      out: inPointer,
      outTarget: inPointer.target
    }
    this.dispatcher.over(inPointer, browserEvent)
    this.dispatcher.enter(inPointer, browserEvent)
    this.dispatcher.down(inPointer, browserEvent)
  }

  /**
   * Handler for `touchmove`.
   * @param {Event} inEvent The in event.
   */
  touchmove (inEvent) {
    inEvent.preventDefault()
    this.processTouches_(inEvent, this.moveOverOut_)
  }

  /**
   * @private
   * @param {Event} browserEvent The event.
   * @param {Object} inPointer The in pointer.
   */
  moveOverOut_ (browserEvent, inPointer) {
    let event = inPointer
    let pointer = this.pointerMap[event.pointerId]
    // a finger drifted off the screen, ignore it
    if (!pointer) {
      return
    }
    let outEvent = pointer.out
    let outTarget = pointer.outTarget
    this.dispatcher.move(event, browserEvent)
    if (outEvent && outTarget !== event.target) {
      outEvent.relatedTarget = event.target
      event.relatedTarget = outTarget
      // recover from retargeting by shadow
      outEvent.target = outTarget
      if (event.target) {
        this.dispatcher.leaveOut(outEvent, browserEvent)
        this.dispatcher.enterOver(event, browserEvent)
      } else {
        // clean up case when finger leaves the screen
        event.target = outTarget
        event.relatedTarget = null
        this.cancelOut_(browserEvent, event)
      }
    }
    pointer.out = event
    pointer.outTarget = event.target
  }

  /**
   * Handler for `touchend`, triggers `pointerup`,
   * `pointerout` and `pointerleave` events.
   * @param {Event} inEvent The event.
   */
  touchend (inEvent) {
    this.dedupSynthMouse_(inEvent)
    this.processTouches_(inEvent, this.upOut_)
  }

  /**
   * @private
   * @param {Event} browserEvent An event.
   * @param {Object} inPointer The inPointer object.
   */
  upOut_ (browserEvent, inPointer) {
    this.dispatcher.up(inPointer, browserEvent)
    this.dispatcher.out(inPointer, browserEvent)
    this.dispatcher.leave(inPointer, browserEvent)
    this.cleanUpPointer_(inPointer)
  }

  /**
   * Handler for `touchcancel`, triggers `pointercancel`,
   * `pointerout` and `pointerleave` events.
   * @param {Event} inEvent The in event.
   */
  touchcancel (inEvent) {
    this.processTouches_(inEvent, this.cancelOut_)
  }

  /**
   * @private
   * @param {Event} browserEvent The event.
   * @param {Object} inPointer The in pointer.
   */
  cancelOut_ (browserEvent, inPointer) {
    this.dispatcher.cancel(inPointer, browserEvent)
    this.dispatcher.out(inPointer, browserEvent)
    this.dispatcher.leave(inPointer, browserEvent)
    this.cleanUpPointer_(inPointer)
  }

  /**
   * @private
   * @param {Object} inPointer The inPointer object.
   */
  cleanUpPointer_ (inPointer) {
    delete this.pointerMap[inPointer.pointerId]
    this.removePrimaryPointer_(inPointer)
  }

  /**
   * Prevent synth mouse events from creating pointer events.
   *
   * @private
   * @param {Event} inEvent The in event.
   */
  dedupSynthMouse_ (inEvent) {
    let lts = this.mouseSource.lastTouches
    let t = inEvent.changedTouches[0]
    if (this.isPrimaryTouch_(t)) {
      let lt = [t.clientX, t.clientY]
      lts.push(lt)
      setTimeout(function () {
        // remove touch after timeout
        arrayRemove(lts, lt)
      }, TouchSource.DEDUP_TIMEOUT)
    }
  }
}

export default TouchSource
