/**
 * composables/useNow.js
 *
 * A reactive "current time" ref that ticks every `intervalMs`, so elapsed
 * time chips (e.g. "5 นาทีที่แล้ว" on the kitchen board) update on their
 * own instead of freezing until the next Firestore snapshot.
 */
import { onMounted, onUnmounted, ref } from 'vue'

export function useNow (intervalMs = 30_000) {
  const now = ref(Date.now())
  let timer = null
  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, intervalMs)
  })
  onUnmounted(() => clearInterval(timer))
  return now
}
