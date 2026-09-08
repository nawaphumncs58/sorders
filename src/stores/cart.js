/**
 * stores/cart.js
 *
 * The customer's in-progress cart for a single table visit. Persisted to
 * sessionStorage (via pinia-plugin-persistedstate) so a page refresh at
 * the table doesn't wipe out what they picked.
 */
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    tableId: null,
    items: [], // { menuItemId, name, price, qty, note }
  }),
  getters: {
    itemCount: state => state.items.reduce((sum, i) => sum + i.qty, 0),
    subtotal: state => state.items.reduce((sum, i) => sum + i.qty * i.price, 0),
  },
  actions: {
    setTable (tableId) {
      if (this.tableId && this.tableId !== tableId) {
        // Switched tables (e.g. scanned a different QR) — start fresh.
        this.items = []
      }
      this.tableId = tableId
    },
    addItem (menuItem, qty = 1, note = '') {
      const existing = this.items.find(i => i.menuItemId === menuItem.id && i.note === note)
      if (existing) {
        existing.qty += qty
      } else {
        this.items.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          qty,
          note,
        })
      }
    },
    updateQty (index, qty) {
      if (qty <= 0) {
        this.items.splice(index, 1)
      } else {
        this.items[index].qty = qty
      }
    },
    removeItem (index) {
      this.items.splice(index, 1)
    },
    clear () {
      this.items = []
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
