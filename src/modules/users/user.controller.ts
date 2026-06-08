import { Router } from "express";
import US from "./user.service"
import { successResponse } from "../../Common/utilis/response";
import { authentication } from "../../Common/middleware/authentication";
import { multer_cloud } from "../../Common/middleware/multer";
import { StoreEnum } from "../../Common/enum/multerEnum";



const userRouter = Router()

userRouter.get("/",(req,res)=>{
successResponse({res,message:"User Page"})});

userRouter.get("/profile", authentication, US.getProfile);

userRouter.get("/upload/preSigned/*path", authentication,US.getPreSignedUrl);
userRouter.get("/upload/*path", authentication,US.getFile);
userRouter.get("/upload", authentication ,US.getManyFiles);


userRouter.post("/upload",multer_cloud().single("attachment"), authentication, US.uploadImage);
userRouter.post("/upload-small",multer_cloud().single("attachment"), authentication, US.uploadSmallFile);
userRouter.post("/upload-large",multer_cloud({storeType:StoreEnum.disk}).single("attachment"), authentication, US.uploadLargeFile);
userRouter.post("/upload-files",multer_cloud().array("attachments"), authentication, US.uploadFiles);
userRouter.post("/upload/preSigned",authentication, US.createPreSignedUrl);

userRouter.delete("/del",authentication,US.deleteFile)
userRouter.delete("/del-many",authentication,US.deleteManyFiles)
userRouter.delete("/del-user",authentication,US.deleteUser)


export default userRouter 