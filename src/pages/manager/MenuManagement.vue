<template>
  <div>
    <v-row>
      <!-- Categories -->
      <v-col cols="12" md="4">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-1 font-weight-bold">หมวดหมู่</h3>
          <v-btn icon="mdi-plus" size="small" variant="tonal" @click="openCategoryDialog()" />
        </div>

        <v-list density="compact">
          <v-list-item v-for="c in categories" :key="c.id">
            <v-list-item-title>{{ c.name }}</v-list-item-title>

            <template #append>
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openCategoryDialog(c)" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" @click="removeCategory(c)" />
            </template>
          </v-list-item>

          <v-list-item v-if="categories.length === 0">
            <span class="text-medium-emphasis">ยังไม่มีหมวดหมู่</span>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Menu items -->
      <v-col cols="12" md="8">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-1 font-weight-bold">เมนูอาหาร</h3>

          <v-btn
            :disabled="categories.length === 0"
            icon="mdi-plus"
            size="small"
            variant="tonal"
            @click="openItemDialog()"
          />
        </div>

        <p v-if="categories.length === 0" class="text-medium-emphasis text-body-2">
          กรุณาสร้างหมวดหมู่อย่างน้อย 1 หมวดก่อนเพิ่มเมนู
        </p>

        <v-table v-else density="comfortable">
          <thead>
            <tr>
              <th>ชื่อเมนู</th>
              <th>หมวดหมู่</th>
              <th class="text-right">ราคา</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in menuItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ categoryName(item.categoryId) }}</td>
              <td class="text-right">฿{{ item.price.toLocaleString() }}</td>

              <td>
                <v-switch
                  color="success"
                  density="compact"
                  hide-details
                  :model-value="item.available"
                  @update:model-value="v => updateMenuItem(item.id, { available: v })"
                />
              </td>

              <td>
                <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openItemDialog(item)" />
                <v-btn icon="mdi-delete" size="x-small" variant="text" @click="removeItem(item)" />
              </td>
            </tr>

            <tr v-if="menuItems.length === 0">
              <td class="text-center text-medium-emphasis" colspan="5">ยังไม่มีเมนู</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <!-- Category dialog -->
    <v-dialog v-model="categoryDialog" max-width="400">
      <v-card>
        <v-card-title>{{ editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่' }}</v-card-title>

        <v-card-text>
          <v-text-field v-model="categoryForm.name" label="ชื่อหมวดหมู่" variant="outlined" />
          <v-text-field v-model.number="categoryForm.sortOrder" label="ลำดับการแสดง" type="number" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="categoryDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" @click="saveCategory">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu item dialog -->
    <v-dialog v-model="itemDialog" max-width="480">
      <v-card>
        <v-card-title>{{ editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนู' }}</v-card-title>

        <v-card-text>
          <v-text-field v-model="itemForm.name" label="ชื่อเมนู" variant="outlined" />
          <v-textarea v-model="itemForm.description" label="รายละเอียด" rows="2" variant="outlined" />
          <v-text-field v-model.number="itemForm.price" label="ราคา (บาท)" type="number" variant="outlined" />

          <v-select
            v-model="itemForm.categoryId"
            item-title="name"
            item-value="id"
            :items="categories"
            label="หมวดหมู่"
            variant="outlined"
          />

          <v-text-field v-model="itemForm.imageUrl" label="URL รูปภาพ (ถ้ามี)" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="itemDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" @click="saveItem">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import {
    createCategory, createMenuItem, deleteCategory, deleteMenuItem,
    subscribeCategories, subscribeMenuItems, updateCategory, updateMenuItem,
  } from '@/services/menuService'

  const categories = ref([])
  const menuItems = ref([])
  let unsubs = []
  onMounted(() => {
    unsubs = [
      subscribeCategories(list => {
        categories.value = list
      }),
      subscribeMenuItems(list => {
        menuItems.value = list
      }),
    ]
  })
  onUnmounted(() => {
    for (const u of unsubs) u()
  })

  function categoryName (id) {
    return categories.value.find(c => c.id === id)?.name || '—'
  }

  // ---- category dialog ----
  const categoryDialog = ref(false)
  const editingCategory = ref(null)
  const categoryForm = ref({ name: '', sortOrder: 0 })
  function openCategoryDialog (c = null) {
    editingCategory.value = c
    categoryForm.value = c ? { name: c.name, sortOrder: c.sortOrder } : { name: '', sortOrder: categories.value.length }
    categoryDialog.value = true
  }
  async function saveCategory () {
    if (!categoryForm.value.name.trim()) return
    await (editingCategory.value ? updateCategory(editingCategory.value.id, categoryForm.value) : createCategory(categoryForm.value))
    categoryDialog.value = false
  }
  async function removeCategory (c) {
    if (confirm(`ลบหมวดหมู่ "${c.name}"?`)) await deleteCategory(c.id)
  }

  // ---- menu item dialog ----
  const itemDialog = ref(false)
  const editingItem = ref(null)
  const itemForm = ref({ name: '', description: '', price: 0, categoryId: null, imageUrl: '' })
  function openItemDialog (item = null) {
    editingItem.value = item
    itemForm.value = item
      ? { name: item.name, description: item.description, price: item.price, categoryId: item.categoryId, imageUrl: item.imageUrl }
      : { name: '', description: '', price: 0, categoryId: categories.value[0]?.id ?? null, imageUrl: '' }
    itemDialog.value = true
  }
  async function saveItem () {
    if (!itemForm.value.name.trim() || !itemForm.value.categoryId) return
    await (editingItem.value ? updateMenuItem(editingItem.value.id, itemForm.value) : createMenuItem({ ...itemForm.value, sortOrder: menuItems.value.length }))
    itemDialog.value = false
  }
  async function removeItem (item) {
    if (confirm(`ลบเมนู "${item.name}"?`)) await deleteMenuItem(item.id)
  }
</script>
