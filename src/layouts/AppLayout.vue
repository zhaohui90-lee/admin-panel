<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-100">
    <header class="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <h1 class="text-lg font-semibold text-gray-800">自助设备控制面板</h1>
      <button
        class="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-300 active:bg-gray-400"
        @click="handleLogout"
      >
        退出登录
      </button>
    </header>
    <main class="flex-1 overflow-auto p-6">
      <router-view />
    </main>
  </div>
</template>
