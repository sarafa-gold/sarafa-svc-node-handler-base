import { EventEmitter } from "events";

declare class Base extends EventEmitter {
    conf: any;
    ctx: { root: string; env: "production" | "development"; worker: string; };
    stopping: boolean;
    active: number;

    constructor(conf: any, ctx: {
        root: string;
        env: "production" | "development";
        worker: string;
    });

    init(): void;
    addServices(): void;
    deleteServices(): void;
    stop(cb: (err?: Error | null, results?: any) => void): void;
    start(cb: (err?: Error | null, results?: any) => void): void;
}

export default Base;
