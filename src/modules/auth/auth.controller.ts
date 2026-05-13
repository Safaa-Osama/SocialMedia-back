import { Router } from "express";
import AS from "./auth.service"
import { validation } from "../../Common/middleware/validation";
import * as AV from "./auth.validation";
import { successResponse } from "../../Common/utilis/response";



const authRouter = Router()

authRouter.get("/",(req,res)=>{
successResponse({res,message:"Auth Page"})
})

authRouter.post("/sign-up",validation(AV.signUpSchema), AS.signUp);
authRouter.post("/gmail", AS.signUpWithGmail);
authRouter.post("/sign-in",  validation(AV.LoginSchema), AS.signIn);

authRouter.patch("/confirm-email",  validation(AV.confirmSchema),  AS.confirmEmail)
authRouter.patch("/resend-email",  validation(AV.emailSchema),  AS.resendOtp)




export default authRouter