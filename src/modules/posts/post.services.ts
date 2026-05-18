import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../Common/utilis/response";
import PostRepo from "../../DB/reposetories/post-repo";
import { CreatePostDto, LikePostDto, UpdatePostDto } from "./post.dto";
import RedisService from '../../Common/services/redis.service';
import s3Service from "../../Common/services/s3.service";
import notificationService from "../../Common/services/notification.service";
import { AppError } from "../../Common/middleware/globalError";
import userRepo from "../../DB/reposetories/user-repo";
import { randomUUID } from "node:crypto";
import { HydratedDocument, QueryFilter, Types } from "mongoose";
import { StoreEnum } from "../../Common/enum/multerEnum";
import { IPost } from "../../DB/models/post.model";
import { allowCommentEnum, availabilityEnum } from "../../Common/enum/postEnum";
import { postAvailability } from "../../Common/utilis/availability";



class PostService {
    private readonly _s3service = s3Service
    private readonly _postRepo = PostRepo
    private readonly _userRepo = userRepo
    private readonly _redisService = RedisService
    private readonly _notificationService = notificationService


    createPost = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, allowComment, availability, tags }: CreatePostDto = req.body

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
                path: `users/${req?.user?._id}/${folderId}`,
                store_type: StoreEnum.memory
            })
        }

        const post = await this._postRepo.create({
            content,
            tags: mentions,
            attachments: urls,
            allowComment: allowCommentEnum.allowed,
            availability: availabilityEnum.public,
            createdBy: req?.user?._id
        } as Partial<IPost>)

        if (!post) {
            await this._s3service.deleteManyFiles(urls)
            throw new AppError("fail to create post")
        }
        successResponse({ res, message: "Post created", data: post })
    }


    getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
        const search = req.query.search as string;

        search ? {
            $or: [
                { content: { $regex: search, $options: "i" } }
            ]
        }
            : {};

        const posts = await this._postRepo.paginate({
            search: {
                ...(await postAvailability(req)),
                ... { $or: [{ content: { $regex: search, $options: "i" } }] },
            },
            page: Number(req.query.page),
            limit: Number(req.query.limit)
        });

        successResponse({ res, data: posts });
    };



    likeDislikePosts = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params

        const posts = await this._postRepo.findOneAndUpdate({
            filter: { id: postId },
            update: {
                $addToSet: { likes: req.user?._id }
            }
        })


        successResponse({ res })
    }

    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, availability, removeFiles, removeTags }: UpdatePostDto = req.params
        const { postId } = req.params

        const posts = await this._postRepo.findOneAndUpdate({
            filter: { id: postId },
            update: {}
        }
        )


        successResponse({ res })
    }

}


export default new PostService()   