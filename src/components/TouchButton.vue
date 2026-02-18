<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'danger' | 'outline'
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <button
    class="touch-btn"
    :class="[
      `touch-btn--${variant ?? 'outline'}`,
      { 'touch-btn--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="h-5 w-5 animate-spin lg:h-6 lg:w-6"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Content -->
    <span v-if="!loading" class="flex items-center justify-center gap-2 lg:gap-3">
      <slot />
    </span>
    <span v-else>执行中...</span>
  </button>
</template>

<style scoped>
.touch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: var(--touch-btn-height);
  padding: 0 1.5rem;
  border-radius: var(--touch-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid var(--color-border);
  outline: none;
}

@media (min-width: 1024px) {
  .touch-btn {
    font-size: 1.25rem;
  }
}

/* Variant: outline (default) */
.touch-btn--outline {
  background: var(--color-card);
  color: var(--color-text-primary);
  box-shadow: 0 4px 0 var(--color-border);
}

.touch-btn--outline:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
  background: var(--color-deep);
}

/* Variant: primary */
.touch-btn--primary {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  box-shadow: 0 4px 0 var(--color-accent-dark);
}

.touch-btn--primary:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
  background: var(--color-accent-dark);
}

/* Variant: danger */
.touch-btn--danger {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
  box-shadow: 0 4px 0 #dc2626;
}

.touch-btn--danger:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
  background: #dc2626;
}

/* Disabled */
.touch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
