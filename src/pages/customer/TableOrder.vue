<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>
        {{ settings.restaurantName || 'SOrders' }}
        <span v-if="table" class="text-body-2 font-weight-regular"> · โต๊ะ {{ table.number }}</span>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container v-if="notFound" class="text-center pt-16">
        <v-icon color="error" icon="mdi-table-off" size="64" />
        <h2 class="text-h6 mt-4">ไม่พบโต๊ะนี้</h2>
        <p class="text-body-2 text-medium-emphasis">กรุณาสแกน QR Code ที่โต๊ะอีกครั้ง</p>
      </v-container>

      <v-container v-else fluid>
        <v-tabs v-model="tab" class="mb-4" color="primary" grow>
          <v-tab value="menu">เมนูอาหาร</v-tab>

          <v-tab value="orders">
            ออเดอร์ของฉัน
            <v-badge
              v-if="myOrders.length > 0"
              class="ml-2"
              color="error"
              :content="activeItemCount"
              inline
            />
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- ================= MENU ================= -->
          <v-window-item value="menu">
            <v-chip-group v-model="activeCategory" class="mb-4" mandatory selected-class="text-primary">
              <v-chip value="all">ทั้งหมด</v-chip>
              <v-chip v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</v-chip>
            </v-chip-group>

            <v-row>
              <v-col
                v-for="item in visibleItems"
                :key="item.id"
                cols="12"
                md="4"
                sm="6"
              >
                <v-card :class="{ 'opacity-50': !item.available }">
                  <v-img v-if="item.imageUrl" cover height="140" :src="item.imageUrl" />

                  <v-card-item>
                    <v-card-title>{{ item.name }}</v-card-title>
                    <v-card-subtitle v-if="item.description">{{ item.description }}</v-card-subtitle>
                  </v-card-item>

                  <v-card-text class="d-flex align-center justify-space-between">
                    <span class="text-h6">฿{{ item.price.toLocaleString() }}</span>
                    <v-chip v-if="!item.available" color="error" size="small" variant="tonal">หมด</v-chip>
                  </v-card-text>

                  <v-card-actions v-if="item.available">
                    <v-btn
                      block
                      color="primary"
                      prepend-icon="mdi-cart-plus"
                      variant="tonal"
                      @click="openAddDialog(item)"
                    >
                      เพิ่มลงตะกร้า
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="visibleItems.length === 0" cols="12">
                <p class="text-center text-medium-emphasis py-8">ยังไม่มีเมนูในหมวดนี้</p>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- ================= MY ORDERS ================= -->
          <v-window-item value="orders">
            <p v-if="myOrders.length === 0" class="text-center text-medium-emphasis py-8">
              ยังไม่มีออเดอร์ — เลือกอาหารจากแท็บ "เมนูอาหาร"
            </p>

            <v-card v-for="order in myOrders" :key="order.id" class="mb-4">
              <v-card-item>
                <v-card-title class="text-body-1">
                  ออเดอร์ {{ formatTime(order.createdAt) }}
                </v-card-title>

                <template #append>
                  <v-chip
                    :color="order.status === 'active' ? 'warning' : 'success'"
                    size="small"
                    variant="flat"
                  >
                    {{ order.status === 'active' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น' }}
                  </v-chip>
                </template>
              </v-card-item>

              <v-list density="compact">
                <v-list-item v-for="item in order.items" :key="item.id">
                  <template #prepend>
                    <span class="text-body-2 mr-2">{{ item.qty }}x</span>
                  </template>

                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.note">หมายเหตุ: {{ item.note }}</v-list-item-subtitle>

                  <template #append>
                    <v-chip :color="ITEM_STATUS_COLORS[item.status]" size="small" variant="tonal">
                      {{ ITEM_STATUS_LABELS_TH[item.status] }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>

              <v-card-text class="text-right text-subtitle-1 font-weight-bold">
                รวม ฿{{ order.subtotal.toLocaleString() }}
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>

    <!-- Bottom cart bar -->
    <v-bottom-sheet v-if="cart.itemCount > 0 && !notFound" :model-value="true" persistent scrim="transparent">
      <v-sheet class="pa-3 d-flex align-center" color="primary" style="pointer-events:auto;">
        <span class="text-white">{{ cart.itemCount }} รายการ · ฿{{ cart.subtotal.toLocaleString() }}</span>
        <v-spacer />
        <v-btn color="white" variant="flat" @click="cartOpen = true">ดูตะกร้า</v-btn>
      </v-sheet>
    </v-bottom-sheet>

    <!-- Help / bill FABs -->
    <div v-if="!notFound" class="d-flex flex-column ga-2" style="position: fixed; left: 16px; bottom: 88px;">
      <v-btn
        color="secondary"
        prepend-icon="mdi-hand-back-right"
        size="small"
        variant="flat"
        @click="sendRequest('call_staff')"
      >
        เรียกพนักงาน
      </v-btn>

      <v-btn
        color="secondary"
        prepend-icon="mdi-receipt"
        size="small"
        variant="flat"
        @click="sendRequest('request_bill')"
      >
        ขอเช็คบิล
      </v-btn>
    </div>

    <v-snackbar v-model="requestSnackbar" timeout="2500">{{ requestSnackbarText }}</v-snackbar>

    <!-- Add-to-cart dialog -->
    <v-dialog v-model="addDialog" max-width="420">
      <v-card v-if="selectedItem">
        <v-card-title>{{ selectedItem.name }}</v-card-title>

        <v-card-text>
          <div class="d-flex align-center justify-center ga-4 my-2">
            <v-btn icon="mdi-minus" variant="tonal" @click="qty = Math.max(1, qty - 1)" />
            <span class="text-h5">{{ qty }}</span>
            <v-btn icon="mdi-plus" variant="tonal" @click="qty++" />
          </div>

          <v-textarea
            v-model="note"
            label="หมายเหตุ (เช่น ไม่เผ็ด, ไม่ใส่ผัก)"
            rows="2"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addDialog = false">ยกเลิก</v-btn>

          <v-btn color="primary" variant="flat" @click="confirmAdd">
            เพิ่ม (฿{{ (selectedItem.price * qty).toLocaleString() }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cart dialog -->
    <v-dialog v-model="cartOpen" max-width="480">
      <v-card>
        <v-card-title>ตะกร้าของคุณ</v-card-title>

        <v-list>
          <v-list-item v-for="(item, idx) in cart.items" :key="idx">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle v-if="item.note">{{ item.note }}</v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center ga-1">
                <v-btn
                  density="compact"
                  icon="mdi-minus"
                  size="small"
                  variant="text"
                  @click="cart.updateQty(idx, item.qty - 1)"
                />

                <span>{{ item.qty }}</span>

                <v-btn
                  density="compact"
                  icon="mdi-plus"
                  size="small"
                  variant="text"
                  @click="cart.updateQty(idx, item.qty + 1)"
                />

                <span class="ml-2" style="min-width: 64px; text-align: right;">฿{{ (item.qty * item.price).toLocaleString() }}</span>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-card-text>
          <v-textarea
            v-model="customerNote"
            label="หมายเหตุถึงร้าน (ทั้งออเดอร์)"
            rows="2"
            variant="outlined"
          />

          <div class="d-flex justify-space-between text-h6">
            <span>รวมทั้งหมด</span>
            <span>฿{{ cart.subtotal.toLocaleString() }}</span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="text" @click="cartOpen = false">ปิด</v-btn>
          <v-spacer />

          <v-btn
            color="primary"
            :loading="placing"
            variant="flat"
            @click="submitOrder"
          >
            สั่งอาหาร
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { ITEM_STATUS_COLORS, ITEM_STATUS_LABELS_TH, REQUEST_TYPE_LABELS_TH } from '@/firebase/collections'
  import { subscribeCategories, subscribeMenuItems } from '@/services/menuService'
  import { placeOrder, subscribeCustomerOrders } from '@/services/orderService'
  import { createRequest } from '@/services/requestService'
  import { getTable } from '@/services/tableService'
  import { useCartStore } from '@/stores/cart'
  import { useSettingsStore } from '@/stores/settings'
  import { getOrCreateSessionId } from '@/utils/session'

  const props = defineProps({ tableId: { type: String, required: true } })

  const settings = useSettingsStore()
  const cart = useCartStore()
  settings.subscribe()
  cart.setTable(props.tableId)

  const table = ref(null)
  const notFound = ref(false)
  const categories = ref([])
  const menuItems = ref([])
  const myOrders = ref([])
  const tab = ref('menu')
  const activeCategory = ref('all')

  const sessionId = getOrCreateSessionId(props.tableId)
  let unsubs = []

  onMounted(async () => {
    table.value = await getTable(props.tableId)
    if (!table.value) {
      notFound.value = true
      return
    }
    unsubs = [
      subscribeCategories(list => {
        categories.value = list
      }),
      subscribeMenuItems(list => {
        menuItems.value = list
      }),
      subscribeCustomerOrders(props.tableId, sessionId, list => {
        myOrders.value = list
      }),
    ]
  })
  onUnmounted(() => {
    for (const u of unsubs) u()
  })

  const visibleItems = computed(() => menuItems.value.filter(
    i => activeCategory.value === 'all' || i.categoryId === activeCategory.value,
  ))
  const activeItemCount = computed(() => myOrders.value
    .flatMap(o => o.items)
    .filter(i => i.status !== 'served' && i.status !== 'cancelled')
    .length)

  // ---- add to cart ----
  const addDialog = ref(false)
  const selectedItem = ref(null)
  const qty = ref(1)
  const note = ref('')
  function openAddDialog (item) {
    selectedItem.value = item
    qty.value = 1
    note.value = ''
    addDialog.value = true
  }
  function confirmAdd () {
    cart.addItem(selectedItem.value, qty.value, note.value.trim())
    addDialog.value = false
  }

  // ---- cart / checkout ----
  const cartOpen = ref(false)
  const customerNote = ref('')
  const placing = ref(false)
  async function submitOrder () {
    placing.value = true
    try {
      await placeOrder({
        tableId: props.tableId,
        tableNumber: table.value.number,
        sessionId,
        items: cart.items,
        customerNote: customerNote.value.trim(),
      })
      cart.clear()
      customerNote.value = ''
      cartOpen.value = false
      tab.value = 'orders'
    } finally {
      placing.value = false
    }
  }

  // ---- call staff / bill ----
  const requestSnackbar = ref(false)
  const requestSnackbarText = ref('')
  async function sendRequest (type) {
    await createRequest({ tableId: props.tableId, tableNumber: table.value?.number, type })
    requestSnackbarText.value = `แจ้ง "${REQUEST_TYPE_LABELS_TH[type]}" แล้ว พนักงานจะมาโดยเร็วที่สุด`
    requestSnackbar.value = true
  }

  function formatTime (ts) {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }
</script>
