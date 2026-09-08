<template>
  <StaffLayout title="พนักงานเสิร์ฟ">
    <v-row>
      <!-- Ready to serve -->
      <v-col cols="12" md="7">
        <h3 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
          <v-icon class="mr-1" color="success" icon="mdi-bell-ring" />
          พร้อมเสิร์ฟ
          <v-chip class="ml-2" size="x-small">{{ readyItems.length }}</v-chip>
        </h3>

        <v-card v-for="entry in readyItems" :key="entry.item.id" class="mb-3" variant="outlined">
          <v-card-item>
            <v-card-title class="d-flex justify-space-between">
              <span>โต๊ะ {{ entry.order.tableNumber }} — {{ entry.item.qty }}x {{ entry.item.name }}</span>
            </v-card-title>

            <v-card-subtitle v-if="entry.item.note">หมายเหตุ: {{ entry.item.note }}</v-card-subtitle>
          </v-card-item>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" size="small" variant="flat" @click="markServed(entry)">เสิร์ฟแล้ว</v-btn>
          </v-card-actions>
        </v-card>

        <p v-if="readyItems.length === 0" class="text-medium-emphasis text-body-2">— ไม่มีรายการรอเสิร์ฟ —</p>
      </v-col>

      <!-- Table requests -->
      <v-col cols="12" md="5">
        <h3 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
          <v-icon class="mr-1" color="secondary" icon="mdi-hand-back-right" />
          คำขอจากลูกค้า
          <v-chip class="ml-2" size="x-small">{{ requests.length }}</v-chip>
        </h3>

        <v-card v-for="req in requests" :key="req.id" class="mb-3" variant="outlined">
          <v-card-item>
            <v-card-title>โต๊ะ {{ req.tableNumber }} — {{ REQUEST_TYPE_LABELS_TH[req.type] }}</v-card-title>
            <v-card-subtitle>{{ elapsed(req.createdAt) }}</v-card-subtitle>
          </v-card-item>

          <v-card-actions>
            <v-spacer />
            <v-btn size="small" variant="text" @click="resolve(req)">รับทราบ</v-btn>
          </v-card-actions>
        </v-card>

        <p v-if="requests.length === 0" class="text-medium-emphasis text-body-2">— ไม่มีคำขอ —</p>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
          <v-icon class="mr-1" icon="mdi-table-furniture" />
          สถานะโต๊ะ
        </h3>

        <v-row dense>
          <v-col v-for="t in tables" :key="t.id" cols="4" sm="3">
            <v-card
              class="text-center pa-2"
              :color="tableHasActiveOrder(t.id) ? 'warning' : undefined"
              variant="tonal"
            >
              <div class="text-body-2 font-weight-bold">{{ t.number }}</div>
              <div class="text-caption">{{ tableHasActiveOrder(t.id) ? 'มีลูกค้า' : 'ว่าง' }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </StaffLayout>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useNow } from '@/composables/useNow'
  import { ITEM_STATUS, REQUEST_TYPE_LABELS_TH } from '@/firebase/collections'
  import StaffLayout from '@/layouts/StaffLayout.vue'
  import { subscribeActiveOrders, updateItemStatus } from '@/services/orderService'
  import { resolveRequest, subscribeOpenRequests } from '@/services/requestService'
  import { subscribeTables } from '@/services/tableService'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
  const orders = ref([])
  const requests = ref([])
  const tables = ref([])
  const now = useNow()
  let unsubs = []

  onMounted(() => {
    unsubs = [
      subscribeActiveOrders(list => {
        orders.value = list
      }),
      subscribeOpenRequests(list => {
        requests.value = list
      }),
      subscribeTables(list => {
        tables.value = list
      }),
    ]
  })
  onUnmounted(() => {
    for (const u of unsubs) u()
  })

  const readyItems = computed(() => orders.value
    .flatMap(order => order.items.map(item => ({ order, item })))
    .filter(entry => entry.item.status === ITEM_STATUS.READY))

  function tableHasActiveOrder (tableId) {
    return orders.value.some(o => o.tableId === tableId)
  }

  function markServed (entry) {
    updateItemStatus(entry.order.id, entry.item.id, ITEM_STATUS.SERVED)
  }

  function resolve (req) {
    resolveRequest(req.id, auth.user?.uid)
  }

  function elapsed (ts) {
    if (!ts?.toDate) return ''
    void now.value
    const mins = Math.max(0, Math.round((Date.now() - ts.toDate().getTime()) / 60_000))
    return mins === 0 ? 'เมื่อสักครู่' : `${mins} นาทีที่แล้ว`
  }
</script>
