/**
 * scripts/seed.mjs
 *
 * One-time helper to seed a fresh Firebase project with:
 *  - the first Admin login (users/{uid} + Firebase Auth account)
 *  - a couple of demo categories / menu items / tables
 *
 * Usage:
 *   1. Firebase Console → Project settings → Service accounts →
 *      Generate new private key. Save it as ./serviceAccountKey.json
 *      (already gitignored — never commit this file).
 *   2. node scripts/seed.mjs --email you@example.com --password "Str0ngPass!" --name "Owner"
 *
 * Safe to re-run: it skips creating the admin user if that email already
 * exists, and uses fixed doc ids for the demo data so re-running just
 * overwrites them instead of duplicating.
 */
import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith('--')) {
      pairs.push([arg.slice(2), all[i + 1]])
    }
    return pairs
  }, []),
)

if (!args.email || !args.password) {
  console.error('Usage: node scripts/seed.mjs --email you@example.com --password "Str0ngPass!" [--name "Owner"]')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url)))
initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()
const db = getFirestore()

async function ensureAdminUser () {
  let user
  try {
    user = await auth.getUserByEmail(args.email)
    console.log(`✓ Admin user already exists: ${args.email}`)
  } catch {
    user = await auth.createUser({
      email: args.email,
      password: args.password,
      displayName: args.name || 'Admin',
    })
    console.log(`✓ Created admin user: ${args.email}`)
  }
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: args.email,
    displayName: args.name || 'Admin',
    role: 'admin',
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true })
  console.log('✓ Wrote users/{uid} profile with role=admin')
}

async function seedDemoData () {
  await db.collection('settings').doc('general').set({
    restaurantName: 'My Restaurant',
    logoUrl: '',
    currency: 'THB',
  }, { merge: true })

  const categories = [
    { id: 'cat-main', name: 'อาหารจานหลัก', sortOrder: 0 },
    { id: 'cat-drink', name: 'เครื่องดื่ม', sortOrder: 1 },
  ]
  for (const c of categories) {
    await db.collection('categories').doc(c.id).set({ ...c, active: true, createdAt: FieldValue.serverTimestamp() }, { merge: true })
  }

  const items = [
    { id: 'item-fried-rice', name: 'ข้าวผัดหมู', description: '', price: 60, categoryId: 'cat-main', imageUrl: '', sortOrder: 0 },
    { id: 'item-pad-thai', name: 'ผัดไทยกุ้งสด', description: '', price: 80, categoryId: 'cat-main', imageUrl: '', sortOrder: 1 },
    { id: 'item-thai-tea', name: 'ชาไทยเย็น', description: '', price: 35, categoryId: 'cat-drink', imageUrl: '', sortOrder: 0 },
  ]
  for (const i of items) {
    await db.collection('menuItems').doc(i.id).set({ ...i, available: true, createdAt: FieldValue.serverTimestamp() }, { merge: true })
  }

  const tables = [
    { id: 'table-1', number: '1', seats: 4 },
    { id: 'table-2', number: '2', seats: 4 },
  ]
  for (const t of tables) {
    await db.collection('tables').doc(t.id).set({ ...t, active: true, createdAt: FieldValue.serverTimestamp() }, { merge: true })
  }
  console.log('✓ Seeded demo settings, categories, menu items, and tables')
}

await ensureAdminUser()
await seedDemoData()
console.log('\nDone. Log in at /login with the admin account above.')
process.exit(0)
