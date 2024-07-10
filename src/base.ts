import EventEmitter from 'events'
import async from 'async'

interface Service {
  new (args: { opts: Object; name: string }): ServiceInstance
}

interface ServiceInstance {
  [key: string]: any
}

interface Services {
  [key: string]: ServiceInstance
}

class Base extends EventEmitter {
  conf: any
  ctx: { root: string; env: 'production' | 'development'; worker: string }
  stopping: boolean = false
  active: number
  servicesArgs: Array<{ opts: Object; name: string; library: string }> = []
  services: Services = {}

  constructor (
    conf: any,
    ctx: {
      root: string
      env: 'production' | 'development'
      worker: string
    }
  ) {
    super()

    this.conf = conf
    this.ctx = ctx
    this.active = 0
  }
  init () {}

  addServices () {
    this.servicesArgs.forEach(service =>
      this.addService(service.name, service.library, service.opts)
    )
  }

  addService (name: string, library: string, opts: Object) {
    let svcImport = null
    try {
      svcImport = require(library)
    } catch (e) {
      console.log('Error occurrec in addService', e, name, library)
    }
    if (!svcImport) {
      return null
    }
    const service = new svcImport({ opts, name })
    if (!this.services[name]) {
      service.start(() => console.log('Start service', name, library))
      this.services[name] = service
    } else {
      console.log('Service already added', name, library)
    }
  }

  deleteServices () {
    Object.keys(this.services).forEach(serviceName => {
      this.services[serviceName].stop()
      delete this.services[serviceName]
    })
  }

  _start (cb: (err?: Error | null, results?: any) => void) {}

  _stop (cb: (err?: Error | null, results?: any) => void) {}

  stop (cb: (err?: Error | null, results?: any) => void) {
    const asyncSeries = []
    asyncSeries.push((next: () => any) => {
      this._stop(next)
    })
    asyncSeries.push((next: () => any) => {
      this.deleteServices()
      next()
    })
    asyncSeries.push((next: () => void) => {
      this.active = 0
      next()
    })
    this.stopping = true

    async.series(asyncSeries, cb)
  }
  start (cb: (err?: Error | null, results?: any) => void) {
    const asyncSeries = []
    asyncSeries.push((next: () => any) => {
      this.addServices()
      next()
    })
    asyncSeries.push((next: () => void) => {
      this.active = 1
      next()
    })
    asyncSeries.push((next: () => any) => {
      this._start(next)
    })
    async.series(asyncSeries, err => {
      if (err) {
        console.trace()
        throw err
      }

      process.nextTick(() => {
        this.emit('started')
        cb()
      })
    })
  }
}

export default Base
