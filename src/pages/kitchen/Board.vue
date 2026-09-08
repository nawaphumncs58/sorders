<template>
  <StaffLayout title="ครัว — Kitchen Display">
    <v-row>
      <v-col v-for="col in columns" :key="col.status" cols="12" md="4">
        <h3 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
          <v-icon class="mr-1" :color="col.color" :icon="col.icon" />
          {{ col.title }}
          <v-chip class="ml-2" size="x-small">{{ col.items.length }}</v-chip>
        </h3>

        <v-card
          v-for="entry in col.items"
          :key="entry.item.id"
          class="mb-3"
          :color="col.status === 'queued' ? undefined : undefined"
          variant="outlined"
        >
          <v-card-item>
            <v-card-title class="d-flex justify-space-between">
              <span>โต๊ะ {{ entry.order.tableNumber }}</span>
              <span class="text-caption text-medium-emphasis">{{ elapsed(entry.order.createdAt) }}</span>
            </v-card-title>

            <v-card-subtitle>{{ entry.item.qty }}x {{ entry.item.name }}</v-card-subtitle>
          </v-card-item>

          <v-card-text v-if="entry.item.note" class="py-0 text-body-2">
            หมายเหตุ: {{ entry.item.note }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn
              v-if="col.status === 'queued'"
              color="warning"
              size="small"
              variant="flat"
              @click="advance(entry, 'cooking')"
            >
              เริ่มปรุง
            </v-btn>

            <v-btn
              v-if="col.status === 'cooking'"
              color="success"
              size="small"
              variant="flat"
              @click="advance(entry, 'ready')"
            >
              พร้อมเสิร์ฟ
            </v-btn>
          </v-card-actions>
        </v-card>

        <p v-if="col.items.length === 0" class="text-medium-emphasis text-body-2">— ไม่มีรายการ —</p>
      </v-col>
    </v-row>
  </StaffLayout>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useNow } from '@/composables/useNow'
  import { ITEM_STATUS } from '@/firebase/collections'
  import StaffLayout from '@/layouts/StaffLayout.vue'
  import { subscribeActiveOrders, updateItemStatus } from '@/services/orderService'

  const orders = ref([])
  const now = useNow()
  let unsub = null
  onMounted(() => {
    unsub = subscribeActiveOrders(list => {
      orders.value = list
    })
  })
  onUnmounted(() => unsub?.())

  // Flatten order.items into { order, item } pairs, kitchen only cares
  // about dishes not yet ready (server takes over from 'ready' onward).
  function itemsWithStatus (status) {
    return orders.value
      .flatMap(order => order.items.map(item => ({ order, item })))
      .filter(entry => entry.item.status === status)
  }

  const columns = computed(() => [
    { status: ITEM_STATUS.QUEUED, title: 'รอคิว', icon: 'mdi-timer-sand', color: 'grey', items: itemsWithStatus(ITEM_STATUS.QUEUED) },
    { status: ITEM_STATUS.COOKING, title: 'กำลังปรุง', icon: 'mdi-pot-steam', color: 'warning', items: itemsWithStatus(ITEM_STATUS.COOKING) },
    { status: ITEM_STATUS.READY, title: 'พร้อมเสิร์ฟ', icon: 'mdi-check-circle', color: 'success', items: itemsWithStatus(ITEM_STATUS.READY) },
  ])

  function advance (entry, newStatus) {
    updateItemStatus(entry.order.id, entry.item.id, newStatus)
  }

  function elapsed (ts) {
    if (!ts?.toDate) return ''
    void now.value // reactive dependency so this re-evaluates as time passes
    const mins = Math.max(0, Math.round((Date.now() - ts.toDate().getTime()) / 60_000))
    return `${mins} นาทีที่แล้ว`
  }
</script>
