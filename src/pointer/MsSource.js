// Based on https://github.com/Polymer/PointerEvents
import EventSource from './EventSource'
class MsSource extends EventSource {
  constructor (dispatcher) {
    super()
    /**
     * mapping
     * @type {{MSPointerDown: MsSource.msPointerDown, MSPointerMove: MsSource.msPointerMove, MSPointerUp: MsSource.msPointerUp, MSPointerOut: MsSource.msPointerOut, MSPointerOver: MsSource.msPointerOver, MSPointerCancel: MsSource.msPointerCancel, MSGotPointerCapture: MsSource.msGotPointerCapture, MSLostPointerCapture: MsSource.msLostPointerCapture}}
     */
    let mapping = {
      'MSPointerDown': this.msPointerDown,
      'MSPointerMove': this.msPointerMove,
      'MSPointerUp': this.msPointerUp,
      'MSPointerOut': this.msPointerOut,
      'MSPointerOver': this.msPointerOver,
      'MSPointerCancel': this.msPointerCancel,
      'MSGotPointerCapture': this.msGotPointerCapture,
      'MSLostPointerCapture': this.msLostPointerCapture
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
     * @type {Array.<string>}
     */
    this.POINTER_TYPES = [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ]
  }

  /**
   * Creates a copy of the original event that will be used
   * for the fake pointer event.
   * @param inEvent
   * @returns {*}
   * @private
   */
  prepareEvent_ (inEvent) {
    let e = inEvent
    if (typeof inEvent.pointerType === 'number') {
      e = this.dispatcher.cloneEvent(inEvent, inEvent)
      e.pointerType = this.POINTER_TYPES[inEvent.pointerType]
    }
    return e
  }

  /**
   * Remove this pointer from the list of active pointers.
   * @param pointerId
   */
  cleanup (pointerId) {
    delete this.pointerMap[pointerId.toString()]
  }

  /**
   * Handler for `msPointerDown`.
   * @param inEvent
   */
  msPointerDown (inEvent) {
    this.pointerMap[inEvent.pointerId.toString()] = inEvent
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.down(e, inEvent)
  }

  /**
   * Handler for `msPointerMove`.
   * @param {Event} inEvent The in event.
   */
  msPointerMove (inEvent) {
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.move(e, inEvent)
  }

  /**
   * Handler for `msPointerUp`.
   * @param {Event} inEvent The in event.
   */
  msPointerUp (inEvent) {
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.up(e, inEvent)
    this.cleanup(inEvent.pointerId)
  }

  /**
   * Handler for `msPointerOut`.
   * @param {Event} inEvent The in event.
   */
  msPointerOut (inEvent) {
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.leaveOut(e, inEvent)
  }

  /**
   * Handler for `msPointerOver`.
   * @param {Event} inEvent The in event.
   */
  msPointerOver (inEvent) {
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.enterOver(e, inEvent)
  }

  /**
   * Handler for `msPointerCancel`.
   * @param {Event} inEvent The in event.
   */
  msPointerCancel (inEvent) {
    let e = this.prepareEvent_(inEvent)
    this.dispatcher.cancel(e, inEvent)
    this.cleanup(inEvent.pointerId)
  }

  /**
   * Handler for `msLostPointerCapture`.
   * @param {Event} inEvent The in event.
   */
  msLostPointerCapture (inEvent) {
    let e = this.dispatcher.makeEvent('lostpointercapture',
      inEvent, inEvent)
    this.dispatcher.dispatchEvent(e)
  }

  /**
   * Handler for `msGotPointerCapture`.
   * @param {Event} inEvent The in event.
   */
  msGotPointerCapture (inEvent) {
    let e = this.dispatcher.makeEvent('gotpointercapture',
      inEvent, inEvent)
    this.dispatcher.dispatchEvent(e)
  }
}

export default MsSource
