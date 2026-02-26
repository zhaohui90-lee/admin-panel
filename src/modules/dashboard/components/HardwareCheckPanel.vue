<script setup lang="ts">
import { ref } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import type { HardwareStatus } from '@/types/maintenance'

const store = useMaintenanceStore()
const isCheckingAll = ref(false)

async function handleCheckAll() {
  isCheckingAll.value = true
  await store.checkAllHardware()
  isCheckingAll.value = false
}

// --- 状态配置 ---
const statusMap: Record<HardwareStatus, { label: string; color: string; dotBg: string }> = {
  ok:       { label: '正常', color: '#22c55e', dotBg: '#22c55e' },
  warning:  { label: '告警', color: '#f59e0b', dotBg: '#f59e0b' },
  error:    { label: '故障', color: '#ef4444', dotBg: '#ef4444' },
  checking: { label: '检测中', color: '#3b82f6', dotBg: '#3b82f6' },
  disabled: { label: '禁用', color: '#475569', dotBg: '#475569' },
}

// --- 硬件图标映射 ---
const iconPaths: Record<string, string> = {
  'id-card':        'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 16h4M14 9h4M14 13h4',
  'med-card':       'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 10h6M12 7v6',
  'bank-card':      'M2 7h20M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zM6 14h3M6 17h1',
  'printer':        'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  'printer-report': 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8zM9 18h6',
  'card-dispenser': 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM12 10v4M10 12h4',
  'scanner':        'M4 7V4h3M4 17v3h3M17 4h3v3M20 17v3h-3M7 7h10v10H7z',
  'camera':         'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}
</script>

<template>
  <section
    class="rounded-2xl border"
    style="background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.06);"
    data-testid="hw-check-panel"
  >
    <!-- 标题栏 -->
    <div
      class="flex items-center justify-between border-b px-5 py-4 lg:px-6"
      style="border-color: rgba(255,255,255,0.06);"
    >
      <h2 class="flex items-center gap-2.5 text-sm font-bold text-white">
        <span class="h-4 w-1 rounded-sm" style="background: #2563eb;" />
        硬件自检状态
      </h2>
      <button
        class="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-200 hover:brightness-125 disabled:opacity-50"
        style="background: rgba(37,99,235,0.12); color: #60a5fa;"
        :disabled="isCheckingAll"
        @click="handleCheckAll"
      >
        <svg
          class="h-3.5 w-3.5"
          :class="{ 'animate-spin': isCheckingAll }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        {{ isCheckingAll ? '检测中...' : '全部检测' }}
      </button>
    </div>

    <!-- 硬件网格 -->
    <div class="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4 lg:gap-4 lg:p-5">
      <div
        v-for="hw in store.hardwareItems"
        :key="hw.id"
        class="relative overflow-hidden rounded-xl border p-4 transition-all duration-300"
        :style="{
          background: hw.status === 'error'
            ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(30,41,59,0.6))'
            : 'rgba(15,23,42,0.5)',
          borderColor: hw.status === 'error'
            ? 'rgba(239,68,68,0.2)'
            : 'rgba(255,255,255,0.04)',
          borderLeftWidth: hw.status === 'error' ? '3px' : '1px',
          borderLeftColor: hw.status === 'error' ? '#ef4444' : undefined,
        }"
        data-testid="hw-card"
      >
        <!-- 顶部：图标 + 状态点 + 操作按钮 -->
        <div class="mb-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- 硬件图标 24x24 -->
            <svg
              class="h-5 w-5 shrink-0"
              :style="{ color: statusMap[hw.status].color }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
            >
              <path :d="iconPaths[hw.icon] ?? iconPaths['scanner']" />
            </svg>
            <!-- 状态点 -->
            <span
              class="h-2 w-2 rounded-full"
              :class="{ 'animate-spin-slow': hw.status === 'checking' }"
              :style="{
                background: statusMap[hw.status].dotBg,
                boxShadow: hw.status !== 'disabled' ? `0 0 6px ${statusMap[hw.status].color}50` : 'none',
              }"
            />
          </div>
          <!-- 单项操作按钮 -->
          <button
            class="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 hover:brightness-150"
            style="background: rgba(255,255,255,0.04); color: #64748b;"
            :disabled="hw.status === 'checking' || hw.status === 'disabled'"
            @click="store.checkSingleHardware(hw.id)"
          >
            <!-- 正常/告警：检测图标；error：复位图标 -->
            <svg
              v-if="hw.status === 'error'"
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <svg
              v-else-if="hw.status === 'checking'"
              class="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <svg
              v-else
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>
        </div>

        <!-- 硬件名称 -->
        <div class="mb-1 text-sm font-medium text-white">
          {{ hw.name }}
        </div>

        <!-- 状态详情 -->
        <div class="flex items-center justify-between">
          <span
            class="text-xs transition-colors duration-300"
            :style="{ color: hw.status === 'error' ? '#ef4444' : '#64748b' }"
          >
            {{ hw.detail }}
          </span>
          <span
            class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
            :style="{
              color: statusMap[hw.status].color,
              background: statusMap[hw.status].color + '18',
            }"
          >
            {{ statusMap[hw.status].label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
