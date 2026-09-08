import { doc, onSnapshot, setDoc } from 'firebase/firestore'
/**
 * stores/settings.js
 *
 * Restaurant-wide public settings (name, logo, currency). Readable by
 * everyone including unauthenticated customers, editable by Admin only —
 * see firestore.rules.
 */
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { COLLECTIONS } from '@/firebase/collections'

const SETTINGS_DOC_ID = 'general'
let unsub = null

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    restaurantName: '',
    logoUrl: '',
    currency: 'THB',
    loaded: false,
  }),
  actions: {
    subscribe () {
      if (unsub) {
        return
      }
      unsub = onSnapshot(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), snap => {
        if (snap.exists()) {
          Object.assign(this, snap.data())
        }
        this.loaded = true
      })
    },
    async save (patch) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), patch, { merge: true })
    },
  },
})
