/**
 * services/userService.js — staff account management (Admin only).
 * Creating a new login is in stores/auth.js (`createStaffAccount`) since
 * it needs the secondary Firebase Auth app instance.
 */
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { COLLECTIONS } from '@/firebase/collections'

export function subscribeUsers (callback) {
  const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function setUserRole (uid, role) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), { role })
}

export function setUserActive (uid, active) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), { active })
}
