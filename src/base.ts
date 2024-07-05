import EventEmitter from "events";
import async from 'async'

class Base extends EventEmitter {
    conf: any;
    ctx: { root: string; env: "production" | "development"; worker: string; };
    stopping: boolean = false
    active: number;


    constructor(conf: any, ctx: {
        root: string;
        env: "production" | "development";
        worker: string;
    }) {
        super()

        this.conf = conf
        this.ctx = ctx
        this.active = 0
    }
    init() {
    }

    addServices() {

    }

    deleteServices() {

    }

    stop(cb: (err?: Error | null, results?: any) => void) {
        const asyncSeries = []
        asyncSeries.push((next: () => any) => { this.deleteServices(); next() })
        asyncSeries.push((next: () => void) => {
            this.active = 0;
            next();
        });
        this.stopping = true

        async.series(asyncSeries, cb)
    }
    start(cb: (err?: Error | null, results?: any) => void) {
        const asyncSeries = []
        asyncSeries.push((next: () => any) => { this.addServices(); next() })
        asyncSeries.push((next: () => void) => {
            this.active = 1;
            next();
        });
        async.series(asyncSeries, (err) => {
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