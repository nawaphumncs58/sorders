<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">บัญชีพนักงานทั้งหมด</h3>

      <v-btn color="primary" prepend-icon="mdi-account-plus" variant="tonal" @click="openCreateDialog">
        เพิ่มบัญชี
      </v-btn>
    </div>

    <v-table density="comfortable">
      <thead>
        <tr>
          <th>ชื่อ</th>
          <th>อีเมล</th>
          <th>บทบาท</th>
          <th>สถานะ</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.displayName }}</td>
          <td>{{ u.email }}</td>

          <td style="max-width: 180px;">
            <v-select
              density="compact"
              hide-details
              :items="roleOptions"
              :model-value="u.role"
              variant="underlined"
              @update:model-value="v => setUserRole(u.id, v)"
            />
          </td>

          <td>
            <v-switch
              color="success"
              density="compact"
              hide-details
              :model-value="u.active"
              @update:model-value="v => setUserActive(u.id, v)"
            />
          </td>
        </tr>

        <tr v-if="users.length === 0">
          <td class="text-center text-medium-emphasis" colspan="4">ยังไม่มีบัญชีพนักงาน</td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="createDialog" max-width="420">
      <v-card>
        <v-card-title>เพิ่มบัญชีพนักงาน</v-card-title>

        <v-card-text>
          <v-alert
            v-if="createError"
            class="mb-3"
            density="compact"
            :text="createError"
            type="error"
          />

          <v-text-field v-model="form.displayName" label="ชื่อ-นามสกุล" variant="outlined" />
          <v-text-field v-model="form.email" label="อีเมล" type="email" variant="outlined" />

          <v-text-field
            v-model="form.password"
            hint="อย่างน้อย 6 ตัวอักษร"
            label="รหัสผ่านชั่วคราว"
            type="password"
            variant="outlined"
          />

          <v-select v-model="form.role" :items="roleOptions" label="บทบาท" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" :loading="creating" variant="flat" @click="submitCreate">สร้างบัญชี</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { ROLE_LABELS_TH, ROLES } from '@/firebase/collections'
  import { setUserActive, setUserRole, subscribeUsers } from '@/services/userService'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
  const users = ref([])
  let unsub = null
  onMounted(() => {
    unsub = subscribeUsers(list => {
      users.value = list
    })
  })
  onUnmounted(() => unsub?.())

  const roleOptions = Object.values(ROLES).map(value => ({ value, title: ROLE_LABELS_TH[value] }))

  const createDialog = ref(false)
  const creating = ref(false)
  const createError = ref('')
  const form = ref({ displayName: '', email: '', password: '', role: ROLES.SERVER })

  function openCreateDialog () {
    form.value = { displayName: '', email: '', password: '', role: ROLES.SERVER }
    createError.value = ''
    createDialog.value = true
  }

  async function submitCreate () {
    creating.value = true
    createError.value = ''
    try {
      await auth.createStaffAccount({ ...form.value })
      createDialog.value = false
    } catch (error_) {
      createError.value = error_?.message || 'สร้างบัญชีไม่สำเร็จ'
    } finally {
      creating.value = false
    }
  }
</script>
