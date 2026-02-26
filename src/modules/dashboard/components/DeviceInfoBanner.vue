<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const store = useMaintenanceStore()

// --- 同步时间：每秒更新"X 分钟前" ---
const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tickTimer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const syncAgo = computed(() => {
  const diffMs = now.value - new Date(store.terminalInfo.lastSyncTime).getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  return `${hours} 小时前`
})

const syncTimeFormatted = computed(() => {
  const d = new Date(store.terminalInfo.lastSyncTime)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

// --- 状态颜色/文字映射 ---
const statusConfig = computed(() => {
  const map = {
    running: { color: '#22c55e', label: '运行中', animation: 'pulse-glow-green' },
    warning: { color: '#f59e0b', label: '异常告警', animation: 'blink-slow' },
    error:   { color: '#ef4444', label: '故障停机', animation: 'blink-fast' },
    offline: { color: '#64748b', label: '离线', animation: '' },
  }
  return map[store.terminalInfo.runStatus]
})
</script>

<template>
  <div
    class="rounded-2xl border px-6 py-5 lg:px-8"
    style="
      background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8));
      border-color: rgba(255,255,255,0.08);
    "
    data-testid="device-info-banner"
  >
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <!-- ── 左列：设备标识 ─────────────────── -->
      <div class="flex items-center gap-4">
        <!-- 蓝色医疗十字图标 -->
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style="background: linear-gradient(135deg, #2563eb, #1d4ed8);"
        >
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" />
          </svg>
        </div>
        <div>
          <div class="font-mono text-xl font-bold tracking-wide text-white lg:text-2xl">
            {{ store.terminalInfo.deviceId }}
          </div>
          <div class="mt-0.5 text-xs" style="color: #64748b;">
            {{ store.terminalInfo.location }}
          </div>
        </div>
      </div>

      <!-- ── 中列：运行状态 ─────────────────── -->
      <div class="flex items-center gap-4 lg:justify-center">
        <!-- 状态指示灯 -->
        <div class="relative flex items-center gap-3">
          <span
            class="h-3.5 w-3.5 rounded-full"
            :class="statusConfig.animation"
            :style="{
              background: statusConfig.color,
              boxShadow: `0 0 12px ${statusConfig.color}60`,
            }"
          />
          <span
            class="text-sm font-semibold lg:text-base"
            :style="{ color: statusConfig.color }"
          >
            {{ statusConfig.label }}
          </span>
        </div>
        <!-- 运行时长 -->
        <div class="hidden text-xs sm:block" style="color: #64748b;">
          |
        </div>
        <div class="text-xs" style="color: #94a3b8;">
          运行 {{ store.uptimeFormatted }}
        </div>
      </div>

      <!-- ── 右列：同步信息 ─────────────────── -->
      <div class="flex items-center gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs" style="color: #64748b;">
            <!-- 同步图标 -->
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            最后同步
          </div>
          <div class="mt-1 font-mono text-xs text-white">
            {{ syncTimeFormatted }}
          </div>
          <div class="mt-0.5 text-xs" style="color: #94a3b8;">
            {{ syncAgo }}
          </div>
        </div>
        <!-- 手动同步按钮 -->
        <button
          class="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:brightness-125 disabled:opacity-50"
          style="background: rgba(255,255,255,0.06);"
          :disabled="store.isSyncing"
          data-testid="btn-sync"
          @click="store.manualSync()"
        >
          <svg
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'animate-spin': store.isSyncing }"
            style="color: #94a3b8;"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 绿色脉冲光晕 — running */
.pulse-glow-green {
  animation: pulse-glow 2s infinite ease-in-out;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.7); }
}

/* 慢速闪烁 — warning */
.blink-slow {
  animation: blink 2s infinite;
}

/* 快速闪烁 — error */
.blink-fast {
  animation: blink 0.6s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
