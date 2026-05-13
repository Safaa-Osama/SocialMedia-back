import crypto from "node:crypto"


export const ENCRYPTION_KEY = Buffer.from("21345pwng545648ma65456aslo554564")
const IV_LENGTH = 32;

export function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, "utf-8", "hex");

    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();


    return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted;

}


export function decrypt(text: string) {
    const [ivHex, tagHex, encryptedText] = text.split(":");

    const iv = Buffer.from(ivHex!, "hex");
    const tag = Buffer.from(tagHex!, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText!, "hex", "utf-8");

    decrypted += decipher.final("utf-8");

    return decrypted;

}