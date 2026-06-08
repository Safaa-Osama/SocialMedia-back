import { Router } from "express";
import CS from "./comment.service"
import { successResponse } from "../../Common/utilis/response";
import { multer_cloud } from "../../Common/middleware/multer";
import { validation } from "../../Common/middleware/validation";
import * as CV from "./comment.validation"
import { authentication } from "../../Common/middleware/authentication";

const commentRouter = Router({ mergeParams: true })

commentRouter.get("/", (req, res) => {
    successResponse({ res, message: "Comment Page" })
});


commentRouter.get("/", authentication, CS.getPostComment)
commentRouter.get("/allposts", authentication, CS.getPostComment)



commentRouter.post("/create/:postId", multer_cloud().array("attachments", 3), authentication,
    validation(CV.createCommentSchema), CS.createCommentReply)


export default commentRouter