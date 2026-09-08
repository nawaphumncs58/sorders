# SOrders — ระบบสั่งอาหารออนไลน์สำหรับร้านอาหาร (Mobile Web App)

Vue 3 + Vuetify + Firebase (Firestore + Authentication) ordering system for a
dine-in restaurant, with five roles:

| Role | Thai | Login? | Route |
|---|---|---|---|
| Customer | ลูกค้า | ❌ ไม่ต้อง login | `/order/:tableId` (สแกน QR ที่โต๊ะ) |
| Kitchen | แม่ครัว | ✅ | `/kitchen` |
| Server | พนักงานเสิร์ฟ | ✅ | `/server` |
| Manager | ผู้จัดการร้าน | ✅ | `/manager` |
| Admin | ผู้ดูแลระบบ | ✅ | `/admin` |

Built with `npm create vuetify@latest` (this pulled **Vuetify 4.0.2** + Vue
Router 5 + Pinia, the current `latest` at the time this was scaffolded —
see "About the Vuetify version" below if you specifically need Vuetify 3.x).

## How it works

- **Customer** scans the QR code on their table (or a manager opens
  `/order/:tableId` from Table Management). No account needed — a random
  "visit id" is stored in the browser (see `src/utils/session.js`) so they
  can see their own order status live. They can browse the menu, add items
  to a cart, place an order, watch each dish move from "รอคิว" → "กำลังปรุง"
  → "พร้อมเสิร์ฟ" → "เสิร์ฟแล้ว" in real time, and tap "เรียกพนักงาน" /
  "ขอเช็คบิล" to notify staff.
- **Kitchen (KDS)** sees every unserved dish across all tables in three
  columns (รอคิว / กำลังปรุง / พร้อมเสิร์ฟ) and advances each one with a tap.
- **Server** sees dishes marked "พร้อมเสิร์ฟ" and marks them served, resolves
  "call staff" / "bill" requests, and sees which tables currently have an
  open order.
- **Manager** sees today's order count/revenue, manages categories & menu
  items (with an availability toggle), and manages tables — each table gets
  an auto-generated QR code linking straight to its order page.
- **Admin** creates/deactivates staff logins and assigns roles, and edits
  restaurant-wide settings (name, logo, currency).

## Data model (Firestore)

```
users/{uid}          { email, displayName, role, active, createdAt }
settings/general      { restaurantName, logoUrl, currency }
categories/{id}       { name, sortOrder, active }
menuItems/{id}         { name, description, price, categoryId, imageUrl, available, sortOrder }
tables/{id}            { number, name, seats, active }
orders/{id}             { tableId, tableNumber, sessionId, items[], subtotal, status, customerNote, createdAt, updatedAt }
  items[]: { id, menuItemId, name, price, qty, note, status }  // status: queued|cooking|ready|served|cancelled
tableRequests/{id}      { tableId, tableNumber, type, status, createdAt, resolvedAt, resolvedBy }
```

Security rules enforcing this (public menu/order read, staff-only writes,
admin-only user management) are in `firestore.rules`. Composite indexes the
app's queries need are pre-declared in `firestore.indexes.json`.

## Project setup

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase Web app config
npm run dev
```

### 1. Firebase project

1. Create a project at https://console.firebase.google.com (or use an
   existing one).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database (production mode is fine — the
   rules in this repo replace the defaults).
4. **Project settings** → General → Your apps → add a **Web app** → copy the
   config values into `.env.local` (see `.env.example`).
5. Install the Firebase CLI (`npm install -g firebase-tools`), `firebase
   login`, then `firebase use --add` to point this repo's `.firebaserc` at
   your project id (or edit `.firebaserc` directly).
6. Deploy the security rules + indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### 2. First Admin account + demo data

There's no signup form (all staff accounts are created by an Admin from
`/admin`) — so the very first Admin has to be created from the CLI:

1. Firebase Console → Project settings → Service accounts → **Generate new
   private key** → save the downloaded file as `serviceAccountKey.json` in
   the project root (already gitignored, never commit it).
2. ```bash
   npm run seed -- --email you@example.com --password "Str0ngPass!" --name "Owner"
   ```
   This creates your Admin login and a few demo categories/menu
   items/tables so you have something to click through immediately. Safe
   to re-run.
3. Log in at `/login` with that account → you'll land on `/admin`, where
   you can create the real kitchen/server/manager accounts.

### 3. Try the customer flow

Manager → "จัดการโต๊ะ" tab shows a QR code per table; click the
open-in-new-tab icon to jump straight to `/order/<tableId>` the same way a
diner's phone would after scanning it. The home page (`/`) also has a
"ไป" shortcut field for pasting a table id directly during testing.

## Deploying

- **Hosting**: `npm run build && firebase deploy --only hosting` (or use
  the included `.github/workflows/deploy.yml` GitHub Action — see below).
- **GitHub Actions**: `.github/workflows/ci.yml` runs lint + build on every
  push/PR. `.github/workflows/deploy.yml` builds and deploys to Firebase
  Hosting on manual trigger (`workflow_dispatch`) — flip it to run on
  `push: branches: [main]` once you're ready for merges to auto-deploy.
  It needs these repo secrets: the six `VITE_FIREBASE_*` values from
  `.env.example`, and `FIREBASE_SERVICE_ACCOUNT` (the JSON key content from
  step 1 above, used by the [Firebase Hosting GitHub
  Action](https://github.com/FirebaseExtended/action-hosting-deploy)).

## About the Vuetify version

`npm create vuetify@latest` currently scaffolds **Vuetify 4.x**. If your
team specifically needs to stay on the Vuetify 3.x line (e.g. to match an
existing design system or plugin), let me know and I can pin the
dependency down and adjust for any 3.x API differences — the component
usage in this app (`v-app`, `v-card`, `v-data-table`-style `v-table`,
`v-dialog`, etc.) is intentionally conventional and should port either way
with minor changes.

## Project structure

```
src/
  firebase/       Firebase app init (+ collection/enum constants)
  services/       Firestore reads/writes, grouped by feature
  stores/         Pinia stores (auth, cart, settings)
  composables/    Small reusable reactive helpers
  layouts/        StaffLayout (shared nav for the 4 staff roles)
  pages/          One folder per role + shared pages (login, 404, etc.)
  router/         Route table + role-based navigation guard
scripts/seed.mjs   One-time admin + demo-data seeding script
firestore.rules, firestore.indexes.json, firebase.json, .firebaserc
```

## Possible extensions (not built yet)

- A "close out" action for staff to mark a table's visit fully finished,
  which would also let the customer's browser session reset for the next
  guest at that table.
- Printable/exportable daily sales reports beyond the in-app overview.
- Push notifications (e.g. web push) instead of relying on staff having
  the dashboard open.
- Table-side ordering assistance (server placing an order on behalf of a
  customer) — the data model already supports it; only a UI is missing.
