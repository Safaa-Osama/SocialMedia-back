import { Router } from "express";
import chatService from "./chat.service";
import { authentication } from "../../Common/middleware/authentication";
import { multer_cloud } from "../../Common/middleware/multer";
import { MulterEnum, StoreEnum } from "../../Common/enum/multerEnum";





const chatRouter = Router({ mergeParams: true })

chatRouter.post("/group", authentication,
    multer_cloud({ storeType: StoreEnum.memory, customType: MulterEnum.image }).single("attachment"),
    chatService.createGroupChat)
chatRouter.get("/", authentication, chatService.getChat)
chatRouter.delete("/",)
chatRouter.patch("/",)


export default chatRouter