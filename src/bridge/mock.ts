import type { KioskBridge } from './types'

const MOCK_PASSWORD = 'admin'
const MOCK_SERVER_URL = 'http://localhost:8080'

let serverUrl = MOCK_SERVER_URL

function delay(ms = 500) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function createMockBridge(): KioskBridge {
  return {
    app: {
      async quit() {
        await delay()
        console.log('[mock] app quit')
      },
      async restart() {
        await delay()
        console.log('[mock] app restart')
      },
    },
    machine: {
      async shutdown() {
        await delay()
        console.log('[mock] machine shutdown')
      },
      async reboot() {
        await delay()
        console.log('[mock] machine reboot')
      },
    },
    config: {
      async getServerUrl() {
        await delay(200)
        return serverUrl
      },
      async setServerUrl(url: string) {
        await delay(300)
        serverUrl = url
        console.log('[mock] server url set to:', url)
      },
    },
    auth: {
      async verify(password: string) {
        await delay(300)
        return password === MOCK_PASSWORD
      },
    },
  }
}
