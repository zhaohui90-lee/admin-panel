<script setup lang="ts">
import { ref } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useToast } from '@/composables/useToast'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const store = useMaintenanceStore()
const toast = useToast()

// --- 编辑态 ---
const editingId = ref<string | null>(null)
const editingUrl = ref('')
const kbVisible = ref(false)

function startEdit(id: string, url: string) {
  editingId.value = id
  editingUrl.value = url
  kbVisible.value = true
}

function cancelEdit() {
  editingId.value = null
  editingUrl.value = ''
  kbVisible.value = false
}

function saveEdit() {
  const ep = store.serviceEndpoints.find((e) => e.id === editingId.value)
  if (ep && editingUrl.value.trim()) {
    ep.url = editingUrl.value.trim()
    toast.success('服务地址已更新')
  }
  cancelEdit()
}

// --- Ping 颜色 ---
function pingColor(ms: number | null): string {
  if (ms === null) return '#ef4444'
  if (ms < 50) return '#22c55e'
  if (ms < 150) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <section
    class="rounded-2xl border"
    style="background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.06);"
    data-testid="service-endpoints-panel"
  >
    <!-- 标题栏 -->
    <div
      class="flex items-center border-b px-5 py-4 lg:px-6"
      style="border-color: rgba(255,255,255,0.06);"
    >
      <h2 class="flex items-center gap-2.5 text-sm font-bold text-white">
        <span class="h-4 w-1 rounded-sm" style="background: #2563eb;" />
        服务地址
      </h2>
    </div>

    <!-- 端点列表 -->
    <div class="divide-y" style="border-color: rgba(255,255,255,0.04);">
      <div
        v-for="ep in store.serviceEndpoints"
        :key="ep.id"
        class="flex items-center gap-3 px-5 py-3.5 lg:px-6"
        data-testid="endpoint-row"
      >
        <!-- 标签 -->
        <span class="w-20 shrink-0 text-xs font-medium" style="color: #64748b;">
          {{ ep.label }}
        </span>

        <!-- URL / 编辑输入 -->
        <div class="min-w-0 flex-1">
          <template v-if="editingId === ep.id">
            <div
              class="flex items-center gap-2 rounded-lg border px-3 py-2"
              style="background: rgba(255,255,255,0.04); border-color: rgba(37,99,235,0.4);"
            >
              <input
                v-model="editingUrl"
                type="text"
                class="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-slate-600"
                placeholder="输入服务地址"
              />
            </div>
          </template>
          <template v-else>
            <span class="block truncate font-mono text-xs" style="color: #94a3b8;">
              {{ ep.url }}
            </span>
          </template>
        </div>

        <!-- Ping 延迟 -->
        <span
          class="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-semibold"
          :style="{
            color: pingColor(ep.pingMs),
            background: pingColor(ep.pingMs) + '18',
          }"
        >
          {{ ep.pingMs !== null ? ep.pingMs + 'ms' : '超时' }}
        </span>

        <!-- 操作按钮 -->
        <div v-if="ep.editable" class="shrink-0">
          <template v-if="editingId === ep.id">
            <div class="flex gap-1.5">
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-125"
                style="background: rgba(255,255,255,0.06); color: #64748b;"
                @click="cancelEdit"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-125"
                style="background: rgba(37,99,235,0.2); color: #60a5fa;"
                @click="saveEdit"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-125"
              style="background: rgba(255,255,255,0.06); color: #64748b;"
              :data-testid="`btn-edit-${ep.id}`"
              @click="startEdit(ep.id, ep.url)"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </template>
        </div>
        <div v-else class="w-7 shrink-0" />
      </div>
    </div>
  </section>

  <!-- 虚拟键盘 -->
  <VirtualKeyboard
    v-model="editingUrl"
    :visible="kbVisible"
    input-type="text"
    field-label="服务地址"
    @close="cancelEdit"
    @confirm="saveEdit"
  />
</template>
