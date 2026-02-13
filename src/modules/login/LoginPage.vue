<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBridge } from '@/composables/useBridge'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const router = useRouter()
const auth = useAuthStore()
const bridge = useBridge()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const valid = await bridge.auth.verify(password.value)
    if (valid) {
      auth.login()
      router.push('/dashboard')
    } else {
      error.value = '密码错误'
      password.value = ''
    }
  } catch {
    error.value = '验证失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-md">
      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">自助设备控制面板</h1>

      <div class="mb-6 rounded-2xl bg-white p-6 shadow-lg">
        <label class="mb-2 block text-sm font-medium text-gray-600">管理密码</label>
        <div
          class="flex min-h-14 items-center rounded-xl border-2 px-4 py-3 text-lg"
          :class="error ? 'border-red-400' : 'border-gray-300'"
        >
          <span v-if="password" class="text-gray-800 tracking-widest">{{
            '●'.repeat(password.length)
          }}</span>
          <span v-else class="text-gray-400">请输入管理密码</span>
        </div>
        <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>

        <button
          class="mt-4 flex h-14 w-full items-center justify-center rounded-xl bg-blue-500 text-lg font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '验证中...' : '登 录' }}
        </button>
      </div>
    </div>

    <div class="w-full max-w-2xl">
      <VirtualKeyboard v-model="password" />
    </div>
  </div>
</template>
