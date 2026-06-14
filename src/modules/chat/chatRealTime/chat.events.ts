import { Socket,Server } from "socket.io"
import chatService from "../chat.service"


class ChatEvents {
    constructor() { }

    saiHiFromChat = async (socket: Socket) => {
        socket.on("saiHiFromChat", (data: any) => {
            chatService.saiHiFromChat(data)
        })
    }

    sendMessage = async (socket: Socket,io: Server) => {
        socket.on("sendMessage", (data: any) => {
            chatService.sendMessage(data,socket,io)
        })
    }
}

export default new ChatEvents()