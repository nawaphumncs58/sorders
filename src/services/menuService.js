/**
 * services/menuService.js — categories + menu items (public read, staff write).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { COLLECTIONS } from '@/firebase/collections'

// ---- Categories ----------------------------------------------------------

export function subscribeCategories (callback) {
  const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('sortOrder', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function createCategory ({ name, sortOrder = 0 }) {
  return addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    name,
    sortOrder,
    active: true,
    createdAt: serverTimestamp(),
  })
}

export function updateCategory (id, patch) {
  return updateDoc(doc(db, COLLECTIONS.CATEGORIES, id), patch)
}

export function deleteCategory (id) {
  return deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
}

// ---- Menu items ------------------------------------------------------------

export function subscribeMenuItems (callback) {
  const q = query(collection(db, COLLECTIONS.MENU_ITEMS), orderBy('sortOrder', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function createMenuItem ({ name, description = '', price, categoryId, imageUrl = '', sortOrder = 0 }) {
  return addDoc(collection(db, COLLECTIONS.MENU_ITEMS), {
    name,
    description,
    price: Number(price) || 0,
    categoryId,
    imageUrl,
    available: true,
    sortOrder,
    createdAt: serverTimestamp(),
  })
}

export function updateMenuItem (id, patch) {
  if (patch.price !== undefined) {
    patch.price = Number(patch.price) || 0
  }
  return updateDoc(doc(db, COLLECTIONS.MENU_ITEMS, id), patch)
}

export function deleteMenuItem (id) {
  return deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, id))
}
