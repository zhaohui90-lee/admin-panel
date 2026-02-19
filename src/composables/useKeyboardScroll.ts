import { watch, type Ref } from 'vue'

/**
 * When `visible` becomes true, scroll `targetRef` element into view
 * so the input isn't hidden behind a virtual keyboard.
 */
export function useKeyboardScroll(
  targetRef: Ref<HTMLElement | null>,
  visible: Ref<boolean>,
) {
  watch(visible, (show) => {
    if (show && targetRef.value) {
      // Small delay to let keyboard render first
      setTimeout(() => {
        targetRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  })
}
