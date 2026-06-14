import { Socket,Server } from "socket.io";
import chatEvents from "./chat.events";

class ChatGateway {
    constructor() { }

    registerEvent = async (socket: Socket, io: Server) => {
        chatEvents.saiHiFromChat(socket)
        chatEvents.sendMessage(socket, io)

    }




}

export default new ChatGateway()  