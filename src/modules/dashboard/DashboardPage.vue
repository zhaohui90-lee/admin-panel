<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useMaintenanceStore } from '@/stores/maintenance'
import DeviceInfoBanner from './components/DeviceInfoBanner.vue'
import TransactionCard from './components/TransactionCard.vue'
import NetworkCard from './components/NetworkCard.vue'
import SystemResourceCard from './components/SystemResourceCard.vue'
import HardwareCheckPanel from './components/HardwareCheckPanel.vue'
import DeviceControlPanel from './components/DeviceControlPanel.vue'
import ServiceEndpointsPanel from './components/ServiceEndpointsPanel.vue'

const device = useDeviceStore()
const maintenance = useMaintenanceStore()

onMounted(async () => {
  await device.fetchConfig()
  device.startPolling(5000)
  maintenance.startFluctuation()
})

onUnmounted(() => {
  device.stopPolling()
  maintenance.stopFluctuation()
})
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5 lg:space-y-6">
    <!-- ── Device Info Banner ──────────────────────── -->
    <DeviceInfoBanner />

    <!-- ── Monitor Cards (3-col grid) ──────────────── -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5" data-testid="monitor-cards">
      <TransactionCard />
      <NetworkCard />
      <SystemResourceCard />
    </div>

    <!-- ── Hardware Check Panel ──────────────────── -->
    <HardwareCheckPanel />

    <!-- ── Device Control + Service Endpoints ────── -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
      <DeviceControlPanel />
      <ServiceEndpointsPanel />
    </div>
  </div>
</template>
