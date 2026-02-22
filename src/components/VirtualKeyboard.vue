<script setup lang="ts">
import { computed, ref } from 'vue'

export type KeyboardInputType = 'text' | 'number' | 'ip'

const props = withDefaults(defineProps<{
  inputType?: KeyboardInputType
}>(), {
  inputType: 'text',
})

const model = defineModel<string>({ default: '' })

const isCaps = ref(false)
const isNumberMode = ref(false)

// --- Numpad mode (for 'number' and 'ip' inputType) ---
const isNumpad = computed(() => props.inputType === 'number' || props.inputType === 'ip')

const numpadRows = computed(() => {
  if (props.inputType === 'ip') {
    return [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', ':'],
    ]
  }
  return [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ]
})

// --- QWERTY mode ---
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

// When in numpad mode but user switches to full keyboard
const showFullKeyboard = ref(false)

function onKey(key: string) {
  model.value += key
}

function onNumpadKey(key: string) {
  if (key === '⌫') {
    onBackspace()
  } else {
    model.value += key
  }
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

function switchToFullKeyboard() {
  showFullKeyboard.value = true
}

function switchToNumpad() {
  showFullKeyboard.value = false
}
</script>

<template>
  <!-- Numpad layout -->
  <div
    v-if="isNumpad && !showFullKeyboard"
    class="w-full rounded-2xl border-[1.5px] border-border bg-card p-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] select-none sm:rounded-[20px] sm:p-2.5 lg:rounded-3xl lg:p-3.5"
    data-testid="numpad"
  >
    <div
      v-for="(row, rowIndex) in numpadRows"
      :key="rowIndex"
      class="mb-2 flex justify-center gap-2 sm:mb-2.5 sm:gap-2.5 lg:mb-3 lg:gap-3"
    >
      <button
        v-for="key in row"
        :key="key"
        class="flex h-16 min-w-20 flex-1 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-[1.375rem] font-semibold text-text-primary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-18 sm:rounded-[14px] sm:text-2xl lg:h-20 lg:rounded-2xl lg:text-[1.75rem]"
        data-testid="numpad-key"
        @click="onNumpadKey(key)"
      >
        {{ key }}
      </button>
    </div>

    <!-- Numpad bottom row: ABC + Backspace + Clear -->
    <div class="flex justify-center gap-2 sm:gap-2.5 lg:gap-3">
      <button
        class="flex h-13 flex-1 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-sm font-semibold text-text-secondary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-14.5 sm:rounded-[14px] sm:text-[0.9375rem] lg:h-16 lg:rounded-2xl lg:text-base"
        data-testid="numpad-switch-abc"
        @click="switchToFullKeyboard"
      >
        ABC
      </button>
      <button
        class="flex h-13 flex-1 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-text-secondary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-14.5 sm:rounded-[14px] lg:h-16 lg:rounded-2xl"
        data-testid="numpad-backspace"
        @click="onBackspace"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        class="flex h-13 flex-1 items-center justify-center rounded-xl border-[1.5px] border-red-300 bg-red-50 text-sm font-semibold text-danger shadow-[0_3px_0_#fca5a5] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-red-200 active:shadow-none sm:h-14.5 sm:rounded-[14px] sm:text-[0.9375rem] lg:h-16 lg:rounded-2xl lg:text-base"
        @click="onClear"
      >
        清空
      </button>
    </div>
  </div>

  <!-- QWERTY layout (default, or when numpad user switches to full) -->
  <div
    v-else
    class="w-full rounded-2xl border-[1.5px] border-border bg-card p-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] select-none sm:rounded-[20px] sm:p-2.5 lg:rounded-3xl lg:p-3.5"
    data-testid="qwerty"
  >
    <div
      v-for="(row, rowIndex) in displayRows"
      :key="rowIndex"
      class="mb-1.5 flex justify-center gap-1.25 sm:mb-1.75 sm:gap-1.5 lg:mb-2 lg:gap-1.75"
    >
      <!-- Caps Lock -->
      <button
        v-if="rowIndex === 2 && !isNumberMode"
        class="flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border-[1.5px] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:shadow-none sm:h-12 sm:w-14 sm:rounded-[10px] lg:h-14 lg:w-17 lg:rounded-xl"
        :class="
          isCaps
            ? 'border-accent bg-accent text-white shadow-[0_3px_0_var(--color-accent-dark)] active:bg-accent-dark'
            : 'border-border bg-surface text-text-secondary shadow-[0_3px_0_var(--color-border)] active:bg-deep'
        "
        @click="toggleCaps"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" viewBox="0 0 20 20" fill="currentColor">
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
        class="flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border-[1.5px] border-border bg-surface text-[0.9375rem] font-semibold text-text-primary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-12 sm:rounded-[10px] sm:text-base lg:h-14 lg:rounded-xl lg:text-lg"
        @click="onKey(key)"
      >
        {{ key }}
      </button>

      <!-- Backspace -->
      <button
        v-if="rowIndex === 2"
        class="flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-border bg-surface text-text-secondary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-12 sm:w-14 sm:rounded-[10px] lg:h-14 lg:w-17 lg:rounded-xl"
        @click="onBackspace"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Bottom row -->
    <div class="flex justify-center gap-1.25 sm:gap-1.5 lg:gap-1.75">
      <button
        class="flex h-11 w-18 shrink-0 items-center justify-center rounded-lg border-[1.5px] text-[0.8125rem] font-semibold transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:shadow-none sm:h-12 sm:w-21 sm:rounded-[10px] sm:text-sm lg:h-14 lg:w-24 lg:rounded-xl lg:text-base"
        :class="
          isNumberMode
            ? 'border-accent bg-accent text-white shadow-[0_3px_0_var(--color-accent-dark)] active:bg-accent-dark'
            : 'border-border bg-surface text-text-secondary shadow-[0_3px_0_var(--color-border)] active:bg-deep'
        "
        @click="isNumpad && !showFullKeyboard ? switchToNumpad() : toggleNumberMode()"
      >
        {{ isNumberMode ? 'ABC' : '123' }}
      </button>

      <!-- Back to numpad (only when numpad user switched to full keyboard) -->
      <button
        v-if="isNumpad && showFullKeyboard"
        class="flex h-11 w-18 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-border bg-surface text-[0.8125rem] font-semibold text-text-secondary shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-12 sm:w-21 sm:rounded-[10px] sm:text-sm lg:h-14 lg:w-24 lg:rounded-xl lg:text-base"
        data-testid="switch-numpad"
        @click="switchToNumpad"
      >
        数字
      </button>

      <button
        class="flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border-[1.5px] border-border bg-surface text-[0.8125rem] text-text-muted shadow-[0_3px_0_var(--color-border)] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-deep active:shadow-none sm:h-12 sm:rounded-[10px] sm:text-sm lg:h-14 lg:rounded-xl lg:text-base"
        @click="onSpace"
      >
        空格
      </button>

      <button
        class="flex h-11 w-18 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-red-300 bg-red-50 text-[0.8125rem] font-semibold text-danger shadow-[0_3px_0_#fca5a5] transition-[transform,box-shadow,background] duration-75 active:translate-y-0.75 active:bg-red-200 active:shadow-none sm:h-12 sm:w-21 sm:rounded-[10px] sm:text-sm lg:h-14 lg:w-24 lg:rounded-xl lg:text-base"
        @click="onClear"
      >
        清空
      </button>
    </div>
  </div>
</template>
