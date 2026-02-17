import { getBridge } from '@/bridge'
import type { IBridge } from '@/bridge'

export function useBridge(): IBridge {
  return getBridge()
}
