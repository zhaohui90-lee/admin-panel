import { ref, computed } from 'vue'
import type { KeyboardInputType } from '@/components/VirtualKeyboard.vue'

interface FieldConfig {
  type: KeyboardInputType
  label: string
}

/**
 * Manages multi-field virtual keyboard state.
 * Each field has its own value, type, and label.
 * Opening the keyboard targets a specific field.
 */
export function useVirtualKeyboard<T extends string>(
  fields: Record<T, FieldConfig>,
) {
  const activeField = ref<T | null>(null) as { value: T | null }
  const values = ref<Record<T, string>>(
    Object.fromEntries(Object.keys(fields).map((k) => [k, ''])) as Record<T, string>,
  ) as { value: Record<T, string> }

  const keyboardVisible = computed(() => activeField.value !== null)

  const currentInputType = computed<KeyboardInputType>(() => {
    if (!activeField.value) return 'text'
    return fields[activeField.value].type
  })

  const currentFieldLabel = computed(() => {
    if (!activeField.value) return ''
    return fields[activeField.value].label
  })

  const currentValue = computed({
    get: () => (activeField.value ? values.value[activeField.value] : ''),
    set: (v: string) => {
      if (activeField.value) values.value[activeField.value] = v
    },
  })

  function openKeyboard(field: T) {
    activeField.value = field
  }

  function closeKeyboard() {
    activeField.value = null
  }

  return {
    activeField,
    values,
    keyboardVisible,
    currentInputType,
    currentFieldLabel,
    currentValue,
    openKeyboard,
    closeKeyboard,
  }
}
