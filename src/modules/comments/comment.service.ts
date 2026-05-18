import { IPost } from './../../DB/models/post.model';
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
import { HydratedDocument, Types } from "mongoose";
import commentRepo from "../../DB/reposetories/comment-repo";
import { IComment } from "../../DB/models/comment.model";



class CommentService {
    private readonly _s3service = s3Service
    private readonly _postRepo = PostRepo
    private readonly _commentRepo = commentRepo
    private readonly _userRepo = userRepo
    private readonly _redisService = RedisService
    private readonly _notificationService = notificationService


    createComment = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, tags }: CreateCommentDto = req.body
        const { postId,commentId } = req.params

        let doc : HydratedDocument<IComment> | IPost | null = null


        if (tags?.length) {
            const taggedUser = await this._userRepo.find({
                filter: { _id: { $in: tags } }
            })

            if (taggedUser.length != tags.length) {
                throw new AppError("failed to find some mentioned users")
            }
        }

        let mentions: Types.ObjectId[] = []
        for (const tag of tags!) {
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
                path: `users/${req?.user?._id}/comments/${folderId}`,
                store_type: StoreEnum.memory
            })
        }

        const comment = await this._commentRepo.create({
            content,
            tags: mentions,
            attachments: urls,
            createdBy: req?.user?._id,

        } as Partial<IComment>)

        if (!comment) {
            await this._s3service.deleteManyFiles(urls)
            throw new AppError("fail to create comment")
        }
        successResponse({ res, message: "comment created", data: comment })
    }


    getPostComment = async (req: Request, res: Response, next: NextFunction) => {

        const posts = await this._postRepo.find({
            filter: { ...postAvailability(req) },
            options: { populate: [{ path: "comments" }] }
        })

        successResponse({ res, data: posts });
    };
}

export default new CommentService()