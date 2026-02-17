import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isLoggedIn = computed(() => token.value !== null)

  function login(newToken: string) {
    token.value = newToken
  }

  function logout() {
    token.value = null
  }

  return { token, isLoggedIn, login, logout }
})
