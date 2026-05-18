import * as z from "zod"
import { generalFields } from "../../Common/utilis/generalFields"
import { allowCommentEnum, availabilityEnum } from "../../Common/enum/postEnum"


export const createPostSchema = {

    body: z.strictObject({
        content: z.string().min(3).max(1000).optional(),
        attachments: z.array(z.any()).optional(),

        allowComment: z.enum(allowCommentEnum).default(allowCommentEnum.allowed).optional(),
        availability: z.enum(availabilityEnum).default(availabilityEnum.public).optional(),

        tags: z.array(generalFields.id).optional()

    }).superRefine((args, ctx) => {
        if (!args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "you should at least add content or upload attachments"
            })
        }

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
    })
}


export const likePostSchema = {
    params: z.strictObject({
        postId: generalFields.id
    })
}


export const updatePostSchema = {
    body: z.strictObject({
        content: z.string().min(3).max(1000).optional(),
        attachments: z.array(generalFields.file).optional(),
        removeFiles: z.array(z.string()).optional(),

        allowComment: z.enum(allowCommentEnum).default(allowCommentEnum.allowed).optional(),
        availability: z.enum(availabilityEnum).default(availabilityEnum.public).optional(),

        tags: z.array(generalFields.id).optional(),
        removeTags: z.array(generalFields.id).optional()

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

    params: likePostSchema.params
}

