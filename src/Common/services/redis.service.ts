import { createClient, RedisClientType } from 'redis';
import { REDIS_URI } from '../../config/config.service';
import { Types } from 'mongoose';
import { EventEnum } from '../enum/eventEnum';


class RedisService {
    private readonly client: RedisClientType

    constructor() {
        this.client = createClient({ url: REDIS_URI! })
        this.handleEvent()
    }

    handleEvent() {
        this.client.on("error", (error) => {
            console.log("Failed to connect Redis", error)
        })
    }

    async connect() {
        this.client.connect()
        console.log("Redis services Connected")
    }


    setValue = async ({ key, value, ttl }: {
        key: string, value: string | object, ttl: number
    }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data,)
        } catch (error) {
            console.log("error to set operation", error)
        }
    }

    getValue = async (key: string) => {
        try {
            try {
                return JSON.parse(await this.client.get(key) as string)
            } catch (error) {
                return await this.client.get(key)
            }
        } catch (error) {
            console.log("error to get operation", error)
        }
    }

    update = async ({ key, value, ttl }: {
        key: string, value: string, ttl: number
    }) => {
        try {
            if (!await this.client.exists(key)) { return 0 }
            await this.setValue({ key, value, ttl })
            return 1
        } catch (error) {
            console.log("error to update operation", error)
        }
    }

    ttl = async (key: string) => {
        try {
            return await this.client.ttl(key)
        } catch (error) {
            console.log("error to get ttl operation", error)
        }
    }

    exist = async (key: string) => {
        try {
            return await this.client.exists(key)
        } catch (error) {
            console.log("error on exist operation", error)
        }
    }

    expire = async ({ key, ttl }: { key: string, ttl: number }) => {
        try {

            return await this.client.expire(key, ttl)
        } catch (error) {
            console.log("error on expire operation", error)
        }
    }

    delKey = async (key: string | string[]) => {
        try {
            if (!key || (Array.isArray(key) && key.length === 0)) { return 0 }
            return await this.client.del(key)
        } catch (error) {
            console.log("error on delete operation", error)
        }
    }

    Keys = async (pattern: string) => {
        try {
            return await this.client.keys(`${pattern}*`)
        } catch (error) {
            console.log("error to get keys", error)
        }
    }

    revokedKey = ({ userId, jti }: { userId: Types.ObjectId, jti: string }) => {
        return `revoke-token::${userId}::${jti}`
    }

    getKey = (userId: Types.ObjectId) => {
        return `revoke-token::${userId}`
    }

    otpKey = ({ email, subject = EventEnum.confirmEmail }: {
        email: string, subject?: EventEnum
    }) => {
        return `otp::${email}::${subject}`
    }

    maxOtp = (email: string) => {
        return `otp::${email}::max_tries`
    }

    blockOtp = (email: string) => {
        return `otp::${email}::blocked`
    }

    inc = async (key: string) => {
        try {
            return await this.client.incr(key)
        } catch (error) {
            console.log("error to increament", error)
        }
    }

    // NOTIFICATION
    myKey = (userId: Types.ObjectId) => {
        return `user::FCM::${userId}`
    }

    async addFCM({ userId, FCMToken }: {
        userId: Types.ObjectId,
        FCMToken: string
    }) {
        return await this.client.sAdd(this.myKey(userId), FCMToken)
    }

    async removeFCM({ userId, FCMToken }: {
        userId: Types.ObjectId,
        FCMToken: string
    }) {
        return await this.client.sRem(this.myKey(userId), FCMToken)
    }

    async getFCMs(userId: Types.ObjectId) {
        return await this.client.sMembers(this.myKey(userId))
    }

    async hasFCM(userId: Types.ObjectId) {
        return await this.client.sCard(this.myKey(userId))
    }

    async removeFCMUser(userId: Types.ObjectId) {
        return await this.client.del(this.myKey(userId))
    }

}

export default new RedisService()