import * as z from "zod"
import { generalFields } from "../../Common/utilis/generalFields"
import { ProviderEnum } from "../../Common/enum/userEnum";

export const emailSchema = {
    body: z.strictObject({
        email: generalFields.email
    })
}

export const LoginSchema = {
    body: emailSchema.body.safeExtend({
        password: generalFields.password,
        fcm:z.string().optional()
    })
}

export const signUpSchema = {
    body: LoginSchema.body.safeExtend({
        firstName: z.string({ error: "firstName is required" }).min(3).max(25),
        lastName: z.string({ error: "lastName is required" }).min(3).max(25),
        cPassword: z.string(),
        age: generalFields.age.optional(),
        gender: generalFields.gender.optional(),
        phone: generalFields.phone,
        provider: generalFields.provider.optional(),
        role: generalFields.role.optional()
    }).refine((value) => {
        return value.password == value.cPassword
    }, {
        error: "password doesn't match cPassword",
        path: ["cPassword"]
    }),
}

export const confirmSchema = {
    body: emailSchema.body.safeExtend({
        otp: generalFields.otp
    })
}

export const gmailSchema = {
    body: emailSchema.body.safeExtend({
        name: generalFields.userName,
        email_verified: z.boolean(),
        profilePic: z.string().optional(),
        provider: z.string(ProviderEnum.google)
    })
}

export const updateSchema = {
    body: z.strictObject({
        newPassword: generalFields.password,
        cPassword:z.string(),
        oldPassword: generalFields.password
    }). refine((value) => {
        return value.newPassword == value.cPassword
    }, {
        error: "New Password doesn't match cPassword",
        path: ["cPassword"]
    }),
}