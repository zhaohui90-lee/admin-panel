<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'online' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}>()

const sizeClass = computed(() => {
  switch (props.size ?? 'md') {
    case 'sm':
      return 'bulb--sm'
    case 'lg':
      return 'bulb--lg'
    default:
      return 'bulb--md'
  }
})

const colorVar = computed(() => {
  switch (props.status) {
    case 'online':
      return 'var(--color-success)'
    case 'warning':
      return 'var(--color-warning)'
    case 'error':
      return 'var(--color-danger)'
  }
})
</script>

<template>
  <div class="bulb-container">
    <div
      class="bulb"
      :class="sizeClass"
      :style="{ '--bulb-color': colorVar }"
      role="status"
      :aria-label="label ?? status"
    >
      <!-- Checkmark for online -->
      <svg
        v-if="props.status === 'online'"
        class="bulb-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>

      <!-- Warning icon -->
      <svg
        v-else-if="props.status === 'warning'"
        class="bulb-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>

      <!-- Error icon -->
      <svg
        v-else
        class="bulb-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>

      <!-- Ripple ring (online only) -->
      <div v-if="props.status === 'online'" class="bulb-ripple" />
    </div>

    <span v-if="label" class="bulb-label" :style="{ color: colorVar }">
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.bulb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.bulb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bulb-color);
  color: white;
  box-shadow: 0 0 0 12px color-mix(in srgb, var(--bulb-color) 15%, transparent);
}

/* Sizes */
.bulb--sm {
  width: 20px;
  height: 20px;
}

.bulb--md {
  width: 80px;
  height: 80px;
}

.bulb--lg {
  width: 140px;
  height: 140px;
  box-shadow: 0 0 0 20px color-mix(in srgb, var(--bulb-color) 15%, transparent);
}

.bulb-icon {
  width: 40%;
  height: 40%;
}

/* Small bulb hides the icon */
.bulb--sm .bulb-icon {
  display: none;
}

/* Ripple animation ring */
.bulb-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid var(--bulb-color);
  animation: ripple 2s infinite;
  pointer-events: none;
}

.bulb-label {
  font-size: 1.5rem;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .bulb-label {
    font-size: 2rem;
  }
}
</style>
