import { OnModelEnum } from './../../Common/enum/commentEnum';
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../Common/utilis/response";
import PostRepo from "../../DB/reposetories/post-repo";
import RedisService from '../../Common/services/redis.service';
import s3Service from "../../Common/services/s3.service";
import notificationService from "../../Common/services/notification.service";
import { AppError } from "../../Common/middleware/globalError";
import userRepo from "../../DB/reposetories/user-repo";
import { randomUUID } from "node:crypto";
import { StoreEnum } from "../../Common/enum/multerEnum";
import { postAvailability } from "../../Common/utilis/availability";
import { CreateCommentDto } from "./comment.dto";
import { Types } from "mongoose";
import commentRepo from "../../DB/reposetories/comment-repo";
import { IComment } from "../../DB/models/comment.model";
import { AllowCommentEnum } from '../../Common/enum/postEnum';
import { IPost } from '../../DB/models/post.model';
import { HydratedDocument } from 'mongoose';



class CommentService {
    private readonly _s3service = s3Service
    private readonly _postRepo = PostRepo
    private readonly _commentRepo = commentRepo
    private readonly _userRepo = userRepo
    private readonly _redisService = RedisService
    private readonly _notificationService = notificationService


    createCommentReply = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, onModel, tags = [] }: CreateCommentDto = req.body
        const { postId, commentId } = req.params
        let doc: (HydratedDocument<IPost> | HydratedDocument<IComment>) | null = null

        if (onModel == OnModelEnum.post && !commentId) {

            doc = await this._postRepo.findOne({
                filter: {
                    _id: postId,
                    ...(postAvailability(req)),
                    allowComment: AllowCommentEnum.allowed
                }
            })
            if (!doc) {
                throw new AppError("post not exist or not authorized")
            }
        }
        else if (onModel == OnModelEnum.comment && commentId) {
            if (!postId || !commentId) {
                throw new AppError("postId and commentId are required")
            }
            let comment = await this._commentRepo.findOne({
                filter: {
                    _id: commentId,
                    refId: postId
                },
                options: {
                    populate: [{
                        path: "refId", match: { ...postAvailability, allowComment: AllowCommentEnum.allowed }
                    }]
                }
            })
            if (!comment?.refId) {
                throw new AppError("comment not exist or not authorized")
            }
            doc = comment
        }

        let mentions: Types.ObjectId[] = []
        if (tags?.length) {
            const taggedUser = await this._userRepo.find({
                filter: { _id: { $in: tags } }
            })

            if (taggedUser.length != tags.length) {
                throw new AppError("failed to find some mentioned users")
            }
        }

        for (const tag of tags) {
            const tokens = await this._redisService.getFCMs(Types.ObjectId.createFromHexString(tag))
            if (tokens) {
                await this._notificationService.sendNotifications({
                    tokens,
                    data: { title: "post tagged", body: `you have new notification` }
                })
            }
            mentions.push(new Types.ObjectId(tag))
        }

        let urls: string[] = []
        let folderId = randomUUID()
        if (req.files) {
            urls = await this._s3service.uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req?.user?._id}/posts/${doc?.folderId}/comments/${folderId}`,
                store_type: StoreEnum.memory
            })
        }

        const comment = await this._commentRepo.create({
            folderId,
            refId: doc?._id!,
            content: content || "",
            tags: mentions,
            attachments: urls,
            createdBy: req?.user?._id,
            onModel
        })

        if (!comment) {
            await this._s3service.deleteManyFiles(urls)
            throw new AppError("fail to create comment")
        }
        successResponse({ res, data: doc })
    }

    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        const posts = await this._postRepo.find({
            filter: { ...(postAvailability(req)) }
        })

        let doc = []
        for (const post of posts) {
            const comments = await this._commentRepo.find({
                filter: { refId: post._id }
            })
            doc.push({ ...post.toObject(), comments })
        }

        successResponse({ res, data: doc })
    }

    //another way --- virtualKey
    getPostComment = async (req: Request, res: Response, next: NextFunction) => {

        const posts = await this._postRepo.find({
            filter: { ...(postAvailability(req)) },
            options: { populate: [{ path: "comments" }] }
        })

        successResponse({ res, data: posts });
    };


    getPostCommentReply = async (req: Request, res: Response, next: NextFunction) => {

        const posts = await this._postRepo.find({
            filter: { ...postAvailability(req) },
            options: {
                populate: [{
                    path: "comments", match: { commentId: { $exists: false } },
                    populate: [{
                        path: "replies"
                    }]
                }]
            }
        })

        successResponse({ res, data: posts });
    };

}

export default new CommentService()