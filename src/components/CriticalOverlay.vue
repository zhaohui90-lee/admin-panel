<script setup lang="ts">
import { useMaintenanceStore } from '@/stores/maintenance'

const store = useMaintenanceStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="store.isCriticalActionProcessing"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
        style="background: rgba(7,11,21,0.92); backdrop-filter: blur(6px);"
        data-testid="critical-overlay"
      >
        <!-- 旋转圆圈 -->
        <svg class="h-14 w-14 animate-spin" viewBox="0 0 50 50">
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="4"
          />
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="#3b82f6"
            stroke-width="4"
            stroke-linecap="round"
            stroke-dasharray="80 46"
          />
        </svg>
        <p class="text-sm font-medium" style="color: #94a3b8;">正在执行高危操作，请勿操作设备...</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
