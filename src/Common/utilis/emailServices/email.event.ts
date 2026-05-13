import { EventEmitter } from "node:events";
import { EventEnum } from "../../enum/eventEnum";

export const eventEmitter = new EventEmitter();

eventEmitter.on(EventEnum.confirmEmail, async (fn)=>{
await fn()
})