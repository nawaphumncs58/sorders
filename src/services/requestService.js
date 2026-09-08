/**
 * services/requestService.js — "call staff" / "request bill" buttons on
 * the customer page, resolved from the server dashboard.
 */
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { COLLECTIONS } from '@/firebase/collections'

export function createRequest ({ tableId, tableNumber, type }) {
  return addDoc(collection(db, COLLECTIONS.TABLE_REQUESTS), {
    tableId,
    tableNumber,
    type,
    status: 'open',
    createdAt: serverTimestamp(),
  })
}

export function subscribeOpenRequests (callback) {
  const q = query(
    collection(db, COLLECTIONS.TABLE_REQUESTS),
    where('status', '==', 'open'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function resolveRequest (id, resolvedBy) {
  return updateDoc(doc(db, COLLECTIONS.TABLE_REQUESTS, id), {
    status: 'resolved',
    resolvedBy,
    resolvedAt: serverTimestamp(),
  })
}
