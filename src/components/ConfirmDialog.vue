<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-[0_25px_60px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:p-6">
          <h3 class="mb-1.5 text-base font-semibold text-text-primary sm:mb-2 sm:text-lg">{{ title }}</h3>
          <p class="mb-5 text-sm text-text-secondary sm:mb-6">{{ message }}</p>
          <div class="flex gap-2 sm:gap-3">
            <button
              class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-white/[0.07] sm:rounded-[10px] sm:py-3"
              :disabled="loading"
              @click="emit('cancel')"
            >
              取消
            </button>
            <button
              class="flex-1 rounded-lg bg-danger py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-[0_4px_16px_rgba(244,63,94,0.3)] disabled:opacity-50 sm:rounded-[10px] sm:py-3"
              :disabled="loading"
              @click="emit('confirm')"
            >
              {{ loading ? '执行中...' : (confirmText ?? '确认') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
