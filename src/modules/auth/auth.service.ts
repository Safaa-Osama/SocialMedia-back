import { Notification } from './../../../node_modules/firebase-admin/lib/messaging/messaging-api.d';
import { NextFunction, Request, Response } from "express"
import { successResponse } from "../../Common/utilis/response"
import { IUser } from "../../DB/models/user.model";
import { AppError } from "../../Common/middleware/globalError";
import { HydratedDocument } from "mongoose";
import { ConfirmDto, EmailDto, LoginDto, SignUpDto, UpdatePassDto } from "./auth.dto";
import UserRepo from "../../DB/reposetories/user-repo";
import { compare, hash } from "../../Common/security/hash";
import { generateOtp, sendMail } from "../../Common/utilis/emailServices/sendMail";
import { emailTemplete } from "../../Common/utilis/emailServices/email.templete";
import TokenService from "../../Common/services/token.service";
import { CLIENT_ID, SECRET_KEY_USER, SECRET_KEY_ADMIN, REFRESH_SECRET_KEY_USER, REFRESH_SECRET_KEY_ADMIN } from "../../config/config.service";
import { eventEmitter } from "../../Common/utilis/emailServices/email.event";
import { EventEnum } from "../../Common/enum/eventEnum";
import { ProviderEnum, RoleEnum } from '../../Common/enum/userEnum';
import RedisService from '../../Common/services/redis.service';
import { randomUUID } from "node:crypto";
import { encryptValue } from "../../Common/security/crypto.encrypt";
import { OAuth2Client } from "google-auth-library";
import NotificationService from "../../Common/services/notification.service"



class AuthService {
    private readonly _userRepo = UserRepo
    private readonly _redisService = RedisService
    private readonly _tokenService = TokenService
    private readonly _notificationService = NotificationService


    constructor() { }


    sendEmail = async ({ email, subject }: { email: string, subject: EventEnum }) => {

        const isBlocked = await this._redisService.ttl(this._redisService.blockOtp(email))
        if (isBlocked && isBlocked > 0) {
            throw new Error(`You are blocked, Try again after ${isBlocked} seconds`)
        }

        const ttl = await this._redisService.ttl(this._redisService.otpKey({ email, subject: EventEnum.confirmEmail }));
        if (ttl && ttl > 0) {
            throw new Error(`can not sent OTP after ${ttl} seconds`)
        }

        const maximumOtp = await this._redisService.getValue(this._redisService.maxOtp(email))
        if (maximumOtp > 3) {
            await this._redisService.setValue({ key: this._redisService.blockOtp(email), value: "1", ttl: 60 * 3 })
            throw new Error("you have exceeded the maximum number of tries")
        }

        const otp = await generateOtp();
        eventEmitter.emit(EventEnum.confirmEmail, async () => {
            await sendMail({
                to: email,
                subject: "Welcome to SocailMedia-App",
                html: emailTemplete(otp)
            })
        }
        )

        await this._redisService.setValue({
            key: this._redisService.otpKey({ email, subject: EventEnum.confirmEmail }),
            value: hash({ text: `${otp}` }),
            ttl: 60 * 3
        });

        await this._redisService.inc(this._redisService.maxOtp(email))
    }


