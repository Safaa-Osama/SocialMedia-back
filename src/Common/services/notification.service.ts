import { readFileSync } from "node:fs";
import { resolve } from "node:path"
import admin from "firebase-admin"


class NotificationService {

    private readonly client: admin.app.App
    constructor() {
        var serviceAccount = JSON.parse(readFileSync(resolve(
            __dirname, "../../config/social-media-be-af598-firebase-adminsdk-fbsvc-4c6f490d61.json"
        )) as unknown as string)

        this.client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    async sendNotification({ token, data }: {
        token: string,
        data: { title: string, body: string }
    }) {
        const message = {
            token, data
        }

        return await this.client.messaging().send(message)
    }

    async sendNotifications({ tokens, data }: {
        tokens: string[],
        data: { title: string, body: string }
    }) {
        const message = {
            tokens, data
        }

        await Promise.all(tokens.map((token) => {
            return this.sendNotification({ token, data })
        }))
    }


}

export default new NotificationService()