// Based on https://github.com/Polymer/PointerEvents
import EventTarget from '../events/EventTarget'
import NativeSource from './NativeSource'
import MsSource from './MsSource'
import MouseSource from './MouseSource'
import TouchSource from './TouchSource'
import PointerEvent from './PointerEvent'
import * as Events from '../events/Events'
import {EventType} from '../events/EventType'
class PointerEventHandler extends EventTarget {
  constructor (element) {
    super()

    /**
     * call
     */
    EventTarget.call(this)

    /**
     * element
     */
    this.element_ = element

    /**
     * @const
     * @type {!Object.<string, Event|Object>}
     */
    this.pointerMap = {}

    /**
     * @type {Object.<string, function(Event)>}
     * @private
     */
    this.eventMap_ = {}

    /**
     * @type {Array.<EventSource>}
     * @private
     */
    this.eventSourceList_ = []

    this.registerSources()
  }

  /**
   * Set up the event sources (mouse, touch and native pointers)
   * that generate pointer events.
   */
  registerSources () {
    if ('PointerEvent' in window) {
      this.registerSource('native', (new NativeSource(this)))
    } else if (navigator.msPointerEnabled) {
      this.registerSource('ms', new MsSource(this))
    } else {
      let mouseSource = new MouseSource(this)
      this.registerSource('mouse', mouseSource)
      if ('ontouchstart' in window) {
        this.registerSource('touch', new TouchSource(this, mouseSource))
      }
    }
    // register events on the viewport element
    this.register_()
  }

  /**
   * Add a new event source that will generate pointer events.
   * @param {string} name A name for the event source
   * @param {EventSource} source The source event.
   */
  registerSource (name, source) {
    let s = source
    let newEvents = s.getEvents()
    if (newEvents) {
      newEvents.forEach(function (e) {
        let handler = s.getHandlerForEvent(e)
        if (handler) {
          this.eventMap_[e] = handler.bind(s)
        }
      }, this)
      this.eventSourceList_.push(s)
    }
  }

  /**
   * Set up the events for all registered event sources.
   * @private
   */
  register_ () {
    let l = this.eventSourceList_.length
    let eventSource
    for (let i = 0; i < l; i++) {
      eventSource = this.eventSourceList_[i]
      this.addEvents_(eventSource.getEvents())
    }
  }

  /**
   * Remove all registered events.
   * @private
   */
  unregister_ () {
    let l = this.eventSourceList_.length
    let eventSource
    for (let i = 0; i < l; i++) {
      eventSource = this.eventSourceList_[i]
      this.removeEvents_(eventSource.getEvents())
    }
  }

  /**
   * Calls the right handler for a new event.
   * @private
   * @param {Event} inEvent Browser event.
   */
  eventHandler_ (inEvent) {
    let type = inEvent.type
    let handler = this.eventMap_[type]
    if (handler) {
      handler(inEvent)
    }
  }

  /**
   * Setup listeners for the given events.
   * @private
   * @param {Array.<string>} events List of events.
   */
  addEvents_ (events) {
    events.forEach(function (eventName) {
      Events.listen(this.element_, eventName, this.eventHandler_, this)
    }, this)
  }

  /**
   * Unregister listeners for the given events.
   * @private
   * @param {Array.<string>} events List of events.
   */
  removeEvents_ (events) {
    events.forEach(function (e) {
      Events.unListen(this.element_, e, this.eventHandler_, this)
    }, this)
  }

  /**
   * Returns a snapshot of inEvent, with writable properties.
   * @param event
   * @param inEvent
   * @returns {{}}
   */
  cloneEvent (event, inEvent) {
    let [eventCopy, p] = [{}, null]
    for (var i = 0, ii = PointerEventHandler.CLONE_PROPS.length; i < ii; i++) {
      p = PointerEventHandler.CLONE_PROPS[i][0]
      eventCopy[p] = event[p] || inEvent[p] || PointerEventHandler.CLONE_PROPS[i][1]
    }
    return eventCopy
  }

  /**
   * Triggers a 'pointerdown' event.
   * @param data
   * @param event
   */
  down (data, event) {
    this.fireEvent(EventType.POINTERDOWN, data, event)
  }