    signUp = async (req: Request, res: Response, next: NextFunction) => {
        let { firstName, lastName, email, password, cPassword, phone, gender, age }: SignUpDto = req.body;

        if (password !== cPassword) {
            throw new AppError("invalid password", 400)
        }

        if (await this._userRepo.findOne({ filter: { email } })) {
            throw new AppError("User is alraady exist", 409)
        }

        const user: HydratedDocument<IUser> = await this._userRepo.create({
            firstName, lastName, email,
            password,
            phone: encryptValue({ value: phone }),
            age, gender
        } as Partial<IUser>)

        successResponse({
            res, status: 201, message: "sign up successfully", data: user
        })
    }


    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp }: ConfirmDto = req.body

        const otpExist = await this._redisService.getValue(
            this._redisService.otpKey({
                email, subject: EventEnum.confirmEmail
            })
        )
        if (!otpExist) {
            throw new AppError("Expired OTP or Invalid email")
        }

        if (!compare({ text: otp, cipherTxt: otpExist })) {
            throw new AppError("Invalid OTP")
        }

        const user = await this._userRepo.findOneAndUpdate({
            filter: {
                email,
                confirmed: false,
                provider: ProviderEnum.system
            },
            update: { confirmed: true }
        })
        if (!user) {
            throw new AppError("User is not exist or already confirmed")
        }
        await this._redisService.delKey(this._redisService.otpKey({ email, subject: EventEnum.confirmEmail }))
        await this._redisService.delKey(this._redisService.maxOtp(email))

        successResponse({ res, message: "Email confirmed", data: user })
    }


    resendOtp = async (req: Request, res: Response, next: NextFunction) => {

        const { email }: EmailDto = req.body

        const user = this._userRepo.findOne({
            filter: { email, confirmed: false, provider: ProviderEnum.system }
        })

        if (!user) {
            throw new Error("User is not exist or Emial is not confirmed")
        }

        await this.sendEmail({ email, subject: EventEnum.confirmEmail })

        successResponse({ res, message: "Otp send again" })
    }

    signUpWithGmail = async (req: Request, res: Response, next: NextFunction) => {
        const { idToken } = req.body;

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID!
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new AppError("Invalid Google token payload", 400);
        }
        const { email, email_verified, name, picture } = payload;

        if (!email) {
            throw new AppError("Email not found in Google token", 400);
        }

        let user = await this._userRepo.findOne({ filter: { email } });
        if (user && user.provider != ProviderEnum.google) {
            throw new AppError("Email already registered with a different provider", 409);
        }
        if (!user) {
            user = await this._userRepo.create(
                {
                    userName: name,
                    email: email,
                    confirmed: email_verified,
                    profilePic: picture,
                    provider: ProviderEnum.google
                } as Partial<IUser>)
        }

        const accessToken = this._tokenService.generateToken({
            payload: {
                id: user!._id, email: user!.email
            },
            secretKey: SECRET_KEY_USER,
            options: { expiresIn: '1h' }
        })
        const refreshToken = this._tokenService.generateToken({
            payload: {
                id: user!._id, email: user!.email
            },
            secretKey: REFRESH_SECRET_KEY_USER,
            options: { expiresIn: '1y' }
        })

        successResponse({ res, data: { user, accessToken, refreshToken } })
    }


    signIn = async (req: Request, res: Response, next: NextFunction) => {
        let { email, password, fcm }: LoginDto = req.body;

        let user = await this._userRepo.findOne({
            filter: {
                email,
                provider: ProviderEnum.system,
                confirmed: true
            }
        })
        if (!user) {
            throw new AppError("User is not exist", 404)
        }

        if (!(await compare({ text: password, cipherTxt: user.password }))) {
            throw new AppError("invalid password", 400)
        }

        const uuid = randomUUID()
        const accessToken = this._tokenService.generateToken({
            payload: {
                email
            },
            secretKey: user.role == RoleEnum.user ? SECRET_KEY_USER : SECRET_KEY_ADMIN,
            options: { expiresIn: 60 * 60, jwtid: uuid }
        })

        const refreshToken = this._tokenService.generateToken({
            payload: {
                email
            },
            secretKey: user.role == RoleEnum.user ? REFRESH_SECRET_KEY_USER : REFRESH_SECRET_KEY_ADMIN,
            options: { expiresIn: '1y', jwtid: uuid }
        })

        if (fcm) {
            await this._redisService.addFCM({ userId: user._id, FCMToken: fcm })
            const tokens = await this._redisService.getFCMs(user._id)
            await this._notificationService.sendNotifications({
                tokens, data: {
                    title: `hi ${user.firstName}`,
                    body: `New login at ${new Date()}`
                }
            })
        }


        successResponse({
            res, message: "logged In successfully", data: {
                accessToken,
                refreshToken
            }
        })
    }


    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
        let { newPassword, oldPassword, cPassword }: UpdatePassDto = req.body

        if (!compare({ text: oldPassword, cipherTxt: req.user.password })) {
            throw new AppError("invalid old password")
        }

        if (newPassword != cPassword) {
            throw new AppError("Wrong password")
        }
        const hashed = hash({ text: newPassword })
        newPassword = hashed
        req.user.changeCredential = new Date()
        await req.user.save()

        successResponse({ res })
    }


    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email }: EmailDto = req.body;

        let user = await this._userRepo.findOne({
            filter: {
                email,
                provider: ProviderEnum.system,
                confirmed: true
            }
        })
        if (!user) {
            throw new AppError(" user not exist or invalid provider", 400)
        }

        await this.sendEmail({ email, subject: EventEnum.forgetPassword })
        successResponse({ res, data: user });
    }
}

export default new AuthService()