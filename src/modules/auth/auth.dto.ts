import * as z from "zod";
import { confirmSchema, emailSchema, gmailSchema, LoginSchema, signUpSchema, updateSchema } from "./auth.validation";


export type ConfirmDto = z.infer<typeof confirmSchema.body>

export type EmailDto = z.infer<typeof emailSchema.body>

export type SignUpDto = z.infer<typeof signUpSchema.body>

export type GmailDto = z.infer<typeof gmailSchema.body>;

export type LoginDto = z.infer<typeof LoginSchema.body>

export type UpdatePassDto = z.infer<typeof updateSchema.body>






