import { Router } from "express";
import PS from "./post.services"
import { successResponse } from "../../Common/utilis/response";
import { validation } from "../../Common/middleware/validation";
import * as PV from "./post.validation";
import { multer_cloud } from "../../Common/middleware/multer";
import { authontication } from "../../Common/middleware/authontication";
import commentRouter from "../comments/comment.controller";



const postRouter = Router()

postRouter.use("/:postId/comments", commentRouter)

postRouter.get("/", (req, res) => {
    successResponse({ res, message: "Post Page" })
});
postRouter.get("/allPosts", PS.getAllPosts);

postRouter.post("/create", multer_cloud().array("attachments", 3), validation(PV.createPostSchema),
    authontication, PS.createPost);

postRouter.patch("/:postId", authontication, validation(PV.likePostSchema), PS.likeDislikePosts);
postRouter.put("/update/:postId", authontication, validation(PV.updatePostSchema), PS.updatePost);


export default postRouter