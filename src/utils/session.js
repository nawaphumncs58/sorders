/**
 * utils/session.js
 *
 * A lightweight, anonymous "visit id" for a customer's phone at a given
 * table, persisted in localStorage. It's what lets the customer page
 * query "my orders" (tableId + sessionId) without requiring a login.
 *
 * It intentionally does NOT expire on its own — a table is considered a
 * fresh visit again once staff mark it available/cleared in a future
 * iteration (see README "Possible extensions"). For now it simply
 * survives page refreshes during the meal.
 */
function storageKey (tableId) {
  return `sorders_session_${tableId}`
}

export function getOrCreateSessionId (tableId) {
  const key = storageKey(tableId)
  let id = localStorage.getItem(key)
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(key, id)
  }
  return id
}

export function resetSession (tableId) {
  localStorage.removeItem(storageKey(tableId))
}
