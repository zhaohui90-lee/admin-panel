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
  <div class="w-full max-w-2xl rounded-2xl bg-gray-200 p-3 shadow-lg">
    <div
      v-for="(row, rowIndex) in displayRows"
      :key="rowIndex"
      class="mb-2 flex justify-center gap-1.5"
    >
      <!-- Caps Lock -->
      <button
        v-if="rowIndex === 2 && !isNumberMode"
        class="flex h-12 w-14 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="
          isCaps
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-gray-700 shadow hover:bg-gray-50 active:bg-gray-200'
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
        class="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-base font-medium text-gray-800 shadow transition-colors hover:bg-gray-50 active:bg-gray-300"
        @click="onKey(key)"
      >
        {{ key }}
      </button>

      <!-- Backspace -->
      <button
        v-if="rowIndex === 2"
        class="flex h-12 w-14 items-center justify-center rounded-lg bg-white text-gray-700 shadow transition-colors hover:bg-gray-50 active:bg-gray-200"
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
        class="flex h-12 w-20 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="
          isNumberMode
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-gray-700 shadow hover:bg-gray-50 active:bg-gray-200'
        "
        @click="toggleNumberMode"
      >
        {{ isNumberMode ? 'ABC' : '123' }}
      </button>

      <button
        class="flex h-12 flex-1 items-center justify-center rounded-lg bg-white text-sm text-gray-500 shadow transition-colors hover:bg-gray-50 active:bg-gray-300"
        @click="onSpace"
      >
        空格
      </button>

      <button
        class="flex h-12 w-20 items-center justify-center rounded-lg bg-blue-500 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 active:bg-blue-700"
        @click="onClear"
      >
        清空
      </button>
    </div>
  </div>
</template>
