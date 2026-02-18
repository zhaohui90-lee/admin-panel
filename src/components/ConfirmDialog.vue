<script setup lang="ts">
import TouchButton from './TouchButton.vue'

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
        class="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
        style="background: rgba(0,0,0,0.65);"
        @click.self="emit('cancel')"
      >
        <div
          class="w-full max-w-md rounded-2xl border p-6 shadow-2xl lg:p-8"
          style="background: var(--color-card); border-color: var(--color-border);"
        >
          <h3 class="mb-3 text-xl font-bold lg:text-2xl" style="color: var(--color-text-primary);">
            {{ title }}
          </h3>
          <p class="mb-6 text-base lg:mb-8 lg:text-lg" style="color: var(--color-text-secondary);">
            {{ message }}
          </p>
          <div class="grid grid-cols-2 gap-4">
            <TouchButton :disabled="loading" @click="emit('cancel')">
              取消
            </TouchButton>
            <TouchButton variant="danger" :loading="loading" @click="emit('confirm')">
              {{ confirmText ?? '确认' }}
            </TouchButton>
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
