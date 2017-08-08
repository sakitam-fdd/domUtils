/**
 * Created by FDD on 2017/8/8.
 */
class Event {
  constructor (type) {
    /**
     * @type {boolean}
     */
    this.propagationStopped

    /**
     * The event type.
     * @type {string}
     * @api
     */
    this.type = type

    /**
     * The event target.
     * @type {Object}
     * @api
     */
    this.target = null
  }
  /**
   * Stop event propagation.
   * @function
   * @override
   * @api
   */
  preventDefault () {
    this.propagationStopped = true
  }

  /**
   * Stop event propagation.
   * @function
   * @override
   * @api
   */
  stopPropagation () {
    this.propagationStopped = true
  }

  /**
   * stopPropagation
   * @param evt
   */
  static stopPropagation = (evt) => {
    evt.stopPropagation()
  }

  /**
   * preventDefault
   * @param evt
   */
  static preventDefault = (evt) => {
    evt.preventDefault()
  }
}

export default Event
