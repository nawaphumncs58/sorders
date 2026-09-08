<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-nav-icon
        v-if="$vuetify.display.mobile"
        @click="drawer = !drawer"
      />

      <v-app-bar-title>{{ title }}</v-app-bar-title>
      <v-spacer />
      <span class="text-body-2 mr-2 d-none d-sm-inline">{{ auth.displayName }}</span>
      <v-chip class="mr-2" size="small" variant="flat">{{ roleLabel }}</v-chip>
      <v-btn icon="mdi-logout" title="ออกจากระบบ" @click="handleLogout" />
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :permanent="!$vuetify.display.mobile"
    >
      <v-list density="comfortable" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :active="route.path === item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ROLE_LABELS_TH } from '@/firebase/collections'
  import { useAuthStore } from '@/stores/auth'

  defineProps({
    title: { type: String, default: 'SOrders' },
  })

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const drawer = ref(true)

  const roleLabel = computed(() => ROLE_LABELS_TH[auth.role] || auth.role)

  const allNavItems = [
    { to: '/kitchen', title: 'ครัว (KDS)', icon: 'mdi-chef-hat', roles: ['kitchen'] },
    { to: '/server', title: 'พนักงานเสิร์ฟ', icon: 'mdi-room-service', roles: ['server'] },
    { to: '/manager', title: 'ผู้จัดการร้าน', icon: 'mdi-store', roles: ['manager'] },
    { to: '/admin', title: 'ผู้ดูแลระบบ', icon: 'mdi-shield-account', roles: ['admin'] },
  ]

  // Admin can jump between every staff area; others only see their own.
  const navItems = computed(() => auth.isAdmin
    ? allNavItems
    : allNavItems.filter(item => item.roles.includes(auth.role)))

  async function handleLogout () {
    await auth.logout()
    router.push('/login')
  }
</script>
