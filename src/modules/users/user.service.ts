import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../Common/utilis/response";
import S3service from "../../Common/services/s3.service";
import { pipeline } from "stream/promises";
import UserRepo from "../../DB/reposetories/user-repo";
import { AppError } from "../../Common/middleware/globalError";
import RedisService from '../../Common/services/redis.service';
import { Types } from "mongoose";



class UserService {
    private readonly _S3service = S3service
    private readonly _userRepo = UserRepo
    private readonly _redisService = RedisService


    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        const user = await this._userRepo.findOne({
            filter: { _id: req.user._id },
            options: {
                populate: [{
                    path: "friends",
                    populate: [{
                        path: "friend"
                    }]
                }]
            }
        })
        successResponse({ res, data: { user } })
    }

    uploadImage = async (req: Request, res: Response, next: NextFunction) => {

        successResponse({ res, data: { user: req.file } })
    }

    uploadSmallFile = async (req: Request, res: Response, next: NextFunction) => {

        const myKey = await this._S3service.uploadFile({
            file: req.file!,
            path: "profilePic",
        })

        await this._userRepo.findByIdAndUpdate({
            id: req.user._id,
            update: { profilePic: myKey }
        })

        //OR
        const user = await this._userRepo.findById(req.user._id);
        if (!user) {
            throw new AppError("User not found");
        }

        user.profilePic = myKey;

        await user.save();
        successResponse({ res, data: myKey })
    }

    uploadLargeFile = async (req: Request, res: Response, next: NextFunction) => {

        const myKey = await this._S3service.uploadLargeFile({
            file: req.file!,
            path: "user/large",

        })
        successResponse({ res, data: myKey })
    }

    uploadFiles = async (req: Request, res: Response, next: NextFunction) => {

        const urls = await this._S3service.uploadFiles({
            files: req.files! as Express.Multer.File[],
            path: "user/coverPics",
        })

        await this._userRepo.findByIdAndUpdate({
            id: req.user._id,
            update: { coverPics: urls }
        })

        successResponse({ res, data: urls })
    }

    getFile = async (req: Request, res: Response, next: NextFunction) => {

        const { path } = req.params as { path: string[] }
        const { download } = req.query

        const Key = path?.join("/")
        const result = await this._S3service.getFile(Key)
        const stream = result.Body as NodeJS.ReadableStream

        res.setHeader("content-Type", result.ContentType!)
        if (download && download == "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${path[path.length - 1]}"`)
        }
        await pipeline(stream, res)

        successResponse({ res })
    }

    getManyFiles = async (req: Request, res: Response, next: NextFunction) => {

        const { folderName } = req.query as { folderName: string }

        const result = await this._S3service.getManyFiles(folderName)
        const keys = result.Contents?.map((file) => { return file.Key })
        successResponse({ res, data: keys })
    }

    createPreSignedUrl = async (req: Request, res: Response, next: NextFunction) => {

        const { fileName, ContentType } = req.body
        const { url, Key } = await this._S3service.createPreSignedUrl({
            fileName, ContentType,
            path: `users/${req.user._id}`
        })

        await this._userRepo.findByIdAndUpdate({
            id: req.user._id,
            update: { profilePic: Key }
        })

        successResponse({ res, data: { url, Key } })
    }


    getPreSignedUrl = async (req: Request, res: Response, next: NextFunction) => {

        const { path } = req.params as { path: string[] }
        const { download } = req.query as { download: string }

        const Key = path?.join("/")
        const url = await this._S3service.getPreSignedUrl({
            Key,
            download: download ? download : undefined
        })

        successResponse({ res, data: url })
    }

    deleteFile = async (req: Request, res: Response, next: NextFunction) => {

        const { Key } = req.query as { Key: string }

        const result = await this._S3service.deleteFile(Key)
        successResponse({ res, data: result })
    }

    deleteManyFiles = async (req: Request, res: Response, next: NextFunction) => {

        const { Keys } = req.body as { Keys: string[] }

        const result = await this._S3service.deleteManyFiles(Keys)
        successResponse({ res, data: result })
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const user = await this._userRepo.findOne({ filter: { _id: req.user._id } })

        if (!user) {
            throw new AppError("User not found")
        }

        if (user?.profilePic) {
            await this._S3service.deleteFile(user.profilePic)
        }

        if (user?.coverPics?.length) {

            await Promise.all(user.coverPics.map((coverPic) => {
                return this._S3service.deleteFile(coverPic)
            }))
        }
        await user.deleteOne()

        successResponse({ res })
    }

    
    //=======GRAPHQL========
    getuserDataResolver = (userId: Types.ObjectId) => {
        return this._userRepo.findOne({
            filter: { _id: userId },
        })
    }

    getAlluserResolver = async (parent: any, args: any) => {
        return await this._userRepo.find({
            filter: {},
            projection: {},
            options: {}
        })
    }

    updateProfileResolver = async (parent: any, args: any) => {
        return this._userRepo.findByIdAndUpdate({
            id: parent._id,
            update: args,
        })
    }

    deleteUserDataResolver = async (parent: any, args: any) => {
        return await this._userRepo.findOneAndDelete({
            filter: { _id: parent._id },
        })
    }


}

export default new UserService()   