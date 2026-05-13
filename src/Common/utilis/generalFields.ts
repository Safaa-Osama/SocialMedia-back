import * as z from "zod"
import { GenderEnum, ProviderEnum, RoleEnum } from "../enum/userEnum"
import { Types } from "mongoose"
<<<<<<< HEAD
=======
import { buffer } from "node:stream/consumers"
>>>>>>> b1233bf (Pagination commit)


export const generalFields = {
    firstName: z.string({ error: "Name is required" }).min(3).max(10),
    lastName: z.string({ error: "Name is required" }).min(3).max(15),
    userName: z.string().min(7).max(40),
    email: z.email(),
    age: z.number(),
<<<<<<< HEAD
    password: z.string().regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/))
        .length(8, {
            error:
                "Password must contain 8 characters include numbers, upperCase, lowerCase, special Char one at least"
        }),
=======
>>>>>>> b1233bf (Pagination commit)
    gender: z.enum(GenderEnum),
    phone: z.string().regex(new RegExp(/^01[0125][0-9]{8}$/)),
    provider: z.enum(ProviderEnum),
    role: z.enum(RoleEnum),
    otp: z.string().regex(/^\d{6}$/),
<<<<<<< HEAD
=======
    password: z.string().regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/))
        .length(8, {
            error:
                "Password must contain 8 characters include numbers, upperCase, lowerCase, special Char one at least"
        }),
>>>>>>> b1233bf (Pagination commit)
    file: z.object({
        fieldname: z.string(),
        originalname: z.string(),
        destination: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        filename: z.string(),
<<<<<<< HEAD
        path: z.string(),
=======
        path: z.string().optional(),
        buffer: z.string().optional(),
>>>>>>> b1233bf (Pagination commit)
        size: z.number(),
    }),
    id: z.string().refine((value) => {
        const isValid = Types.ObjectId.isValid(value)
        return isValid ? value : ("invalid id")
    }),
}

