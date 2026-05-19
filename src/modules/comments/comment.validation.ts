import { generalFields } from './../../Common/utilis/generalFields';
import * as z from "zod"



export const createCommentSchema = {
    body: z.strictObject({
        content: z.string().min(3).max(1000).optional(),
        attachments: z.array(generalFields.file).optional(),
        tags: z.array(generalFields.id).optional(),

    }).superRefine((args, ctx) => {
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)]
            if (args.tags.length != uniqueTags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplicated Id"
                })
            }
        }
    }),
    params: z.strictObject({
        postId: generalFields.id,
    })

}