  /**
   * Triggers a 'pointermove' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  move (data, event) {
    this.fireEvent(EventType.POINTERMOVE, data, event)
  }

  /**
   * Triggers a 'pointerup' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  up (data, event) {
    this.fireEvent(EventType.POINTERUP, data, event)
  }

  /**
   * Triggers a 'pointerenter' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  enter (data, event) {
    data.bubbles = false
    this.fireEvent(EventType.POINTERENTER, data, event)
  }

  /**
   * Triggers a 'pointerleave' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  leave (data, event) {
    data.bubbles = false
    this.fireEvent(EventType.POINTERLEAVE, data, event)
  }

  /**
   * Triggers a 'pointerover' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  over (data, event) {
    data.bubbles = true
    this.fireEvent(EventType.POINTEROVER, data, event)
  }

  /**
   * Triggers a 'pointerout' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  out (data, event) {
    data.bubbles = true
    this.fireEvent(EventType.POINTEROUT, data, event)
  }

  /**
   * Triggers a 'pointercancel' event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  cancel (data, event) {
    this.fireEvent(EventType.POINTERCANCEL, data, event)
  }

  /**
   * Triggers a combination of 'pointerout' and 'pointerleave' events.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  leaveOut (data, event) {
    this.out(data, event)
    if (!this.contains_(data.target, data.relatedTarget)) {
      this.leave(data, event)
    }
  }

  /**
   * Triggers a combination of 'pointerover' and 'pointerevents' events.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  enterOver (data, event) {
    this.over(data, event)
    if (!this.contains_(data.target, data.relatedTarget)) {
      this.enter(data, event)
    }
  }

  /**
   * @private
   * @param {Element} container The container element.
   * @param {Element} contained The contained element.
   * @return {boolean} Returns true if the container element
   *   contains the other element.
   */
  contains_ (container, contained) {
    if (!container || !contained) {
      return false
    }
    return container.contains(contained)
  }

// EVENT CREATION AND TRACKING
  /**
   * Creates a new Event of type `inType`, based on the information in
   * `data`.
   *
   * @param {string} inType A string representing the type of event to create.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   * @return {PointerEvent} A PointerEvent of type `inType`.
   */
  makeEvent (inType, data, event) {
    return new PointerEvent(inType, event, data)
  }

  /**
   * Make and dispatch an event in one call.
   * @param {string} inType A string representing the type of event.
   * @param {Object} data Pointer event data.
   * @param {Event} event The event.
   */
  fireEvent (inType, data, event) {
    let e = this.makeEvent(inType, data, event)
    this.dispatchEvent(e)
  }

  /**
   * Creates a pointer event from a native pointer event
   * and dispatches this event.
   * @param {Event} event A platform event with a target.
   */
  fireNativeEvent (event) {
    let e = this.makeEvent(event.type, event, event)
    this.dispatchEvent(e)
  }

  /**
   * Wrap a native mouse event into a pointer event.
   * This proxy method is required for the legacy IE support.
   * @param {string} eventType The pointer event type.
   * @param {Event} event The event.
   * @return {PointerEvent} The wrapped event.
   */
  wrapMouseEvent (eventType, event) {
    let pointerEvent = this.makeEvent(eventType, MouseSource.prepareEvent(event, this), event)
    return pointerEvent
  }

  /**
   * @inheritDoc
   */
  disposeInternal () {
    this.unregister_()
    EventTarget.prototype.disposeInternal.call(this)
  }

  /**
   * Properties to copy when cloning an event, with default values.
   * @type {Array.<Array>}
   */
  static CLONE_PROPS = [
    // MouseEvent
    ['bubbles', false],
    ['cancelable', false],
    ['view', null],
    ['detail', null],
    ['screenX', 0],
    ['screenY', 0],
    ['clientX', 0],
    ['clientY', 0],
    ['ctrlKey', false],
    ['altKey', false],
    ['shiftKey', false],
    ['metaKey', false],
    ['button', 0],
    ['relatedTarget', null],
    // DOM Level 3
    ['buttons', 0],
    // PointerEvent
    ['pointerId', 0],
    ['width', 0],
    ['height', 0],
    ['pressure', 0],
    ['tiltX', 0],
    ['tiltY', 0],
    ['pointerType', ''],
    ['hwTimestamp', 0],
    ['isPrimary', false],
    // event instance
    ['type', ''],
    ['target', null],
    ['currentTarget', null],
    ['which', 0]
  ]
}

export default PointerEventHandler
