<script setup lang="ts">
import { computed } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const store = useMaintenanceStore()
const sys = computed(() => store.systemResource)

// --- CPU 圆形进度环 ---
const ringRadius = 40
const ringCircumference = 2 * Math.PI * ringRadius

const cpuDashoffset = computed(() =>
  ringCircumference * (1 - sys.value.cpuUsage / 100),
)

const cpuColor = computed(() =>
  sys.value.cpuUsage < 60 ? '#3b82f6' : sys.value.cpuUsage < 80 ? '#f59e0b' : '#ef4444',
)

// --- 温度颜色 ---
const tempColor = computed(() =>
  sys.value.temperature > 70 ? '#ef4444' : sys.value.temperature > 55 ? '#f59e0b' : '#94a3b8',
)

const now = computed(() => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
})
</script>

<template>
  <div
    class="flex flex-col rounded-2xl border p-5 lg:p-6"
    style="background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.06);"
    data-testid="card-system"
  >
    <!-- 标题行 -->
    <div class="mb-4 flex items-center justify-between">
      <span class="text-xs font-medium" style="color: #64748b;">系统资源</span>
      <span class="font-mono text-[10px]" style="color: #475569;">{{ now }}</span>
    </div>

    <!-- CPU 圆形进度环 -->
    <div class="mb-4 flex justify-center">
      <svg viewBox="0 0 100 100" class="h-28 w-28">
        <!-- 背景环 -->
        <circle
          cx="50" cy="50" :r="ringRadius"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="7"
        />
        <!-- 进度环 -->
        <circle
          cx="50" cy="50" :r="ringRadius"
          fill="none"
          :stroke="cpuColor"
          stroke-width="7"
          stroke-linecap="round"
          :stroke-dasharray="ringCircumference"
          :stroke-dashoffset="cpuDashoffset"
          transform="rotate(-90 50 50)"
          class="transition-all duration-700"
        />
        <!-- 中心数值 -->
        <text
          x="50" y="46"
          text-anchor="middle"
          :fill="cpuColor"
          font-size="22"
          font-weight="bold"
          font-family="'JetBrains Mono', monospace"
          class="transition-all duration-500"
        >
          {{ Math.round(sys.cpuUsage) }}
        </text>
        <text
          x="50" y="60"
          text-anchor="middle"
          fill="#64748b"
          font-size="9"
        >
          CPU %
        </text>
      </svg>
    </div>

    <!-- 内存进度条 -->
    <div class="mb-3">
      <div class="mb-1 flex items-center justify-between text-xs" style="color: #64748b;">
        <span>内存</span>
        <span class="font-mono" style="color: #94a3b8;">
          {{ sys.memUsed }} / {{ sys.memTotal }} MB
        </span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full" style="background: rgba(255,255,255,0.06);">
        <div
          class="h-full rounded-full transition-all duration-700"
          :style="{
            width: store.memoryPercent + '%',
            background: store.memoryPercent < 70 ? '#3b82f6' : store.memoryPercent < 85 ? '#f59e0b' : '#ef4444',
          }"
        />
      </div>
    </div>

    <!-- 磁盘进度条 -->
    <div class="mb-3">
      <div class="mb-1 flex items-center justify-between text-xs" style="color: #64748b;">
        <span>磁盘</span>
        <span class="font-mono" style="color: #94a3b8;">
          {{ sys.diskUsed.toFixed(1) }} / {{ sys.diskTotal }} GB
        </span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full" style="background: rgba(255,255,255,0.06);">
        <div
          class="h-full rounded-full transition-all duration-700"
          :style="{
            width: store.diskPercent + '%',
            background: store.diskPercent < 70 ? '#3b82f6' : store.diskPercent < 85 ? '#f59e0b' : '#ef4444',
          }"
        />
      </div>
    </div>

    <!-- CPU 温度 -->
    <div class="mt-auto flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5" style="color: #64748b;">
        <!-- 温度计图标 -->
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
        CPU 温度
      </div>
      <span
        class="font-mono font-semibold transition-colors duration-500"
        :style="{ color: tempColor }"
      >
        {{ Math.round(sys.temperature) }}°C
      </span>
    </div>
  </div>
</template>
