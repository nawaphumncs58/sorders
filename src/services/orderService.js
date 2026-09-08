/**
 * services/orderService.js — placing orders (public, from the customer's
 * table) and progressing them through the kitchen/server workflow (staff).
 */
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { COLLECTIONS, ITEM_STATUS, ORDER_STATUS } from '@/firebase/collections'

function makeItemId () {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Customer places an order for their table (no auth required). */
export function placeOrder ({ tableId, tableNumber, sessionId, items, customerNote = '' }) {
  const orderItems = items.map(i => ({
    id: makeItemId(),
    menuItemId: i.menuItemId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    note: i.note || '',
    status: ITEM_STATUS.QUEUED,
  }))
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)

  return addDoc(collection(db, COLLECTIONS.ORDERS), {
    tableId,
    tableNumber,
    sessionId,
    items: orderItems,
    subtotal,
    customerNote,
    status: ORDER_STATUS.ACTIVE,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/** Customer's live view of everything they've ordered this visit. */
export function subscribeCustomerOrders (tableId, sessionId, callback) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('tableId', '==', tableId),
    where('sessionId', '==', sessionId),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/** Kitchen/server: every order that still has unserved items. */
export function subscribeActiveOrders (callback) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('status', '==', ORDER_STATUS.ACTIVE),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/** All orders created since `since` (Date) — used for the manager's daily totals. */
export function subscribeOrdersSince (since, callback) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('createdAt', '>=', Timestamp.fromDate(since)),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Advance (or cancel) a single dish's status within an order, and keep the
 * order-level status in sync — done as a transaction so two staff members
 * tapping different items on the same order at once can't clobber each
 * other's write.
 */
export async function updateItemStatus (orderId, itemId, newStatus) {
  const ref = doc(db, COLLECTIONS.ORDERS, orderId)
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      return
    }
    const order = snap.data()
    const items = order.items.map(i => (i.id === itemId ? { ...i, status: newStatus } : i))
    const allDone = items.every(i => i.status === ITEM_STATUS.SERVED || i.status === ITEM_STATUS.CANCELLED)
    tx.update(ref, {
      items,
      status: allDone ? ORDER_STATUS.CLOSED : ORDER_STATUS.ACTIVE,
      updatedAt: serverTimestamp(),
    })
  })
}

export function cancelOrder (orderId) {
  return updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status: ORDER_STATUS.CANCELLED,
    updatedAt: serverTimestamp(),
  })
}
