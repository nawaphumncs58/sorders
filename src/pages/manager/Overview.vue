<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card class="pa-4" variant="tonal">
          <div class="text-body-2 text-medium-emphasis">ออเดอร์วันนี้</div>
          <div class="text-h4 font-weight-bold">{{ todayOrders.length }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4" color="primary" variant="tonal">
          <div class="text-body-2 text-medium-emphasis">ยอดขายวันนี้</div>
          <div class="text-h4 font-weight-bold">฿{{ todayRevenue.toLocaleString() }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4" color="warning" variant="tonal">
          <div class="text-body-2 text-medium-emphasis">กำลังดำเนินการอยู่</div>
          <div class="text-h4 font-weight-bold">{{ activeCount }}</div>
        </v-card>
      </v-col>
    </v-row>

    <h3 class="text-subtitle-1 font-weight-bold mt-6 mb-2">ออเดอร์ล่าสุด</h3>

    <v-table density="comfortable">
      <thead>
        <tr>
          <th>เวลา</th>
          <th>โต๊ะ</th>
          <th>รายการ</th>
          <th class="text-right">ยอดรวม</th>
          <th>สถานะ</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="order in todayOrders.slice(0, 20)" :key="order.id">
          <td>{{ formatTime(order.createdAt) }}</td>
          <td>{{ order.tableNumber }}</td>
          <td>{{ order.items.map(i => `${i.qty}x ${i.name}`).join(', ') }}</td>
          <td class="text-right">฿{{ order.subtotal.toLocaleString() }}</td>

          <td>
            <v-chip :color="order.status === 'active' ? 'warning' : 'success'" size="small" variant="tonal">
              {{ order.status === 'active' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น' }}
            </v-chip>
          </td>
        </tr>

        <tr v-if="todayOrders.length === 0">
          <td class="text-center text-medium-emphasis" colspan="5">ยังไม่มีออเดอร์วันนี้</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { subscribeOrdersSince } from '@/services/orderService'

  const orders = ref([])
  let unsub = null
  onMounted(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    unsub = subscribeOrdersSince(startOfToday, list => {
      orders.value = list
    })
  })
  onUnmounted(() => unsub?.())

  const todayOrders = computed(() => orders.value.filter(o => o.status !== 'cancelled'))
  const todayRevenue = computed(() => todayOrders.value.reduce((sum, o) => sum + (o.subtotal || 0), 0))
  const activeCount = computed(() => orders.value.filter(o => o.status === 'active').length)

  function formatTime (ts) {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }
</script>
