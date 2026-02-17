<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'

const model = defineModel<string>({ default: '' })

const isCaps = ref(false)
const isNumberMode = ref(false)

const letterRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

const numberRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
  ['.', ',', '?', '!', "'", '#', '%', '^', '*'],
]

const displayRows = computed(() => {
  if (isNumberMode.value) return numberRows
  return letterRows.map((row) => row.map((key) => (isCaps.value ? key.toUpperCase() : key)))
})

function onKey(key: string) {
  model.value += key
}

function onBackspace() {
  model.value = model.value.slice(0, -1)
}

function onClear() {
  model.value = ''
}

function toggleCaps() {
  isCaps.value = !isCaps.value
}

function toggleNumberMode() {
  isNumberMode.value = !isNumberMode.value
}

function onSpace() {
  model.value += ' '
}
</script>

<template>
  <div class="w-full max-w-2xl rounded-2xl border border-border bg-surface p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[20px]">
    <div
      v-for="(row, rowIndex) in displayRows"
      :key="rowIndex"
      class="mb-2 flex justify-center gap-1.5"
    >
      <!-- Caps Lock -->
      <button
        v-if="rowIndex === 2 && !isNumberMode"
        class="flex h-12 w-14 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150"
        :class="
          isCaps
            ? 'bg-accent text-deep shadow-[0_0_12px_var(--color-accent-glow)]'
            : 'border border-white/[0.08] bg-white/[0.06] text-text-secondary hover:bg-white/[0.1] active:bg-white/[0.15]'
        "
        @click="toggleCaps"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Keys -->
      <button
        v-for="key in row"
        :key="key"
        class="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.06] text-base font-medium text-text-primary transition-all duration-150 hover:bg-white/[0.1] active:bg-white/[0.15] active:scale-95"
        @click="onKey(key)"
      >
        {{ key }}
      </button>

      <!-- Backspace -->
      <button
        v-if="rowIndex === 2"
        class="flex h-12 w-14 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.06] text-text-secondary transition-all duration-150 hover:bg-white/[0.1] active:bg-white/[0.15]"
        @click="onBackspace"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Bottom row -->
    <div class="flex justify-center gap-1.5">
      <button
        class="flex h-12 w-20 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150"
        :class="
          isNumberMode
            ? 'bg-accent text-deep shadow-[0_0_12px_var(--color-accent-glow)]'
            : 'border border-white/[0.08] bg-white/[0.06] text-text-secondary hover:bg-white/[0.1] active:bg-white/[0.15]'
        "
        @click="toggleNumberMode"
      >
        {{ isNumberMode ? 'ABC' : '123' }}
      </button>

      <button
        class="flex h-12 flex-1 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.06] text-sm text-text-muted transition-all duration-150 hover:bg-white/[0.1] active:bg-white/[0.15]"
        @click="onSpace"
      >
        空格
      </button>

      <button
        class="flex h-12 w-20 items-center justify-center rounded-lg bg-danger-dim text-sm font-medium text-danger transition-all duration-150 hover:bg-danger/20 active:bg-danger/25"
        @click="onClear"
      >
        清空
      </button>
    </div>
  </div>
</template>
