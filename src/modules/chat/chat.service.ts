import { NextFunction, Request, Response, } from "express";
import userRepo from "../../DB/reposetories/user-repo";
import { AppError } from "../../Common/middleware/globalError";
import chatRepo from "../../DB/reposetories/chat-repo";
import { successResponse } from "../../Common/utilis/response";
import { Socket, Server } from "socket.io";
import redisService from "../../Common/services/redis.service";
import { Types } from "mongoose";
import s3Service from "../../Common/services/s3.service";
import { StoreEnum } from "../../Common/enum/multerEnum";
import { uuid } from "zod";


class ChatService {
    constructor() { }
    private readonly _userRepo = userRepo
    private readonly _chatRepo = chatRepo
    private readonly _s3Service = s3Service



    // REST APIS
    createChat = async (req: Request, res: Response, next: NextFunction) => {
        const { participant, createdBy } = data;
        const chat = await this._chatRepo.create({ participants: [participant], createdBy });
        return chat;
    }

    createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
        let { participants, groupName, groupPhoto } = req.body;
        const createdBy = req.user._id

        const roomId = groupName.replaceAll("/\s/g", "_") + "_" + uuid()

        if (req?.file) {
            groupPhoto = await this._s3Service.uploadFile({ file: req.file, path: `chat/${roomId}`, store_type: StoreEnum.memory })
        }

        const dbParticipants = participants.map((participant: string) => {
            return Types.ObjectId.createFromHexString(participant)
        })
        const users = await this._userRepo.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: [createdBy] }
            }
        })

        if (users.length !== dbParticipants.length) {
            throw new AppError("Some users are not friends with you", 400)
        }

        const chat = await this._chatRepo.create({
            participants,
            createdBy,
            groupName,
            groupPhoto,
            roomId,
            messages: []
        });

        if (!chat) {
            if (groupPhoto) {
                await this._s3Service.deleteFile(groupPhoto)
            }
            throw new AppError("Fail to create chat", 400)
        }

        successResponse({ res, data: chat })
    }

    getChat = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params

        const chat = await this._chatRepo.findOne({
            filter: {
                participants: {
                    $all: [req.user._id, userId]
                },
                groupName: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "participants"
                    }
                ],
                projection: {
                    messages: { $slice: -10 }
                }
            }
        })

        if (!chat) {
            throw new AppError("Chat not found", 400)
        }

        successResponse({ res, data: chat })
    }




    // SOCKET.IO APIs
    saiHiFromChat = async (data: any) => {
        console.log(data)
    }

    sendMessage = async (data: any, socket: Socket, io: Server) => {
        const { sendTo, content } = data
        const createdBy = socket.data.user._id

        const user = this._userRepo.findOne({ filter: { _id: sendTo } })
        if (!user) {
            throw new AppError("User not found", 400)
        }

        const chat = await this._chatRepo.findOneAndUpdate({
            filter: {
                participants: {
                    $all: [createdBy, sendTo]
                },
                groupName: { $exists: false },
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            },
            options: {
                new: true,
                populate: [{ path: "participants" }]
            }
        })

        if (!chat) {
            await this._chatRepo.create({
                createdBy,
                participants: [createdBy, sendTo],
                messages: [
                    {
                        content,
                        createdBy
                    }
                ]
            })
        }

        const sockets = await redisService.getSockets({ createdBy })
        if (sockets) {
            io.to(sockets).emit("successMessage", {
                content
            })
        }
        const socketsReceiver = await redisService.getSockets({ sendTo })
        if (socketsReceiver) {
            io.to(socketsReceiver).emit("newMessage", {
                content,
                from: socket.data.user
            })
        }

    }

}

export default new ChatService()