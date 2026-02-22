import { describe, it, expect } from 'vitest'
import { useVirtualKeyboard } from '../composables/useVirtualKeyboard'

function createKb() {
  return useVirtualKeyboard({
    staffId: { type: 'text', label: '员工工号' },
    password: { type: 'password', label: '登录密码' },
    cardNumber: { type: 'text', label: '卡号' },
  })
}

describe('useVirtualKeyboard', () => {
  it('initializes with all values empty', () => {
    const kb = createKb()
    expect(kb.values.value.staffId).toBe('')
    expect(kb.values.value.password).toBe('')
    expect(kb.values.value.cardNumber).toBe('')
  })

  it('keyboard starts hidden', () => {
    const kb = createKb()
    expect(kb.keyboardVisible.value).toBe(false)
    expect(kb.activeField.value).toBeNull()
  })

  it('openKeyboard sets activeField and makes keyboard visible', () => {
    const kb = createKb()
    kb.openKeyboard('staffId')
    expect(kb.activeField.value).toBe('staffId')
    expect(kb.keyboardVisible.value).toBe(true)
  })

  it('closeKeyboard hides keyboard and clears activeField', () => {
    const kb = createKb()
    kb.openKeyboard('staffId')
    kb.closeKeyboard()
    expect(kb.activeField.value).toBeNull()
    expect(kb.keyboardVisible.value).toBe(false)
  })

  it('currentInputType reflects the active field type', () => {
    const kb = createKb()
    expect(kb.currentInputType.value).toBe('text') // default when no field

    kb.openKeyboard('password')
    expect(kb.currentInputType.value).toBe('password')

    kb.openKeyboard('staffId')
    expect(kb.currentInputType.value).toBe('text')
  })

  it('currentFieldLabel reflects the active field label', () => {
    const kb = createKb()
    expect(kb.currentFieldLabel.value).toBe('')

    kb.openKeyboard('staffId')
    expect(kb.currentFieldLabel.value).toBe('员工工号')

    kb.openKeyboard('password')
    expect(kb.currentFieldLabel.value).toBe('登录密码')
  })

  it('currentValue reads and writes the active field value', () => {
    const kb = createKb()
    kb.openKeyboard('staffId')

    kb.currentValue.value = 'EMP001'
    expect(kb.values.value.staffId).toBe('EMP001')
    expect(kb.currentValue.value).toBe('EMP001')
  })

  it('currentValue writes to correct field when switching', () => {
    const kb = createKb()

    kb.openKeyboard('staffId')
    kb.currentValue.value = 'EMP001'

    kb.openKeyboard('password')
    kb.currentValue.value = 'secret'

    expect(kb.values.value.staffId).toBe('EMP001')
    expect(kb.values.value.password).toBe('secret')
  })

  it('currentValue is empty string when no field is active', () => {
    const kb = createKb()
    expect(kb.currentValue.value).toBe('')
  })

  it('writing currentValue when no field is active is a no-op', () => {
    const kb = createKb()
    kb.currentValue.value = 'ignored'
    expect(kb.values.value.staffId).toBe('')
    expect(kb.values.value.password).toBe('')
  })

  it('switching between fields preserves previous values', () => {
    const kb = createKb()

    kb.openKeyboard('staffId')
    kb.currentValue.value = 'EMP001'

    kb.openKeyboard('password')
    kb.currentValue.value = '1234'

    kb.openKeyboard('staffId')
    expect(kb.currentValue.value).toBe('EMP001')
  })
})
