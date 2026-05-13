import { SALT_ROUND } from './../../config/config.service';
import { hashSync, compareSync } from "bcrypt"



export function hash({ text, salt_rounds = SALT_ROUND }: {
    text: string,
    salt_rounds?: number
}): string {
    return hashSync(text.toString(), Number(salt_rounds))
}

export function compare({ text, cipherTxt }: {
    text: string,
    cipherTxt: string
}): boolean {
    return compareSync(text, cipherTxt)
}