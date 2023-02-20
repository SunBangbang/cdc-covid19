/**
 * Created by charles on 2020/7/18.
 */
import ContactDrawer from './src/contact-drawer'
import MessageDrawer from './src/message-drawer'

ContactDrawer.install = function (Vue) {
  Vue.component(ContactDrawer.name, ContactDrawer)
  Vue.component(MessageDrawer.name, MessageDrawer)
}

export default ContactDrawer
