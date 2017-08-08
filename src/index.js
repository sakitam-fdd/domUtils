import * as htmlUtils from './utils/domUtils'
import * as Events from './events/Events'
import { EventType } from './events/EventType'
import * as Utils from './utils/utils'
import PointerEventHandler from './pointer/PointerEventHandler'
let DomUtils = {
  htmlUtils: htmlUtils,
  Events: Events,
  EventType: EventType,
  PointerEventHandler: PointerEventHandler,
  Utils: Utils
}
export default DomUtils
