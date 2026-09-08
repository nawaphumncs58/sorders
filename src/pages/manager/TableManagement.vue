<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">โต๊ะทั้งหมด</h3>
      <v-btn color="primary" prepend-icon="mdi-plus" variant="tonal" @click="openTableDialog()">เพิ่มโต๊ะ</v-btn>
    </div>

    <v-row>
      <v-col
        v-for="t in tables"
        :key="t.id"
        cols="6"
        md="3"
        sm="4"
      >
        <v-card class="text-center pa-3">
          <div class="text-h6">โต๊ะ {{ t.number }}</div>
          <div class="text-caption text-medium-emphasis mb-2">{{ t.seats }} ที่นั่ง</div>
          <qrcode-vue :size="120" :value="orderUrl(t.id)" />

          <div class="d-flex justify-center ga-1 mt-2">
            <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openTableDialog(t)" />
            <v-btn icon="mdi-open-in-new" size="x-small" variant="text" @click="openLink(t)" />
            <v-btn icon="mdi-delete" size="x-small" variant="text" @click="removeTable(t)" />
          </div>
        </v-card>
      </v-col>

      <v-col v-if="tables.length === 0" cols="12">
        <p class="text-center text-medium-emphasis py-8">ยังไม่มีโต๊ะ — กดปุ่ม "เพิ่มโต๊ะ" เพื่อเริ่มต้น</p>
      </v-col>
    </v-row>

    <v-dialog v-model="tableDialog" max-width="400">
      <v-card>
        <v-card-title>{{ editingTable ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะ' }}</v-card-title>

        <v-card-text>
          <v-text-field v-model="tableForm.number" label="หมายเลข/ชื่อโต๊ะ" variant="outlined" />
          <v-text-field v-model.number="tableForm.seats" label="จำนวนที่นั่ง" type="number" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="tableDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" @click="saveTable">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import QrcodeVue from 'qrcode.vue'
  import { onMounted, onUnmounted, ref } from 'vue'
  import { createTable, deleteTable, subscribeTables, updateTable } from '@/services/tableService'

  const tables = ref([])
  let unsub = null
  onMounted(() => {
    unsub = subscribeTables(list => {
      tables.value = list
    })
  })
  onUnmounted(() => unsub?.())

  function orderUrl (tableId) {
    return `${window.location.origin}/order/${tableId}`
  }
  function openLink (t) {
    window.open(orderUrl(t.id), '_blank')
  }

  const tableDialog = ref(false)
  const editingTable = ref(null)
  const tableForm = ref({ number: '', seats: 4 })
  function openTableDialog (t = null) {
    editingTable.value = t
    tableForm.value = t ? { number: t.number, seats: t.seats } : { number: '', seats: 4 }
    tableDialog.value = true
  }
  async function saveTable () {
    if (!tableForm.value.number) return
    await (editingTable.value ? updateTable(editingTable.value.id, tableForm.value) : createTable(tableForm.value))
    tableDialog.value = false
  }
  async function removeTable (t) {
    if (confirm(`ลบโต๊ะ ${t.number}?`)) await deleteTable(t.id)
  }
</script>
