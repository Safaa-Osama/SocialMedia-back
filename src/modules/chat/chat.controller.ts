import { Router } from "express";
import chatService from "./chat.service";
import { authentication } from "../../Common/middleware/authentication";





const chatRouter = Router({ mergeParams: true })

chatRouter.post("/",)
chatRouter.get("/", authentication, chatService.getChat)
chatRouter.delete("/",)
chatRouter.patch("/",)


export default chatRouter