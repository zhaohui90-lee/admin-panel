<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBridge } from '@/composables/useBridge'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const bridge = useBridge()

// --- 确认弹窗状态 ---
const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmLoading = ref(false)
let confirmAction: (() => Promise<void>) | null = null

function openConfirm(title: string, message: string, action: () => Promise<void>) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction = action
  confirmVisible.value = true
}

async function handleConfirm() {
  if (!confirmAction) return
  confirmLoading.value = true
  try {
    await confirmAction()
    toast.value = { message: '操作成功', type: 'success' }
  } catch {
    toast.value = { message: '操作失败，请重试', type: 'error' }
  } finally {
    confirmLoading.value = false
    confirmVisible.value = false
    confirmAction = null
    showToast()
  }
}

function handleCancel() {
  confirmVisible.value = false
  confirmAction = null
}

// --- Toast ---
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const toastVisible = ref(false)

function showToast() {
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// --- 服务地址 ---
const serverUrl = ref('')
const serverUrlInput = ref('')
const serverUrlEditing = ref(false)
const serverUrlSaving = ref(false)
const showKeyboard = ref(false)

onMounted(async () => {
  try {
    serverUrl.value = await bridge.config.getServerUrl()
    serverUrlInput.value = serverUrl.value
  } catch {
    serverUrl.value = '获取失败'
  }
})

function startEditUrl() {
  serverUrlInput.value = serverUrl.value
  serverUrlEditing.value = true
  showKeyboard.value = true
}

function cancelEditUrl() {
  serverUrlEditing.value = false
  showKeyboard.value = false
  serverUrlInput.value = serverUrl.value
}

async function saveServerUrl() {
  serverUrlSaving.value = true
  try {
    await bridge.config.setServerUrl(serverUrlInput.value)
    serverUrl.value = serverUrlInput.value
    serverUrlEditing.value = false
    showKeyboard.value = false
    toast.value = { message: '服务地址已更新', type: 'success' }
    showToast()
  } catch {
    toast.value = { message: '保存失败', type: 'error' }
    showToast()
  } finally {
    serverUrlSaving.value = false
  }
}

// --- 操作入口 ---
function quitApp() {
  openConfirm('关闭客户端', '确认关闭自助机客户端程序？', () => bridge.app.quit())
}
function restartApp() {
  openConfirm('重启客户端', '确认重启自助机客户端程序？', () => bridge.app.restart())
}
function shutdownMachine() {
  openConfirm('关闭自助机', '确认关闭自助机？设备将完全断电。', () => bridge.machine.shutdown())
}
function rebootMachine() {
  openConfirm('重启自助机', '确认重启自助机？设备将重新启动。', () => bridge.machine.reboot())
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <!-- 客户端控制 -->
    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-base font-semibold text-gray-800">客户端控制</h2>
      <div class="flex gap-4">
        <button
          class="flex-1 rounded-xl bg-orange-50 py-4 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 active:bg-orange-200"
          @click="restartApp"
        >
          重启客户端
        </button>
        <button
          class="flex-1 rounded-xl bg-red-50 py-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:bg-red-200"
          @click="quitApp"
        >
          关闭客户端
        </button>
      </div>
    </section>

    <!-- 自助机控制 -->
    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-base font-semibold text-gray-800">自助机控制</h2>
      <div class="flex gap-4">
        <button
          class="flex-1 rounded-xl bg-orange-50 py-4 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 active:bg-orange-200"
          @click="rebootMachine"
        >
          重启自助机
        </button>
        <button
          class="flex-1 rounded-xl bg-red-50 py-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:bg-red-200"
          @click="shutdownMachine"
        >
          关闭自助机
        </button>
      </div>
    </section>

    <!-- 服务地址配置 -->
    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-base font-semibold text-gray-800">服务地址</h2>

      <template v-if="!serverUrlEditing">
        <div class="flex items-center gap-3">
          <code class="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
            {{ serverUrl }}
          </code>
          <button
            class="shrink-0 rounded-xl bg-blue-50 px-5 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200"
            @click="startEditUrl"
          >
            修改
          </button>
        </div>
      </template>

      <template v-else>
        <div
          class="mb-3 flex min-h-12 items-center rounded-xl border-2 border-blue-400 bg-white px-4 py-3 text-sm break-all"
        >
          <span v-if="serverUrlInput" class="text-gray-800">{{ serverUrlInput }}</span>
          <span v-else class="text-gray-400">请输入服务地址</span>
          <span class="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-blue-500"></span>
        </div>
        <div class="mb-4 flex gap-3">
          <button
            class="flex-1 rounded-xl bg-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 active:bg-gray-400"
            @click="cancelEditUrl"
          >
            取消
          </button>
          <button
            class="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300"
            :disabled="serverUrlSaving || !serverUrlInput"
            @click="saveServerUrl"
          >
            {{ serverUrlSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </template>
    </section>

    <!-- 虚拟键盘（编辑服务地址时显示） -->
    <div v-if="showKeyboard" class="flex justify-center">
      <VirtualKeyboard v-model="serverUrlInput" />
    </div>
  </div>

  <!-- 确认弹窗 -->
  <ConfirmDialog
    :visible="confirmVisible"
    :title="confirmTitle"
    :message="confirmMessage"
    :loading="confirmLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <!-- Toast -->
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toastVisible && toast"
        class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
