/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import router from '../router'
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app) {
  const pinia = createPinia()
  pinia.use(piniaPersist)

  app.use(vuetify)
  app.use(pinia)
  app.use(router)
}
