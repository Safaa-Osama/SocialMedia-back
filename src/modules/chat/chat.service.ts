import { NextFunction, Request, Response, } from "express";
import { chatModel } from "../../DB/models/chat.model";
import userRepo from "../../DB/reposetories/user-repo";
import { AppError } from "../../Common/middleware/globalError";
import chatRepo from "../../DB/reposetories/chat-repo";
import { successResponse } from "../../Common/utilis/response";
import { Socket, Server } from "socket.io";


class ChatService {
    constructor() { }
    private readonly _userRepo = userRepo
    private readonly _chatRepo = chatRepo



    // REST APIS

    createChat = async (data: any) => {
        const { participant, createdBy } = data;
        const chat = await chatModel.create({ participants: [participant], createdBy });
        return chat;
    }

    getChat = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params
        const chat = await this._chatRepo.findOne({
            filter: {
                participants: {
                    $all: [req.user._id]
                },
                groupName: { $exists: false },
                options: {
                    populate: [{ path: "participants" }]
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
    }



    

}

export default new ChatService()