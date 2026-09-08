/**
 * services/tableService.js — dine-in tables (public read so the customer
 * page can show the table name; staff write).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { COLLECTIONS } from '@/firebase/collections'

export function subscribeTables (callback) {
  const q = query(collection(db, COLLECTIONS.TABLES), orderBy('number', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function getTable (tableId) {
  const snap = await getDoc(doc(db, COLLECTIONS.TABLES, tableId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function createTable ({ number, name = '', seats = 4 }) {
  return addDoc(collection(db, COLLECTIONS.TABLES), {
    number,
    name,
    seats: Number(seats) || 0,
    active: true,
    createdAt: serverTimestamp(),
  })
}

export function updateTable (id, patch) {
  return updateDoc(doc(db, COLLECTIONS.TABLES, id), patch)
}

export function deleteTable (id) {
  return deleteDoc(doc(db, COLLECTIONS.TABLES, id))
}
