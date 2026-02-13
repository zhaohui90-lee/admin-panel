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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h3 class="mb-2 text-lg font-semibold text-gray-800">{{ title }}</h3>
          <p class="mb-6 text-gray-500">{{ message }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-xl bg-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 active:bg-gray-400"
              :disabled="loading"
              @click="emit('cancel')"
            >
              取消
            </button>
            <button
              class="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:bg-red-300"
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
