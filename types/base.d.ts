import { EventEmitter } from 'events'

interface ServiceInstance {
  [key: string]: any
}
interface Services {
  [key: string]: ServiceInstance
}
declare class Base extends EventEmitter {
  conf: any
  ctx: { root: string; env: 'production' | 'development'; worker: string }
  stopping: boolean
  active: number
  servicesArgs: Array<{ opts: Object; name: string; library: string }>
  services: Services

  constructor(
    conf: any,
    ctx: {
      root: string
      env: 'production' | 'development'
      worker: string
    }
  )

  init(): void
  _init(): void
  addServices(): void
  deleteServices(): void
  stop(cb: (err?: Error | null, results?: any) => void): void
  start(cb: (err?: Error | null, results?: any) => void): void
  _stop(cb: (err?: Error | null, results?: any) => void): void
  _start(cb: (err?: Error | null, results?: any) => void): void
}

export default Base
