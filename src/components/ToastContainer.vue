<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-sm cursor-pointer"
          :class="{
            'bg-emerald-500 text-white': t.type === 'success',
            'bg-danger text-white': t.type === 'error',
            'bg-amber-500 text-white': t.type === 'warning',
          }"
          @click="remove(t.id)"
        >
          <span
            v-if="t.code"
            class="mr-1.5 inline-block rounded bg-red-900/50 px-1.5 py-0.5 font-mono text-xs text-red-100"
            data-testid="toast-error-code"
          >{{ t.code }}</span>
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
