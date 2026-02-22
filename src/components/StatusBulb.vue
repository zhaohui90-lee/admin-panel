<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

// ── 时钟 ──
const currentTime = ref("");
const currentDate = ref("");
const updateClock = () => {
  const n = new Date();
  currentTime.value = n.toLocaleTimeString("zh-CN", {
    hour12: false,
  });
  currentDate.value = n.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};
let clockTimer: number;

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  // 清除时钟更新的定时器
  clearInterval(clockTimer);
})
</script>

<template>
  <header class="status-bar px-6 py-3 sticky top-0 z-20">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#60a5fa"
              opacity=".35" />
            <rect x="10.5" y="5.5" width="3" height="9" rx="1" fill="white" />
            <rect x="7.5" y="8.5" width="9" height="3" rx="1" fill="white" />
          </svg>
        </div>
        <div>
          <div class="text-white font-semibold text-sm tracking-wide">医院员工自助终端</div>
          <div class="text-blue-300 text-[10px] opacity-70 tracking-widest">
            HOSPITAL SELF-SERVICE KIOSK
          </div>
        </div>
      </div>
      <div class="flex items-center gap-5">
        <div class="flex items-center gap-1.5">
          <svg class="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" stroke-linecap="round" />
          </svg>
          <div>
            <div class="text-blue-400 text-[9px] uppercase tracking-widest">终端</div>
            <div class="text-white mono text-[11px] font-medium">KSK-001</div>
          </div>
        </div>
        <div class="w-px h-6 bg-white/10"></div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
          </svg>
          <div>
            <div class="text-blue-400 text-[9px] uppercase tracking-widest">IP</div>
            <div class="text-white mono text-[11px] font-medium">192.168.1.100</div>
          </div>
        </div>
        <div class="w-px h-6 bg-white/10"></div>
        <div class="flex items-center gap-1.5">
          <div class="relative w-3.5 h-3.5 flex items-center justify-center">
            <span class="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 opacity-30 pulse-dot"></span>
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div>
            <div class="text-blue-400 text-[9px] uppercase tracking-widest">状态</div>
            <div class="text-emerald-400 text-[11px] font-medium">运行正常</div>
          </div>
        </div>
        <div class="w-px h-6 bg-white/10 hidden sm:block"></div>
        <div class="hidden sm:block text-right">
          <div class="text-white mono text-sm font-medium">
            {{ currentTime }}
          </div>
          <div class="text-blue-400 text-[10px]">{{ currentDate }}</div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.status-bar {
  background: linear-gradient(135deg,
      #0d1b3e 0%,
      #1a3a6b 60%,
      #0f3460 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
</style>
