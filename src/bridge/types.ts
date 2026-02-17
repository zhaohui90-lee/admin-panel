// ============================================================
// IBridge — 前端业务层使用的桥梁接口
// 对照 ARCHITECTURE.md 中 Host Protocol (window.adminAPI) 进行封装
// ============================================================

/** bridge.auth.login() 返回结果 */
export interface LoginResult {
  success: boolean
  token?: string
}

/** bridge.system.getSystemInfo() 返回的系统信息 */
export interface SystemInfo {
  cpu: {
    model: string
    usage: number // 0-100
  }
  memory: {
    total: number // bytes
    used: number  // bytes
  }
  disk: {
    total: number // bytes
    used: number  // bytes
  }
  network: {
    ip: string
    latency: number // ms
  }
  os: {
    platform: string
    version: string
    uptime: number // seconds
  }
}

/** bridge.system.getConfig() 返回的应用配置 */
export interface AppConfig {
  serverUrl: string
  deviceId: string
  version: string
}

/** 硬件设备信息 */
export interface HardwareDeviceInfo {
  id: string
  name: string
  connected: boolean
}

/** 硬件测试结果 */
export interface HardwareTestResult {
  success: boolean
  output: string
  timestamp: number
}

/** 前端唯一使用的 Bridge 接口 */
export interface IBridge {
  auth: {
    login(password: string): Promise<LoginResult>
  }
  system: {
    getSystemInfo(token: string): Promise<SystemInfo>
    getConfig(token: string): Promise<AppConfig>
  }
  power: {
    restartApp(token: string): Promise<void>
    quitApp(token: string): Promise<void>
    rebootOS(token: string): Promise<void>
    shutdownOS(token: string): Promise<void>
  }
  business: {
    reloadPage(token: string): Promise<void>
  }
  hardware: {
    getDevices(token: string): Promise<HardwareDeviceInfo[]>
    connectDevice(token: string, deviceId: string): Promise<void>
    disconnectDevice(token: string, deviceId: string): Promise<void>
    testDevice(token: string, deviceId: string, command: string): Promise<HardwareTestResult>
  }
}
