<script setup lang="ts">
import ToastContainer from '@/components/ToastContainer.vue'
import CriticalOverlay from '@/components/CriticalOverlay.vue'
</script>

<template>
  <router-view />
  <ToastContainer />
  <CriticalOverlay />
</template>
