<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

export type KeyboardInputType = 'text' | 'password' | 'number' | 'ip'
export type KeyboardMode = 'alpha-lower' | 'alpha-upper' | 'number' | 'symbol'
type ShiftState = 'off' | 'once' | 'caps'

const props = withDefaults(
  defineProps<{
    inputType?: KeyboardInputType
    visible?: boolean
    fieldLabel?: string
  }>(),
  {
    inputType: 'text',
    visible: true,
    fieldLabel: '',
  },
)

const emit = defineEmits<{
  confirm: []
  close: []
}>()

const model = defineModel<string>({ default: '' })

// ── Keyboard state ──
const kbMode = ref<KeyboardMode>('alpha-lower')
const shiftState = ref<ShiftState>('off')
const pressedKey = ref<string | null>(null)
const kbRef = ref<HTMLElement | null>(null)
const kbHeight = ref(280)

// ── Layout data ──
const alphaRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

const numRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', '(', ')', '$', '&', '@', '"', ':', ';'],
  ['.', ',', '?', '!', "'", '_'],
]

const symRows = [
  ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
  ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
  ['.', ',', '?', '!', "'", '`'],
]

// ── Computed display value ──
const displayValue = computed(() => {
  if (props.inputType === 'password' && model.value) {
    return '●'.repeat(model.value.length)
  }
  return model.value
})

const modeLabel = computed(() => {
  const labels: Record<KeyboardMode, string> = {
    'alpha-lower': 'ABC',
    'alpha-upper': 'ABC',
    number: '123',
    symbol: '#@!',
  }
  return labels[kbMode.value]
})

const modePillClass = computed(() => {
  if (kbMode.value.startsWith('alpha')) return 'kb-mode-alpha'
  if (kbMode.value === 'number') return 'kb-mode-number'
  return 'kb-mode-symbol'
})

// ── Initialize mode based on inputType ──
function initModeForInputType() {
  if (props.inputType === 'number' || props.inputType === 'ip') {
    kbMode.value = 'number'
  } else if (kbMode.value === 'number' || kbMode.value === 'symbol') {
    kbMode.value = 'alpha-lower'
  }
}

// Set mode on initial mount if already visible
if (props.visible) initModeForInputType()

watch(
  () => props.visible,
  (v) => {
    if (v) {
      initModeForInputType()
      nextTick(() => {
        if (kbRef.value) kbHeight.value = kbRef.value.offsetHeight
      })
    }
  },
)

// ── Measure height after render ──
watch(
  () => props.visible,
  (v) => {
    if (v) {
      nextTick(() => {
        setTimeout(() => {
          if (kbRef.value) kbHeight.value = kbRef.value.offsetHeight
        }, 50)
      })
    }
  },
)

// ── Audio feedback ──
let audioCtx: AudioContext | null = null

function beep(freq = 800, duration = 10, vol = 0.06) {
  try {
    if (!audioCtx) {
      const AC = globalThis.AudioContext ?? (globalThis as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      audioCtx = new AC()
    }
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = freq
    gain.gain.value = vol
    osc.start()
    osc.stop(audioCtx.currentTime + duration / 1000)
  } catch {
    // Audio not available — silent fallback
  }
}

// ── Key actions ──
function switchMode(mode: KeyboardMode) {
  kbMode.value = mode
}

function pressShift() {
  if (shiftState.value === 'off') {
    shiftState.value = 'once'
    kbMode.value = 'alpha-upper'
  } else if (shiftState.value === 'once') {
    shiftState.value = 'caps'
    kbMode.value = 'alpha-upper'
  } else {
    shiftState.value = 'off'
    kbMode.value = 'alpha-lower'
  }
}

function pressKey(k: string) {
  beep(800)
  pressedKey.value = k
  setTimeout(() => {
    pressedKey.value = null
  }, 100)

  let char = k
  if (kbMode.value === 'alpha-upper' && k.length === 1 && /[a-z]/i.test(k)) {
    char = k.toUpperCase()
  }
  model.value += char

  // One-shot shift: return to lowercase after one character
  if (shiftState.value === 'once') {
    shiftState.value = 'off'
    kbMode.value = 'alpha-lower'
  }
}

function pressConfirm() {
  beep(1000, 15)
  emit('confirm')
}

function doBackspace() {
  beep(600, 10)
  model.value = model.value.slice(0, -1)
}

// ── Long-press backspace ──
let bsTimer: ReturnType<typeof setTimeout> | null = null
let bsInterval: ReturnType<typeof setInterval> | null = null

function startBackspace() {
  doBackspace()
  bsTimer = setTimeout(() => {
    bsInterval = setInterval(doBackspace, 80)
  }, 480)
}

function stopBackspace() {
  if (bsTimer) clearTimeout(bsTimer)
  if (bsInterval) clearInterval(bsInterval)
  bsTimer = null
  bsInterval = null
}

// ── Swipe to close ──
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (touch) touchStartY = touch.clientY
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const dy = touch.clientY - touchStartY
  if (dy > 50 && props.visible) emit('close')
}

