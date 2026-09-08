<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card class="pa-4" style="width: 100%; max-width: 400px;">
        <v-card-title class="text-h5 text-center">เข้าสู่ระบบพนักงาน</v-card-title>
        <v-card-subtitle class="text-center mb-2">SOrders — Staff Login</v-card-subtitle>

        <v-card-text>
          <v-alert
            v-if="suspendedNotice"
            class="mb-4"
            density="compact"
            text="บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
            type="warning"
          />

          <v-alert
            v-if="auth.error"
            class="mb-4"
            closable
            density="compact"
            :text="auth.error"
            type="error"
            @click:close="auth.error = null"
          />

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              autocomplete="username"
              label="อีเมล"
              prepend-inner-icon="mdi-email"
              required
              type="email"
              variant="outlined"
            />

            <v-text-field
              v-model="password"
              autocomplete="current-password"
              label="รหัสผ่าน"
              prepend-inner-icon="mdi-lock"
              required
              type="password"
              variant="outlined"
            />

            <v-btn
              block
              color="primary"
              :loading="auth.loading"
              size="large"
              type="submit"
            >
              เข้าสู่ระบบ
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn size="small" to="/" variant="text">กลับหน้าหลัก</v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ROLE_HOME } from '@/router'
  import { useAuthStore } from '@/stores/auth'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const email = ref('')
  const password = ref('')
  const suspendedNotice = computed(() => route.query.suspended === '1')

  async function handleLogin () {
    try {
      const profile = await auth.login(email.value.trim(), password.value)
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
      router.push(redirect || ROLE_HOME[profile.role] || '/')
    } catch {
      // auth.error already holds a friendly message; nothing else to do.
    }
  }
</script>
