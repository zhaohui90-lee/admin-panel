<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  message: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const inputValue = ref('')

// 每次打开时重置输入
watch(() => props.visible, (v) => {
  if (v) inputValue.value = ''
})

const canConfirm = computed(() => inputValue.value === 'CONFIRM')
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-6"
        style="background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);"
        @click.self="emit('cancel')"
      >
        <div
          class="w-full max-w-md rounded-2xl border shadow-2xl"
          style="background: #0f1a2e; border-color: rgba(239,68,68,0.25);"
          data-testid="confirm-input-modal"
        >
          <!-- 顶部危险标识 -->
          <div
            class="flex items-center gap-3 rounded-t-2xl border-b px-6 py-4"
            style="border-color: rgba(239,68,68,0.15); background: rgba(239,68,68,0.08);"
          >
            <svg class="h-5 w-5 shrink-0" style="color: #ef4444;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="text-sm font-bold" style="color: #ef4444;">高危操作确认</span>
          </div>

          <div class="p-6">
            <h3 class="mb-2 text-lg font-bold text-white">{{ title }}</h3>
            <p class="mb-5 text-sm" style="color: #94a3b8;">{{ message }}</p>

            <!-- 输入提示 -->
            <p class="mb-2 text-xs" style="color: #64748b;">
              请输入 <span class="font-mono font-bold" style="color: #f87171;">CONFIRM</span> 以确认执行此操作
            </p>

            <!-- 输入框 -->
            <input
              v-model="inputValue"
              type="text"
              placeholder="输入 CONFIRM"
              autocomplete="off"
              class="mb-5 w-full rounded-xl border px-4 py-3 font-mono text-sm text-white outline-none transition-colors duration-200 placeholder:text-slate-600"
              :style="{
                background: 'rgba(255,255,255,0.04)',
                borderColor: inputValue && !canConfirm ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
              }"
              data-testid="confirm-input"
            />

            <!-- 按钮 -->
            <div class="grid grid-cols-2 gap-3">
              <button
                class="flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-125"
                style="background: rgba(255,255,255,0.06); color: #94a3b8;"
                :disabled="loading"
                @click="emit('cancel')"
              >
                取消
              </button>
              <button
                class="flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40"
                style="background: #dc2626; color: white;"
                :disabled="!canConfirm || loading"
                @click="emit('confirm')"
              >
                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                确认执行
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
