<template>
  <StaffLayout title="ผู้ดูแลระบบ">
    <v-tabs v-model="tab" class="mb-4" color="primary">
      <v-tab value="users">จัดการบัญชีพนักงาน</v-tab>
      <v-tab value="settings">ตั้งค่าร้าน</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="users"><UserManagement /></v-window-item>
      <v-window-item value="settings"><SettingsPanel /></v-window-item>
    </v-window>
  </StaffLayout>
</template>

<script setup>
  import { ref } from 'vue'
  import StaffLayout from '@/layouts/StaffLayout.vue'
  import SettingsPanel from './SettingsPanel.vue'
  import UserManagement from './UserManagement.vue'

  const tab = ref('users')
</script>
