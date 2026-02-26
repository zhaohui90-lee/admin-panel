<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const store = useMaintenanceStore()
const tx = computed(() => store.transactionStats)

// --- 数字格式化 ---
const totalFormatted = computed(() => tx.value.todayTotal.toLocaleString('zh-CN'))
const amountFormatted = computed(() =>
  '¥ ' + tx.value.todayAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
)

// --- 响应标签颜色 ---
const responseColor = computed(() =>
  tx.value.avgResponseMs < 120 ? '#22c55e' : tx.value.avgResponseMs < 300 ? '#f59e0b' : '#ef4444',
)

// --- SVG 折线迷你图 ---
const chartWidth = 280
const chartHeight = 60

const polylinePoints = computed(() => {
  const data = tx.value.hourlyTrend
  if (!data.length) return ''
  const max = Math.max(...data, 1)
  const stepX = chartWidth / (data.length - 1)
  return data.map((v, i) => `${i * stepX},${chartHeight - (v / max) * (chartHeight - 4)}`).join(' ')
})

const areaPath = computed(() => {
  const data = tx.value.hourlyTrend
  if (!data.length) return ''
  const max = Math.max(...data, 1)
  const stepX = chartWidth / (data.length - 1)
  const points = data.map((v, i) => `${i * stepX},${chartHeight - (v / max) * (chartHeight - 4)}`)
  return `M0,${chartHeight} L${points.join(' L')} L${chartWidth},${chartHeight} Z`
})

// --- Tooltip ---
const tooltipIndex = ref<number | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

function onChartHover(event: MouseEvent) {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const data = tx.value.hourlyTrend
  const stepX = chartWidth / (data.length - 1)
  const idx = Math.round(x / stepX)
  if (idx >= 0 && idx < data.length) {
    tooltipIndex.value = idx
    const max = Math.max(...data, 1)
    tooltipX.value = idx * stepX
    tooltipY.value = chartHeight - (data[idx] / max) * (chartHeight - 4)
  }
}

function onChartLeave() {
  tooltipIndex.value = null
}

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
    data-testid="card-transactions"
  >
    <!-- 标题行 -->
    <div class="mb-4 flex items-center justify-between">
      <span class="text-xs font-medium" style="color: #64748b;">今日交易</span>
      <span class="font-mono text-[10px]" style="color: #475569;">{{ now }}</span>
    </div>

    <!-- 主数字 -->
    <div class="mb-1 font-mono text-3xl font-bold tracking-tight text-white transition-all duration-500">
      {{ totalFormatted }}
    </div>

    <!-- 金额 -->
    <div class="mb-4 font-mono text-sm transition-all duration-500" style="color: #94a3b8;">
      {{ amountFormatted }}
    </div>

    <!-- 成功率 + 响应时长 -->
    <div class="mb-4 space-y-2.5">
      <!-- 成功率进度条 -->
      <div>
        <div class="mb-1 flex items-center justify-between text-xs" style="color: #64748b;">
          <span>成功率</span>
          <span class="font-mono" style="color: #94a3b8;">{{ tx.successRate.toFixed(1) }}%</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full" style="background: rgba(255,255,255,0.06);">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{
              width: tx.successRate + '%',
              background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
            }"
          />
        </div>
      </div>

      <!-- 平均响应 -->
      <div class="flex items-center justify-between text-xs">
        <span style="color: #64748b;">平均响应</span>
        <span
          class="rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold"
          :style="{
            color: responseColor,
            background: responseColor + '18',
          }"
        >
          {{ tx.avgResponseMs }}ms
        </span>
      </div>
    </div>

    <!-- 24h 折线迷你图 -->
    <div class="mt-auto">
      <svg
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        class="w-full"
        preserveAspectRatio="none"
        @mousemove="onChartHover"
        @mouseleave="onChartLeave"
      >
        <defs>
          <linearGradient id="tx-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <!-- 面积填充 -->
        <path :d="areaPath" fill="url(#tx-area-grad)" />
        <!-- 折线 -->
        <polyline
          :points="polylinePoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- Tooltip 圆点 -->
        <circle
          v-if="tooltipIndex !== null"
          :cx="tooltipX"
          :cy="tooltipY"
          r="3"
          fill="#3b82f6"
          stroke="#0b0f1a"
          stroke-width="1.5"
        />
      </svg>
      <!-- Tooltip 文本 -->
      <div
        v-if="tooltipIndex !== null"
        class="mt-1 text-center font-mono text-[10px]"
        style="color: #94a3b8;"
      >
        {{ tooltipIndex }}:00 — {{ tx.hourlyTrend[tooltipIndex] }} 笔
      </div>
    </div>
  </div>
</template>
