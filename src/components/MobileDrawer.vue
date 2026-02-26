<script setup lang="ts">
import SideNav from './SideNav.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick() {
  emit('close')
}

function handleNavigate() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="drawer-overlay">
      <div
        v-if="props.open"
        class="fixed inset-0 z-40"
        style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);"
        @click="handleOverlayClick"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition name="drawer-panel">
      <div
        v-if="props.open"
        class="fixed inset-y-0 left-0 z-50 w-[220px] shadow-2xl"
      >
        <SideNav @navigate="handleNavigate" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay fade */
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

/* Panel slide from left */
.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-100%);
}
</style>