onMounted(() => {
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
})

onUnmounted(() => {
  stopBackspace()
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
})

defineExpose({ kbMode, shiftState, kbHeight })
</script>

<template>
  <!-- Overlay -->
  <Transition name="kb-fade">
    <div
      v-if="visible"
      data-testid="kb-overlay"
      class="kb-overlay fixed inset-0 z-40"
      @click="emit('close')"
    ></div>
  </Transition>

  <!-- Keyboard -->
  <Transition name="kb-slide">
    <div
      v-if="visible"
      ref="kbRef"
      data-testid="keyboard-shell"
      class="keyboard-shell z-50"
    >
      <!-- Drag handle + Top bar -->
      <div class="keyboard-topbar px-4 pb-3">
        <div class="kb-drag-handle"></div>
        <div class="flex items-center justify-between mt-3">
          <!-- Input preview -->
          <div class="kb-input-preview px-3 py-1.5 flex items-center gap-2 flex-1 mr-3 min-w-0">
            <svg
              class="w-3 h-3 text-gray-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <template v-if="inputType === 'password'">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </template>
              <template v-else>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
              </template>
            </svg>
            <span class="text-xs text-gray-300 truncate font-mono flex-1 min-w-0">
              <template v-if="!model">
                <span class="text-gray-600 italic">{{ fieldLabel || '请输入' }}</span>
              </template>
              <template v-else>{{ displayValue }}</template>
            </span>
            <span class="text-[10px] text-gray-600 shrink-0 font-mono">{{ model.length }}</span>
          </div>

          <!-- Mode pill -->
          <div class="kb-mode-pill shrink-0 mr-3" :class="modePillClass">
            {{ modeLabel }}
          </div>

          <!-- Close -->
          <button
            data-testid="kb-close"
            class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            @click="emit('close')"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Key area -->
      <div class="px-2.5 pb-4 pt-2">
        <Transition name="kb-mode" mode="out-in">
          <!-- ══════════ Alpha keyboard ══════════ -->
          <div
            v-if="kbMode === 'alpha-lower' || kbMode === 'alpha-upper'"
            :key="kbMode"
            data-testid="kb-alpha"
          >
            <!-- Row 1 -->
            <div class="grid gap-1.5 mb-1.5" style="grid-template-columns: repeat(10, 1fr)">
              <button
                v-for="k in alphaRows[0]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-char h-12"
                :class="{ 'kb-pressing': pressedKey === k }"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ kbMode === 'alpha-upper' ? k.toUpperCase() : k }}
              </button>
            </div>
            <!-- Row 2 (9 keys centered) -->
            <div class="flex justify-center gap-1.5 mb-1.5">
              <button
                v-for="k in alphaRows[1]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-char h-12"
                style="width: calc(10% - 3px)"
                :class="{ 'kb-pressing': pressedKey === k }"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ kbMode === 'alpha-upper' ? k.toUpperCase() : k }}
              </button>
            </div>
            <!-- Row 3 -->
            <div
              class="grid gap-1.5 mb-1.5"
              style="grid-template-columns: 1.6fr repeat(7, 1fr) 1.6fr"
            >
              <!-- Shift -->
              <button
                data-testid="kb-shift"
                class="kb-key kb-key-fn h-12 flex items-center justify-center gap-1"
                :class="{
                  'kb-shift-active': shiftState === 'once',
                  'kb-shift-caps': shiftState === 'caps',
                }"
                @mousedown.prevent
                @click="pressShift"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    v-if="shiftState === 'caps'"
                    d="M12 4l8 8h-4v8H8v-8H4z"
                    fill="currentColor"
                  />
                  <path
                    v-else
                    d="M12 4l8 8h-4v8H8v-8H4z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="text-[10px]">{{ shiftState === 'caps' ? '⇪' : '⇧' }}</span>
              </button>
              <!-- Letters -->
              <button
                v-for="k in alphaRows[2]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-char h-12"
                :class="{ 'kb-pressing': pressedKey === k }"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ kbMode === 'alpha-upper' ? k.toUpperCase() : k }}
              </button>
              <!-- Backspace -->
              <button
                data-testid="kb-backspace"
                class="kb-key kb-key-fn h-12"
                @mousedown.prevent
                @mousedown="startBackspace"
                @mouseup="stopBackspace"
                @mouseleave="stopBackspace"
                @touchstart.prevent="startBackspace"
                @touchend="stopBackspace"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
            <!-- Row 4 -->
            <div class="grid gap-1.5" style="grid-template-columns: 2fr 2fr 4fr 2.5fr">
              <button
                data-testid="kb-mode-123"
                class="kb-key kb-key-fn h-14 text-xs font-bold tracking-wider"
                @mousedown.prevent
                @click="switchMode('number')"
              >
                123
              </button>
              <button
                data-testid="kb-mode-sym"
                class="kb-key kb-key-fn h-14 text-xs font-bold"
                @mousedown.prevent
                @click="switchMode('symbol')"
              >
                #&@
              </button>
              <button
                data-testid="kb-space"
                class="kb-key kb-key-space h-14 text-[10px] tracking-[.15em]"
                @mousedown.prevent
                @click="pressKey(' ')"
              >
                SPACE
              </button>
              <button
                data-testid="kb-confirm"
                class="kb-key kb-key-confirm h-14"
                @mousedown.prevent
                @click="pressConfirm"
              >
                确认
              </button>
            </div>
          </div>

          <!-- ══════════ Number keyboard ══════════ -->
          <div v-else-if="kbMode === 'number'" key="number" data-testid="kb-number">
            <!-- Row 1 -->
            <div class="grid gap-1.5 mb-1.5" style="grid-template-columns: repeat(10, 1fr)">
              <button
                v-for="k in numRows[0]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-num h-12"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
            </div>
            <!-- Row 2 -->
            <div class="grid gap-1.5 mb-1.5" style="grid-template-columns: repeat(10, 1fr)">
              <button
                v-for="k in numRows[1]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-fn h-12 text-sm"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
            </div>
            <!-- Row 3 -->
            <div
              class="grid gap-1.5 mb-1.5"
              style="grid-template-columns: 1.6fr repeat(5, 1fr) 1.6fr"
            >
              <button
                data-testid="kb-mode-abc"
                class="kb-key kb-key-fn h-12 text-xs font-bold tracking-wider"
                @mousedown.prevent
                @click="switchMode('alpha-lower')"
              >
                ABC
              </button>
              <button
                v-for="k in numRows[2]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-fn h-12 text-sm"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
              <button
                data-testid="kb-backspace"
                class="kb-key kb-key-fn h-12"
                @mousedown.prevent
                @mousedown="startBackspace"
                @mouseup="stopBackspace"
                @mouseleave="stopBackspace"
                @touchstart.prevent="startBackspace"
                @touchend="stopBackspace"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
            <!-- Row 4 -->
            <div class="grid gap-1.5" style="grid-template-columns: 2fr 4fr 2.5fr">
              <button
                class="kb-key kb-key-fn h-14 text-xs font-bold"
                @mousedown.prevent
                @click="switchMode('symbol')"
              >
                #@!
              </button>
              <button
                data-testid="kb-space"
                class="kb-key kb-key-space h-14 text-[10px] tracking-[.15em]"
                @mousedown.prevent
                @click="pressKey(' ')"
              >
                SPACE
              </button>
              <button
                data-testid="kb-confirm"
                class="kb-key kb-key-confirm h-14"
                @mousedown.prevent
                @click="pressConfirm"
              >
                确认
              </button>
            </div>
          </div>

          <!-- ══════════ Symbol keyboard ══════════ -->
          <div v-else-if="kbMode === 'symbol'" key="symbol" data-testid="kb-symbol">
            <!-- Row 1 -->
            <div class="grid gap-1.5 mb-1.5" style="grid-template-columns: repeat(10, 1fr)">
              <button
                v-for="k in symRows[0]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-sym h-12 text-sm"
                :title="k"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
            </div>
            <!-- Row 2 -->
            <div class="grid gap-1.5 mb-1.5" style="grid-template-columns: repeat(10, 1fr)">
              <button
                v-for="k in symRows[1]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-sym h-12 text-sm"
                :title="k"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
            </div>
            <!-- Row 3 -->
            <div
              class="grid gap-1.5 mb-1.5"
              style="grid-template-columns: 1.6fr repeat(5, 1fr) 1.6fr"
            >
              <button
                data-testid="kb-mode-abc"
                class="kb-key kb-key-fn h-12 text-xs font-bold tracking-wider"
                @mousedown.prevent
                @click="switchMode('alpha-lower')"
              >
                ABC
              </button>
              <button
                v-for="k in symRows[2]"
                :key="k"
                data-testid="kb-key"
                class="kb-key kb-key-fn h-12 text-sm"
                @mousedown.prevent
                @click="pressKey(k)"
              >
                {{ k }}
              </button>
              <button
                data-testid="kb-backspace"
                class="kb-key kb-key-fn h-12"
                @mousedown.prevent
                @mousedown="startBackspace"
                @mouseup="stopBackspace"
                @mouseleave="stopBackspace"
                @touchstart.prevent="startBackspace"
                @touchend="stopBackspace"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
            <!-- Row 4 -->
            <div class="grid gap-1.5" style="grid-template-columns: 2fr 4fr 2.5fr">
              <button
                class="kb-key kb-key-fn h-14 text-xs font-bold tracking-wider"
                @mousedown.prevent
                @click="switchMode('number')"
              >
                123
              </button>
              <button
                data-testid="kb-space"
                class="kb-key kb-key-space h-14 text-[10px] tracking-[.15em]"
                @mousedown.prevent
                @click="pressKey(' ')"
              >
                SPACE
              </button>
              <button
                data-testid="kb-confirm"
                class="kb-key kb-key-confirm h-14"
                @mousedown.prevent
                @click="pressConfirm"
              >
                确认
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Keyboard shell ── */
.keyboard-shell {
  background: #1e2130;
  box-shadow:
    0 -8px 40px rgba(0, 0, 0, 0.5),
    0 -2px 0 rgba(255, 255, 255, 0.04);
  border-radius: 20px 20px 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@media (min-width: 768px) {
  .keyboard-shell {
    max-width: 48rem;
    margin: 0 auto;
  }
}

.keyboard-topbar {
  background: #181b27;
  border-radius: 20px 20px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.kb-drag-handle {
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9px;
  margin: 10px auto 0;
}

/* ── Input preview ── */
.kb-input-preview {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
}

/* ── Mode pill ── */
.kb-mode-pill {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    background 0.2s,
    color 0.2s;
}

.kb-mode-alpha {
  background: rgba(59, 130, 246, 0.18);
  color: #60a5fa;
}

.kb-mode-number {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.kb-mode-symbol {
  background: rgba(165, 180, 252, 0.18);
  color: #a5b4fc;
}

/* ── Overlay ── */
.kb-overlay {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

/* ── Key base ── */
.kb-key {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  position: relative;
  min-height: 44px;
  min-width: 44px;
  transition:
    background 0.1s,
    transform 0.08s,
    box-shadow 0.1s;
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.kb-key:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #3b82f6,
    0 2px 0 rgba(0, 0, 0, 0.35);
}

.kb-key:active,
.kb-key.kb-pressing {
  transform: scale(0.91) translateY(1px);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.35);
}

/* ── Key variants ── */
.kb-key-char {
  background: #3a3f4b;
  color: #e8ecf3;
  font-size: 15px;
  font-weight: 500;
}

.kb-key-char:hover {
  background: #454b59;
}

.kb-key-fn {
  background: #2a2e38;
  color: #9ca8be;
  font-size: 12px;
  font-weight: 600;
}

.kb-key-fn:hover {
  background: #333845;
}

.kb-key-confirm {
  background: #1d5fcc;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.kb-key-confirm:hover {
  background: #1a52b8;
}

.kb-key-space {
  background: #2a2e38;
  color: #6b7a99;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.kb-key-space:hover {
  background: #333845;
}

.kb-key-num {
  background: #3a3f4b;
  color: #e8ecf3;
  font-size: 17px;
  font-weight: 600;
}

.kb-key-num:hover {
  background: #454b59;
}

.kb-key-sym {
  background: #252a3d;
  color: #a5b4fc;
}

.kb-key-sym:hover {
  background: #2c3249;
}

/* ── Shift states ── */
.kb-shift-active {
  background: #1d5fcc !important;
  color: #fff !important;
}

.kb-shift-caps {
  background: #0f4bbf !important;
  color: #fff !important;
  box-shadow:
    0 2px 0 #0a3a99,
    inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
}

/* ── Slide animation ── */
.kb-slide-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.3s ease;
}

.kb-slide-leave-active {
  transition:
    transform 0.22s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.2s ease;
}

.kb-slide-enter-from,
.kb-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.kb-slide-enter-to,
.kb-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* ── Fade animation ── */
.kb-fade-enter-active,
.kb-fade-leave-active {
  transition: opacity 0.2s;
}

.kb-fade-enter-from,
.kb-fade-leave-to {
  opacity: 0;
}

/* ── Mode switch animation ── */
.kb-mode-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.kb-mode-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.kb-mode-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.kb-mode-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
