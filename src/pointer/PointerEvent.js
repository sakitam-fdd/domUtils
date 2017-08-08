// Based on https://github.com/Polymer/PointerEvents
class PointerEvent {
  constructor (type, originalEvent, optEventDict) {
    /**
     * @const
     * @type {Event}
     */
    this.originalEvent = originalEvent

    let eventDict = optEventDict || {}

    /**
     * @type {number}
     */
    this.buttons = this.getButtons_(eventDict)

    /**
     * @type {number}
     */
    this.pressure = this.getPressure_(eventDict, this.buttons)

    // MouseEvent related properties

    /**
     * @type {boolean}
     */
    this.bubbles = 'bubbles' in eventDict ? eventDict['bubbles'] : false

    /**
     * @type {boolean}
     */
    this.cancelable = 'cancelable' in eventDict ? eventDict['cancelable'] : false

    /**
     * @type {Object}
     */
    this.view = 'view' in eventDict ? eventDict['view'] : null

    /**
     * @type {number}
     */
    this.detail = 'detail' in eventDict ? eventDict['detail'] : null

    /**
     * @type {number}
     */
    this.screenX = 'screenX' in eventDict ? eventDict['screenX'] : 0

    /**
     * @type {number}
     */
    this.screenY = 'screenY' in eventDict ? eventDict['screenY'] : 0

    /**
     * @type {number}
     */
    this.clientX = 'clientX' in eventDict ? eventDict['clientX'] : 0

    /**
     * @type {number}
     */
    this.clientY = 'clientY' in eventDict ? eventDict['clientY'] : 0

    /**
     * @type {boolean}
     */
    this.ctrlKey = 'ctrlKey' in eventDict ? eventDict['ctrlKey'] : false

    /**
     * @type {boolean}
     */
    this.altKey = 'altKey' in eventDict ? eventDict['altKey'] : false

    /**
     * @type {boolean}
     */
    this.shiftKey = 'shiftKey' in eventDict ? eventDict['shiftKey'] : false

    /**
     * @type {boolean}
     */
    this.metaKey = 'metaKey' in eventDict ? eventDict['metaKey'] : false

    /**
     * @type {number}
     */
    this.button = 'button' in eventDict ? eventDict['button'] : 0

    /**
     * @type {Node}
     */
    this.relatedTarget = 'relatedTarget' in eventDict ? eventDict['relatedTarget'] : null

    // PointerEvent related properties

    /**
     * @const
     * @type {number}
     */
    this.pointerId = 'pointerId' in eventDict ? eventDict['pointerId'] : 0

    /**
     * @type {number}
     */
    this.width = 'width' in eventDict ? eventDict['width'] : 0

    /**
     * @type {number}
     */
    this.height = 'height' in eventDict ? eventDict['height'] : 0

    /**
     * @type {number}
     */
    this.tiltX = 'tiltX' in eventDict ? eventDict['tiltX'] : 0

    /**
     * @type {number}
     */
    this.tiltY = 'tiltY' in eventDict ? eventDict['tiltY'] : 0

    /**
     * @type {string}
     */
    this.pointerType = 'pointerType' in eventDict ? eventDict['pointerType'] : ''

    /**
     * @type {number}
     */
    this.hwTimestamp = 'hwTimestamp' in eventDict ? eventDict['hwTimestamp'] : 0

    /**
     * @type {boolean}
     */
    this.isPrimary = 'isPrimary' in eventDict ? eventDict['isPrimary'] : false

    // keep the semantics of preventDefault
    if (originalEvent.preventDefault) {
      this.preventDefault = function () {
        originalEvent.preventDefault()
      }
    }
  }

  getButtons_ (eventDict) {
    let buttons
    if (eventDict.buttons || PointerEvent.HAS_BUTTONS) {
      buttons = eventDict.buttons
    } else {
      switch (eventDict.which) {
        case 1:
          buttons = 1
          break
        case 2:
          buttons = 4
          break
        case 3:
          buttons = 2
          break
        default:
          buttons = 0
      }
    }
    return buttons
  }

  getPressure_ (eventDict, buttons) {
    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    let pressure = 0
    if (eventDict.pressure) {
      pressure = eventDict.pressure
    } else {
      pressure = buttons ? 0.5 : 0
    }
    return pressure
  }

  preventDefault (evt) {
    evt.preventDefault()
  }

  /**
   * 是否支持buttons
   * @type {boolean}
   */
  static HAS_BUTTONS = false
}

export default PointerEvent
