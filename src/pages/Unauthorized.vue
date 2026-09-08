<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-container class="text-center">
        <v-icon color="error" icon="mdi-lock-alert" size="64" />
        <h1 class="text-h5 mt-4">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>

        <p class="text-body-2 text-medium-emphasis mt-2">
          บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนนี้ของระบบ
        </p>

        <v-btn class="mt-6" color="primary" to="/login" variant="tonal">กลับไปหน้าเข้าสู่ระบบ</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
</script>
