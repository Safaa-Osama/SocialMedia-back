import { authenticateToken } from "../../Common/middleware/authentication";
import redisService from "../../Common/services/redis.service";
import { Server } from 'socket.io';
import { Server as httpServer } from 'http';
import chatGateway from "../chat/chatRealTime/chat.gateway";


class socketGetway {
    constructor() { }

    initIO = async (httpServer: httpServer) => {
        const io = new Server(httpServer, {
            cors: { origin: "*" }
        })

        io.use(async (socket, next) => {
            try {
                const authorization = socket.handshake.auth.authorization as string;
                const { user } = await authenticateToken(authorization);
                socket.data.user = user;
                next();
            } catch (error: any) {
                next(error);
            }
        })

        io.on("connection", async (socket: any) => {
            await redisService.addSocket({ userId: socket.data.user._id, sockitId: socket.id })

            await chatGateway.registerEvent(socket,io)



            socket.on("disconnect", async () => {
                await redisService.removeSocket({ userId: socket.data.user._id, sockitId: socket.id })
            })
        })
    }
}


export default new socketGetway()