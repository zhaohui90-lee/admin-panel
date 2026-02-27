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
        class="fixed inset-0 z-50 flex items-center justify-center p-6"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        @click.self="emit('cancel')"
      >
        <div
          class="w-full max-w-sm rounded-2xl border shadow-2xl"
          style="background: #0f1a2e; border-color: rgba(255,255,255,0.08);"
        >
          <div class="p-6">
            <h3 class="mb-2 text-base font-bold text-white">
              {{ title }}
            </h3>
            <p class="mb-6 text-sm" style="color: #94a3b8;">
              {{ message }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                class="flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-125 disabled:opacity-50"
                style="background: rgba(255,255,255,0.06); color: #94a3b8;"
                :disabled="loading"
                @click="emit('cancel')"
              >
                取消
              </button>
              <button
                class="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-125 disabled:opacity-50"
                style="background: #dc2626; color: white;"
                :disabled="loading"
                @click="emit('confirm')"
              >
                <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {{ loading ? '执行中...' : (confirmText ?? '确认') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
