<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-container class="text-center" style="max-width: 480px;">
        <v-icon color="primary" icon="mdi-silverware-fork-knife" size="72" />
        <h1 class="text-h4 font-weight-bold mt-4">{{ settings.restaurantName || 'SOrders' }}</h1>

        <p class="text-body-1 text-medium-emphasis mt-2">
          ระบบสั่งอาหารออนไลน์ — สแกน QR Code ที่โต๊ะเพื่อเริ่มสั่งอาหาร
        </p>

        <v-card class="mt-8 pa-4" variant="outlined">
          <v-card-text>
            <p class="text-body-2 mb-3">ทดสอบระบบลูกค้าโดยไม่ต้องสแกน QR:</p>

            <v-form class="d-flex ga-2" @submit.prevent="goToTable">
              <v-text-field
                v-model="demoTableId"
                density="compact"
                hide-details
                label="รหัสโต๊ะ (Table ID)"
                variant="outlined"
              />

              <v-btn color="primary" type="submit">ไป</v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-btn class="mt-6" prepend-icon="mdi-login" to="/login" variant="text">
          เข้าสู่ระบบสำหรับพนักงาน
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSettingsStore } from '@/stores/settings'

  const router = useRouter()
  const settings = useSettingsStore()
  settings.subscribe()

  const demoTableId = ref('')
  function goToTable () {
    if (demoTableId.value.trim()) {
      router.push(`/order/${demoTableId.value.trim()}`)
    }
  }
</script>
