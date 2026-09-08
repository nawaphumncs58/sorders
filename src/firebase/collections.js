/**
 * firebase/collections.js
 *
 * Single source of truth for Firestore collection names and the shape of
 * the documents SOrders reads/writes. Keeping this centralized avoids
 * typos like 'menuItem' vs 'menuItems' spreading across the codebase.
 */

export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menuItems',
  TABLES: 'tables',
  ORDERS: 'orders',
  TABLE_REQUESTS: 'tableRequests',
  SETTINGS: 'settings',
}

// Staff roles. 'admin' implicitly has access to every staff area (see
// router guards) so it does not need to be listed on each route.
export const ROLES = {
  KITCHEN: 'kitchen',
  SERVER: 'server',
  MANAGER: 'manager',
  ADMIN: 'admin',
}

export const ROLE_LABELS_TH = {
  [ROLES.KITCHEN]: 'แม่ครัว',
  [ROLES.SERVER]: 'พนักงานเสิร์ฟ',
  [ROLES.MANAGER]: 'ผู้จัดการร้าน',
  [ROLES.ADMIN]: 'ผู้ดูแลระบบ',
}

// Per-dish kitchen workflow status.
export const ITEM_STATUS = {
  QUEUED: 'queued', // รอคิว
  COOKING: 'cooking', // กำลังปรุง
  READY: 'ready', // พร้อมเสิร์ฟ
  SERVED: 'served', // เสิร์ฟแล้ว
  CANCELLED: 'cancelled',
}

export const ITEM_STATUS_LABELS_TH = {
  [ITEM_STATUS.QUEUED]: 'รอคิว',
  [ITEM_STATUS.COOKING]: 'กำลังปรุง',
  [ITEM_STATUS.READY]: 'พร้อมเสิร์ฟ',
  [ITEM_STATUS.SERVED]: 'เสิร์ฟแล้ว',
  [ITEM_STATUS.CANCELLED]: 'ยกเลิก',
}

export const ITEM_STATUS_COLORS = {
  [ITEM_STATUS.QUEUED]: 'grey',
  [ITEM_STATUS.COOKING]: 'warning',
  [ITEM_STATUS.READY]: 'success',
  [ITEM_STATUS.SERVED]: 'primary',
  [ITEM_STATUS.CANCELLED]: 'error',
}

// Order-level status. 'active' = at least one item not yet served,
// 'closed' = every item served/cancelled (table can be checked out).
export const ORDER_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
}

export const REQUEST_TYPE = {
  CALL_STAFF: 'call_staff',
  REQUEST_BILL: 'request_bill',
}

export const REQUEST_TYPE_LABELS_TH = {
  [REQUEST_TYPE.CALL_STAFF]: 'เรียกพนักงาน',
  [REQUEST_TYPE.REQUEST_BILL]: 'ขอเช็คบิล',
}
