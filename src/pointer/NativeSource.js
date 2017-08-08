// Based on https://github.com/Polymer/PointerEvents
import EventSource from './EventSource'

class NativeSource extends EventSource {
  constructor (dispatcher) {
    super()

    let mapping = {
      'pointerdown': this.pointerDown,
      'pointermove': this.pointerMove,
      'pointerup': this.pointerUp,
      'pointerout': this.pointerOut,
      'pointerover': this.pointerOver,
      'pointercancel': this.pointerCancel,
      'gotpointercapture': this.gotPointerCapture,
      'lostpointercapture': this.lostPointerCapture
    }
    /**
     * call
     */
    EventSource.call(this, dispatcher, mapping)
  }

  /**
   * Handler for `pointerdown`.
   * @param {Event} inEvent The in event.
   */
  pointerDown (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `pointermove`.
   * @param {Event} inEvent The in event.
   */
  pointerMove (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `pointerup`.
   * @param {Event} inEvent The in event.
   */
  pointerUp (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `pointerout`.
   * @param {Event} inEvent The in event.
   */
  pointerOut (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `pointerover`.
   * @param {Event} inEvent The in event.
   */
  pointerOver (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `pointercancel`.
   * @param {Event} inEvent The in event.
   */
  pointerCancel (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `lostpointercapture`.
   * @param {Event} inEvent The in event.
   */
  lostPointerCapture (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }

  /**
   * Handler for `gotpointercapture`.
   * @param {Event} inEvent The in event.
   */
  gotPointerCapture (inEvent) {
    this.dispatcher.fireNativeEvent(inEvent)
  }
}

export default NativeSource
