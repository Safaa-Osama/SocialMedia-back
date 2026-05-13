import { Router } from "express";
import * as CS from "./comment.service"
import { successResponse } from "../../Common/utilis/response";



const commentRouter = Router()

commentRouter.get("/",(req,res)=>{
successResponse({res,message:"Comment Page"})
});

export default commentRouter