<script setup lang="ts">
import { computed } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const store = useMaintenanceStore()
const net = computed(() => store.networkStatus)

// --- 延迟颜色 ---
const latencyColor = computed(() =>
  net.value.latency < 50 ? '#22c55e' : net.value.latency < 150 ? '#f59e0b' : '#ef4444',
)

// --- 丢包率颜色 ---
const packetLossColor = computed(() =>
  net.value.packetLoss <= 1 ? '#22c55e' : net.value.packetLoss <= 5 ? '#f59e0b' : '#ef4444',
)

// --- SVG 半圆仪表盘 ---
// 延迟范围 0-300ms 映射到 180 度弧
const gaugeRadius = 52
const gaugeStroke = 8
const gaugeCx = 65
const gaugeCy = 60

// 半圆弧路径 (从左到右, 180度)
const arcPath = computed(() => {
  const r = gaugeRadius
  return `M ${gaugeCx - r} ${gaugeCy} A ${r} ${r} 0 0 1 ${gaugeCx + r} ${gaugeCy}`
})

// 弧长
const arcLength = Math.PI * gaugeRadius

// 延迟映射到弧偏移
const gaugeDashoffset = computed(() => {
  const ratio = Math.min(net.value.latency / 300, 1)
  return arcLength * (1 - ratio)
})

// 指针角度: 0ms = -90deg(左), 300ms = 90deg(右)
const needleAngle = computed(() => {
  const ratio = Math.min(net.value.latency / 300, 1)
  return -90 + ratio * 180
})

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
    data-testid="card-network"
  >
    <!-- 标题行 -->
    <div class="mb-4 flex items-center justify-between">
      <span class="text-xs font-medium" style="color: #64748b;">网络状态</span>
      <span class="font-mono text-[10px]" style="color: #475569;">{{ now }}</span>
    </div>

    <!-- SVG 半圆仪表盘 -->
    <div class="mb-3 flex justify-center">
      <svg viewBox="0 0 130 72" class="w-40">
        <!-- 背景弧 -->
        <path
          :d="arcPath"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          :stroke-width="gaugeStroke"
          stroke-linecap="round"
        />
        <!-- 填充弧 -->
        <path
          :d="arcPath"
          fill="none"
          :stroke="latencyColor"
          :stroke-width="gaugeStroke"
          stroke-linecap="round"
          :stroke-dasharray="arcLength"
          :stroke-dashoffset="gaugeDashoffset"
          class="transition-all duration-700"
        />
        <!-- 指针 -->
        <line
          :x1="gaugeCx"
          :y1="gaugeCy"
          :x2="gaugeCx"
          :y2="gaugeCy - gaugeRadius + 14"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          :transform="`rotate(${needleAngle} ${gaugeCx} ${gaugeCy})`"
          class="transition-all duration-700"
        />
        <!-- 中心点 -->
        <circle :cx="gaugeCx" :cy="gaugeCy" r="3" fill="white" />
        <!-- 中心延迟数值 -->
        <text
          :x="gaugeCx"
          :y="gaugeCy - 12"
          text-anchor="middle"
          :fill="latencyColor"
          font-size="18"
          font-weight="bold"
          font-family="'JetBrains Mono', monospace"
          class="transition-all duration-500"
        >
          {{ Math.round(net.latency) }}
        </text>
        <text
          :x="gaugeCx"
          :y="gaugeCy - 1"
          text-anchor="middle"
          fill="#64748b"
          font-size="8"
        >
          ms
        </text>
      </svg>
    </div>

    <!-- 丢包率 -->
    <div class="mb-3">
      <div class="mb-1 flex items-center justify-between text-xs" style="color: #64748b;">
        <span>丢包率</span>
        <span class="font-mono" :style="{ color: packetLossColor }">{{ net.packetLoss.toFixed(1) }}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full" style="background: rgba(255,255,255,0.06);">
        <div
          class="h-full rounded-full transition-all duration-700"
          :style="{
            width: Math.min(net.packetLoss * 6.67, 100) + '%',
            background: packetLossColor,
          }"
        />
      </div>
    </div>

    <!-- 连通性检测 -->
    <div class="mt-auto space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span style="color: #64748b;">DNS 解析</span>
        <span
          class="font-semibold"
          :style="{ color: net.dnsOk ? '#22c55e' : '#ef4444' }"
        >
          {{ net.dnsOk ? '✓' : '✗' }}
        </span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span style="color: #64748b;">网关 Ping</span>
        <span
          class="font-semibold"
          :style="{ color: net.gatewayOk ? '#22c55e' : '#ef4444' }"
        >
          {{ net.gatewayOk ? '✓' : '✗' }}
        </span>
      </div>
    </div>
  </div>
</template>
