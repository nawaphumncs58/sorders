<template>
  <v-card max-width="480">
    <v-card-title>ตั้งค่าร้าน</v-card-title>

    <v-card-text>
      <v-text-field v-model="form.restaurantName" label="ชื่อร้าน" variant="outlined" />
      <v-text-field v-model="form.logoUrl" label="URL โลโก้ (ถ้ามี)" variant="outlined" />
      <v-select v-model="form.currency" :items="['THB']" label="สกุลเงิน" variant="outlined" />
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :loading="saving" variant="flat" @click="save">บันทึก</v-btn>
    </v-card-actions>

    <v-snackbar v-model="saved" timeout="2000">บันทึกเรียบร้อย</v-snackbar>
  </v-card>
</template>

<script setup>
  import { reactive, ref, watch } from 'vue'
  import { useSettingsStore } from '@/stores/settings'

  const settings = useSettingsStore()
  settings.subscribe()

  const form = reactive({ restaurantName: '', logoUrl: '', currency: 'THB' })
  watch(() => settings.loaded, loaded => {
    if (loaded) Object.assign(form, {
      restaurantName: settings.restaurantName,
      logoUrl: settings.logoUrl,
      currency: settings.currency,
    })
  }, { immediate: true })

  const saving = ref(false)
  const saved = ref(false)
  async function save () {
    saving.value = true
    try {
      await settings.save({ ...form })
      saved.value = true
    } finally {
      saving.value = false
    }
  }
</script>
