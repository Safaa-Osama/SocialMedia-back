import { Router } from "express";
import US from "./user.service"
import { successResponse } from "../../Common/utilis/response";
import { authontication } from "../../Common/middleware/authontication";
import { multer_cloud } from "../../Common/middleware/multer";
import { StoreEnum } from "../../Common/enum/multerEnum";



const userRouter = Router()

userRouter.get("/",(req,res)=>{
successResponse({res,message:"User Page"})});

userRouter.get("/profile", authontication, US.getProfile);

userRouter.get("/upload/preSigned/*path", authontication,US.getPreSignedUrl);
userRouter.get("/upload/*path", authontication,US.getFile);
userRouter.get("/upload", authontication,US.getManyFiles);


userRouter.post("/upload",multer_cloud().single("attachment"), authontication, US.uploadImage);
userRouter.post("/upload-small",multer_cloud().single("attachment"), authontication, US.uploadSmallFile);
userRouter.post("/upload-large",multer_cloud({storeType:StoreEnum.disk}).single("attachment"), authontication, US.uploadLargeFile);
userRouter.post("/upload-files",multer_cloud().array("attachments"), authontication, US.uploadFiles);
userRouter.post("/upload/preSigned",authontication, US.createPreSignedUrl);

userRouter.delete("/del",authontication,US.deleteFile)
userRouter.delete("/del-many",authontication,US.deleteManyFiles)
userRouter.delete("/del-user",authontication,US.deleteUser)





export default userRouter 