import * as z from "zod";
import { createPostSchema, likePostSchema, updatePostSchema } from "./post.validation";


export type CreatePostDto = z.infer<typeof createPostSchema.body>

export type UpdatePostDto = z.infer<typeof updatePostSchema.body>

export type LikePostDto = z.infer<typeof likePostSchema.params>
