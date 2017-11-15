import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'

import App from './App'
import router from './router'
import store from './store'

import Nedb from 'nedb'
import DBUtil from './utils/DBUtil'

Vue.use(Vuetify)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

let db
if (process.env.NODE_ENV !== 'production') {
  db = new Nedb({filename: 'data/datafile', autoload: true})
} else {
  db = new Nedb({filename: 'data/datafile', autoload: true})
}
Vue.db = Vue.prototype.$db = db
DBUtil.init(db)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
