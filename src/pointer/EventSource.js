class EventSource {
  constructor (dispatcher, mapping) {
    /**
     * @type {PointerEventHandler}
     */
    this.dispatcher = dispatcher

    /**
     * @private
     * @const
     * @type {!Object.<string, function(Event)>}
     */
    this.mapping_ = mapping
  }

  /**
   * List of events supported by this source.
   * @returns {Array}
   */
  getEvents () {
    return Object.keys(this.mapping_)
  }

  /**
   * Returns the handler that should handle a given event type.
   * @param eventType
   * @returns {function(Event)}
   */
  getHandlerForEvent (eventType) {
    return this.mapping_[eventType]
  }
}

export default EventSource

