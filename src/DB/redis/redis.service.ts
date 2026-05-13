// import { EventEnum } from "../../Common/enum/eventEnum";
// import { redisClient } from "./redis.connect"
// import { Types } from 'mongoose';

// export const setValue = async ({ key, value, ttl }: {
//     key: string, value: string | object, ttl: number
// }) => {
//     try {
//         const data = typeof value === "string" ? value : JSON.stringify(value);
//         ttl ? await redisClient.set(key, data, { EX: ttl }) : await redisClient.set(key, data,)
//     } catch (error) {
//         console.log("error to set operation",error)
//     }
// }

// export const getValue = async (key: string) => {
//     try {
//         try {
//             return JSON.parse(await redisClient.get(key) as string)
//         } catch (error) {
//             return await redisClient.get(key)
//         }
//     } catch (error) {
//         console.log("error to get operation",error)
//     }
// }

// export const update = async ({ key, value, ttl }: {
//     key: string, value: string, ttl: number
// }) => {
//     try {
//         if (!await redisClient.exists(key)) { return 0 }
//         await setValue({ key, value, ttl })
//         return 1
//     } catch (error) {
//         console.log("error to update operation",error)
//     }
// }

// export const ttl = async (key: string) => {
//     try {
//         return await redisClient.ttl(key)
//     } catch (error) {
//         console.log("error to get ttl operation",error)
//     }
// }

// export const exist = async (key: string) => {
//     try {
//         return await redisClient.exists(key)
//     } catch (error) {
//         console.log("error on exist operation",error)
//     }
// }

// export const expire = async ({ key, ttl }: { key: string, ttl: number }) => {
//     try {

//         return await redisClient.expire(key, ttl)
//     } catch (error) {
//         console.log("error on expire operation",error)
//     }
// }

// export const delKey = async (key: string | string[]) => {
//     try {
//         if (!key || (Array.isArray(key) && key.length === 0)) { return 0 }
//         return await redisClient.del(key)
//     } catch (error) {
//         console.log("error on delete operation",error)
//     }
// }

// export const Keys = async (pattern: string) => {
//     try {
//         return await redisClient.keys(`${pattern}*`)
//     } catch (error) {
//         console.log("error to get keys", error)
//     }
// }

// export const rewvokedKey = ({ userId, jti }: { userId: Types.ObjectId, jti: string }) => {
//     return `revoke-token::${userId}::${jti}`
// }

// export const getKey = (userId: Types.ObjectId) => {
//     return `revoke-token::${userId}`
// }

// export const otpKey = ({ email, subject = EventEnum.confirmEmail }: {
//     email: string, subject?: EventEnum
// }) => {
//     return `otp::${email}::${subject}`
// }

// export const maxOtp = (email: string) => {
//     return `otp::${email}::max_tries`
// }

// export const blockOtp = (email: string) => {
//     return `otp::${email}::blocked`
// }

// export const inc = async (key: string) => {
//     try {
//         return await redisClient.incr(key)
//     } catch (error) {
//         console.log("error to increament",error)
//     }
// }
