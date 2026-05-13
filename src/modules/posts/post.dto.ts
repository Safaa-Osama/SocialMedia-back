import * as z from "zod";
import { createPostSchema, likePostSchema } from "./post.validation";


export type CreatePostDto = z.infer<typeof createPostSchema.body>
export type LikePostDto = z.infer<typeof likePostSchema.params>
