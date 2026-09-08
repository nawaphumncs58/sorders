<template>
  <StaffLayout title="ผู้จัดการร้าน">
    <v-tabs v-model="tab" class="mb-4" color="primary">
      <v-tab value="overview">ภาพรวม</v-tab>
      <v-tab value="menu">จัดการเมนู</v-tab>
      <v-tab value="tables">จัดการโต๊ะ</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="overview"><Overview /></v-window-item>
      <v-window-item value="menu"><MenuManagement /></v-window-item>
      <v-window-item value="tables"><TableManagement /></v-window-item>
    </v-window>
  </StaffLayout>
</template>

<script setup>
  import { ref } from 'vue'
  import StaffLayout from '@/layouts/StaffLayout.vue'
  import MenuManagement from './MenuManagement.vue'
  import Overview from './Overview.vue'
  import TableManagement from './TableManagement.vue'

  const tab = ref('overview')
</script>
