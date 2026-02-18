<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'text' | 'password'
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })

const hasValue = computed(() => model.value.length > 0)

function clear() {
  model.value = ''
}
</script>

<template>
  <div class="touch-input-wrapper">
    <input
      class="touch-input"
      :type="props.type ?? 'text'"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :value="model"
      @input="model = ($event.target as HTMLInputElement).value"
    />
    <button
      v-if="hasValue && !props.disabled"
      class="touch-input-clear"
      type="button"
      aria-label="清除"
      @click="clear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.touch-input-wrapper {
  position: relative;
  width: 100%;
}

.touch-input {
  width: 100%;
  height: var(--touch-input-height);
  padding: 0 3rem 0 1.5rem;
  font-size: 1.125rem;
  color: var(--color-text-primary);
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--touch-radius-md);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

@media (min-width: 1024px) {
  .touch-input {
    font-size: 1.5rem;
  }
}

.touch-input::placeholder {
  color: var(--color-text-muted);
}

.touch-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 6px var(--color-accent-glow);
}

.touch-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.touch-input-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-deep);
  border: none;
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.touch-input-clear:active {
  background: var(--color-border);
}
</style>
