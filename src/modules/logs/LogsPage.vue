<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useBridge } from '@/composables/useBridge'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { BridgeError } from '@/bridge'
import type { LogEntry, LogLevel } from '@/bridge'

const bridge = useBridge()
const auth = useAuthStore()
const toast = useToast()

// --- State ---
const logs = ref<LogEntry[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const activeLevel = ref<LogLevel | ''>('')
const keyword = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

// --- Fetch ---
async function fetchLogs() {
  loading.value = true
  try {
    const result = await bridge.logs.getLogs(auth.token!, {
      level: activeLevel.value || undefined,
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize,
    })
    logs.value = result.items
    total.value = result.total
  } catch (e) {
    if (e instanceof BridgeError) {
      toast.bridgeError(e)
    } else {
      toast.error('获取日志失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)

// Re-fetch when filters change, reset to page 1
watch([activeLevel, keyword], () => {
  page.value = 1
  fetchLogs()
})

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchLogs()
}

function setLevel(level: LogLevel | '') {
  activeLevel.value = level
}

function clearFilters() {
  activeLevel.value = ''
  keyword.value = ''
}

// --- Formatting ---
function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const levelLabels: Record<LogLevel, string> = {
  info: '信息',
  warn: '警告',
  error: '错误',
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4 sm:space-y-5 lg:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-lg font-semibold text-text-primary sm:text-xl lg:text-[22px]">交易日志</h1>
      <p class="mt-1 text-sm text-text-muted">查看自助机交易记录与操作日志</p>
    </div>

    <!-- Filters -->
    <section class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <!-- Level filter tabs -->
        <div class="flex gap-1.5" data-testid="level-filters">
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-[13px]"
            :class="activeLevel === '' ? 'bg-accent text-white' : 'border border-border bg-surface text-text-secondary hover:bg-gray-100'"
            @click="setLevel('')"
          >
            全部
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-[13px]"
            :class="activeLevel === 'info' ? 'bg-accent text-white' : 'border border-border bg-surface text-text-secondary hover:bg-gray-100'"
            data-testid="filter-info"
            @click="setLevel('info')"
          >
            信息
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-[13px]"
            :class="activeLevel === 'warn' ? 'bg-amber-500 text-white' : 'border border-border bg-surface text-text-secondary hover:bg-gray-100'"
            data-testid="filter-warn"
            @click="setLevel('warn')"
          >
            警告
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-[13px]"
            :class="activeLevel === 'error' ? 'bg-danger text-white' : 'border border-border bg-surface text-text-secondary hover:bg-gray-100'"
            data-testid="filter-error"
            @click="setLevel('error')"
          >
            错误
          </button>
        </div>

        <!-- Keyword search -->
        <div class="flex gap-2">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索关键词..."
            class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-dim sm:w-48"
            data-testid="keyword-input"
          />
          <button
            v-if="activeLevel || keyword"
            class="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:bg-gray-100"
            @click="clearFilters"
          >
            清除
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div class="mt-3 text-xs text-text-muted">
        共 {{ total }} 条记录
        <span v-if="activeLevel || keyword"> (已过滤)</span>
      </div>
    </section>

    <!-- Log list -->
    <section class="rounded-xl border border-border bg-card shadow-sm">
      <div v-if="loading" class="py-12 text-center text-sm text-text-muted">加载中...</div>

      <div v-else-if="logs.length === 0" class="py-12 text-center text-sm text-text-muted">
        暂无日志记录
      </div>

      <div v-else class="divide-y divide-border" data-testid="log-list">
        <div
          v-for="log in logs"
          :key="log.id"
          class="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:py-4"
          data-testid="log-item"
        >
          <!-- Level badge -->
          <div class="flex shrink-0 items-center gap-2 sm:w-16">
            <span
              class="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase sm:text-[11px]"
              :class="{
                'bg-blue-100 text-blue-700': log.level === 'info',
                'bg-amber-100 text-amber-700': log.level === 'warn',
                'bg-red-100 text-red-700': log.level === 'error',
              }"
            >
              {{ levelLabels[log.level] }}
            </span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <p class="text-sm text-text-primary">{{ log.message }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted sm:gap-3">
              <span>{{ formatTime(log.timestamp) }}</span>
              <span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px]">{{ log.source }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2" data-testid="pagination">
      <button
        class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-gray-100 disabled:opacity-40"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      >
        上一页
      </button>
      <span class="text-xs text-text-muted">{{ page }} / {{ totalPages }}</span>
      <button
        class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-gray-100 disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
