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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          <h3 class="mb-2 text-lg font-semibold text-text-primary">{{ title }}</h3>
          <p class="mb-6 text-sm text-text-secondary">{{ message }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-white/[0.07]"
              :disabled="loading"
              @click="emit('cancel')"
            >
              取消
            </button>
            <button
              class="flex-1 rounded-[10px] bg-danger py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-[0_4px_16px_rgba(244,63,94,0.3)] disabled:opacity-50"
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
