import { postAvailability } from './../../Common/utilis/availability';
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../Common/utilis/response";
import PostRepo from "../../DB/reposetories/post-repo";
import { CreatePostDto, UpdatePostDto } from "./post.dto";
import RedisService from '../../Common/services/redis.service';
import s3Service from "../../Common/services/s3.service";
import notificationService from "../../Common/services/notification.service";
import { AppError } from "../../Common/middleware/globalError";
import userRepo from "../../DB/reposetories/user-repo";
import { randomUUID } from "node:crypto";
import { HydratedDocument, Types } from "mongoose";
import { StoreEnum } from "../../Common/enum/multerEnum";
import { IPost } from "../../DB/models/post.model";
import CommentRepo from '../../DB/reposetories/comment-repo';
import { IComment } from '../../DB/models/comment.model';


class PostService {
    private readonly _s3service = s3Service
    private readonly _postRepo = PostRepo
    private readonly _commentRepo = CommentRepo
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
            if (req.user._id.toString() == tag.toString()) {
                throw new AppError("You can't mention your self")
            }
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
                path: `users/${req?.user?._id}/posts/${folderId}`,
                store_type: StoreEnum.memory
            })
        }

        const post = await this._postRepo.create({
            folderId,
            content,
            tags: mentions,
            attachments: urls,
            allowComment,
            availability,
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

        let searchQuery = {}

        if (search) {
            searchQuery = {
                $or: [{ content: { $regex: search, $options: "i" } }]
            }
        }

        const posts = await this._postRepo.paginate({
            page: Number(req.query.page),
            limit: Number(req.query.limit),

            search: {
                ...postAvailability(req),
                ...searchQuery
            }
        });

        successResponse({ res, data: posts });
    };


    likeDislikePosts = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params
        const { flag } = req.query

        let updateQuery: any = {
            $addToSet: { likes: req.user?._id }
        }

        if (flag === "disLike") {
            updateQuery = {
                $pull: { likes: req.user?._id }
            }
        }

        const post = await this._postRepo.findOneAndUpdate({
            filter: {
                _id: postId,
                ...postAvailability(req)
            },
            update: updateQuery
        })

        if (!post) {
            throw new AppError("Post not found or not Authorized")
        }

        successResponse({ res, data: post })
    }

    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, availability, removeFiles, removeTags, tags, allowComment }: UpdatePostDto = req.params
        const { postId } = req.params

        const post = await this._postRepo.findOne({
            filter: {
                id: postId,
                createdBy: req.user._id
            }
        })

        if (!post) {
            throw new AppError("Post not found or not authorized")
        }


        if (removeFiles?.length) {
            const inValidFiles = removeFiles.filter((file: string) => {
                return !post.attachments?.includes(file)
            })
            if (inValidFiles.length) {
                throw new AppError("some of files not exist")
            }
            this._s3service.deleteManyFiles(removeFiles)

            post.attachments = post.attachments?.filter((file: string) => {
                return !removeFiles.includes(file)
            }) as string[]
        }

        const updatedTags = new Set(post.tags?.map(id => id.toString()))
        removeTags?.forEach((tag: string) => {
            return updatedTags.delete(tag)
        })

        let fcmTokens: string[] = []
        if (tags?.length) {
            const menrionsTags = await this._userRepo.find({
                filter: { _id: { $in: tags } }
            })
            if (tags.length != menrionsTags.length) {
                throw new AppError("Some person you mention is not found")
            }
            for (const tag of menrionsTags) {
                if (tag._id.toString() == req.user._id.toString()) {
                    throw new AppError("You can't mention your self")
                }
                updatedTags.add(tag._id.toString());
                (await this._redisService.getFCMs(tag._id)).map((token) => {
                    fcmTokens.push(token)
                })
            }
            post.tags = [...updatedTags].map(id => new Types.ObjectId(id))
        }

        if (req.files?.length) {
            if (!post.folderId) {
                throw new AppError("Folder id not found")
            }
            let urls = await this._s3service.uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req?.user?._id}/posts/${post.folderId!}`,
                store_type: StoreEnum.memory
            })

            post.attachments?.push(...urls)
        }

        if (fcmTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: fcmTokens,
                data: {
                    title: "new notification",
                    body: "you have new mention"
                }
            })
        }
        if (!content && !post.content &&
            !attachments && !post.attachments?.length &&
            req.files?.length == removeFiles?.length
        ) {
            throw new AppError("post will be empty, can't excute your update")
        }
        await post.save()
        successResponse({ res, data: post })
    }

    deletePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params

        const post = await this._postRepo.findOne({
            filter: {
                createdBy: req.user._id,
                _id: postId
            }
        })
        if (!post) {
            throw new AppError("post not found")
        }

        if (post.attachments?.length) {
            await this._s3service.deleteManyFiles(post.attachments)
        }

        const comments: HydratedDocument<IComment>[] = await this._commentRepo.find({
            filter: { postId: post._id }
        })

        if (comments?.length) {
            const commentIds = comments.map(comment => comment._id)
            const replies: HydratedDocument<IComment>[] = await this._commentRepo.find({
                filter: { commentId: { $in: commentIds } }
            })

            if (replies?.length) {
                await this._commentRepo.deleteMany({
                    filter: { commentId: { $in: commentIds } }
                })
            }

            await this._commentRepo.deleteMany({
                filter: { postId: post._id }
            })
        }

        await this._postRepo.findOneAndDelete({
            filter: { createdBy: req.user._id, _id: postId }
        })

        successResponse({ res, message: "post deleted" })
    }

}


export default new PostService()   