import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
/**
 * stores/auth.js
 *
 * Staff authentication (customers never touch this store — they have no
 * account). Wraps Firebase Auth + the matching `users/{uid}` Firestore
 * doc, which is where the user's role lives.
 */
import { defineStore } from 'pinia'
import { auth, db, getSecondaryAuth } from '@/firebase'
import { COLLECTIONS, ROLES } from '@/firebase/collections'

let authUnsub = null
let resolveReady
const readyPromise = new Promise(resolve => {
  resolveReady = resolve
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Firebase Auth user object
    profile: null, // matching users/{uid} doc: { role, displayName, active, ... }
    ready: false, // becomes true once the initial auth state resolves
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: state => !!state.user,
    role: state => state.profile?.role ?? null,
    isActive: state => state.profile?.active !== false,
    isAdmin: state => state.profile?.role === ROLES.ADMIN,
    displayName: state => state.profile?.displayName || state.user?.email || '',
    /** True if the signed-in staff member may access `routeRoles`. */
    canAccess: state => routeRoles => {
      if (!routeRoles || routeRoles.length === 0) {
        return true
      }
      if (!state.profile) {
        return false
      }
      if (state.profile.role === ROLES.ADMIN) {
        return true
      }
      return routeRoles.includes(state.profile.role)
    },
  },
  actions: {
    /** Call once from App.vue / a router guard on app start. */
    init () {
      if (authUnsub) {
        return () => authUnsub()
      }
      this.loading = true
      authUnsub = onAuthStateChanged(auth, async firebaseUser => {
        this.user = firebaseUser
        if (firebaseUser) {
          await this.fetchProfile()
        } else {
          this.profile = null
        }
        this.loading = false
        this.ready = true
        resolveReady()
      })
      return () => authUnsub()
    },

    /** Resolves once the initial Firebase Auth state has been resolved. */
    waitForReady () {
      return readyPromise
    },

    async fetchProfile () {
      if (!this.user) {
        return
      }
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, this.user.uid))
      this.profile = snap.exists() ? snap.data() : null
    },

    async login (email, password) {
      this.loading = true
      this.error = null
      try {
        await signInWithEmailAndPassword(auth, email, password)
        await this.fetchProfile()
        if (!this.profile) {
          await this.logout()
          throw new Error('บัญชีนี้ยังไม่ได้ผูกสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ')
        }
        if (this.profile.active === false) {
          await this.logout()
          throw new Error('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ')
        }
        return this.profile
      } catch (error_) {
        this.error = mapAuthError(error_)
        throw error_
      } finally {
        this.loading = false
      }
    },

    async logout () {
      await signOut(auth)
      this.user = null
      this.profile = null
    },

    /**
     * Admin-only: create a new staff login without disturbing the
     * currently-signed-in admin session. Uses a secondary, isolated
     * Firebase App instance (see src/firebase/index.js) purely as a
     * throwaway "account factory", then signs it out immediately.
     */
    async createStaffAccount ({ email, password, displayName, role }) {
      const secondaryAuth = getSecondaryAuth()
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      await updateProfile(cred.user, { displayName })
      await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName,
        role,
        active: true,
        createdAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
      return cred.user.uid
    },
  },
})

function mapAuthError (error_) {
  const code = error_?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  }
  if (code.includes('too-many-requests')) {
    return 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง'
  }
  return error_?.message || 'เข้าสู่ระบบไม่สำเร็จ'
}
