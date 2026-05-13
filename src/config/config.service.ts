import { resolve } from "node:path";
import { config } from "dotenv";

const NODE_ENV = (process.env.NODE_ENV);

config({
    path: resolve(`.env.${NODE_ENV}`)
});

export const PORT = process.env.PORT || 7000
export const DB_LOCAL = process.env.DB_LOCAL
export const REDIS_URI = process.env.REDIS_URI
export const DB_URI_ONLINE = process.env.DB_URI_ONLINE

export const SALT_ROUND = Number(process.env.SALT_ROUND)
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

export const PREFIX_USER = process.env.PREFIX_USER
export const PREFIX_ADMIN = process.env.PREFIX_ADMIN
export const SECRET_KEY_USER = process.env.SECRET_KEY_USER!
export const REFRESH_SECRET_KEY_USER = process.env.REFRESH_SECRET_KEY_USER!
export const SECRET_KEY_ADMIN = process.env.SECRET_KEY_ADMIN!
export const REFRESH_SECRET_KEY_ADMIN = process.env.REFRESH_SECRET_KEY_ADMIN!

export const PASS = process.env.PASS
export const EMAIL = process.env.EMAIL

export const CLIENT_ID = process.env.CLIENT_ID

export const AWS_REGION = process.env.AWS_REGION
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const AWS_APP_NAME = process.env.AWS_APP_NAME






