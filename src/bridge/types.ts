export interface KioskBridge {
  app: {
    quit(): Promise<void>
    restart(): Promise<void>
  }
  machine: {
    shutdown(): Promise<void>
    reboot(): Promise<void>
  }
  config: {
    getServerUrl(): Promise<string>
    setServerUrl(url: string): Promise<void>
  }
  auth: {
    verify(password: string): Promise<boolean>
  }
}
