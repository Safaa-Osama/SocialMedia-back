import * as z from "zod"
import { generalFields } from "../../Common/utilis/generalFields"


export const createChatSchema = {

    body: z.strictObject({
        participant: generalFields.id,
        createdBy: generalFields.id,
    })
}



