import * as z from "zod"
import { GenderEnum, ProviderEnum, RoleEnum } from "../enum/userEnum"
import { Types } from "mongoose"


export const generalFields = {
    firstName: z.string({ error: "Name is required" }).min(3).max(10),
    lastName: z.string({ error: "Name is required" }).min(3).max(15),
    userName: z.string().min(7).max(40),
    email: z.email(),
    age: z.number(),
    gender: z.enum(GenderEnum),
    phone: z.string().regex(new RegExp(/^01[0125][0-9]{8}$/)),
    provider: z.enum(ProviderEnum),
    role: z.enum(RoleEnum),
    otp: z.string().regex(/^\d{6}$/),
    password: z.string().regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/))
        .length(8, {
            error:
                "Password must contain 8 characters include numbers, upperCase, lowerCase, special Char one at least"
        }),
    id: z.string().refine((value) => {
        const isValid = Types.ObjectId.isValid(value)
        return isValid ? value : ("invalid id")
    }),
    file: z.object({
        fieldname: z.string().optional(),
        originalname: z.string().optional(),
        destination: z.string().optional(),
        encoding: z.string().optional(),
        mimetype: z.string().optional(),
        filename: z.string().optional(),
        size: z.number().optional(),
    }),

}

