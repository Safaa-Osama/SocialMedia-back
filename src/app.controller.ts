import express from "express";
import type { NextFunction, Request, Response } from "express"
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PORT } from "./config/config.service";
import { AppError, globalErrorHandler } from "./Common/middleware/globalError";
import authRouter from "./modules/auth/auth.controller";
import userRouter from "./modules/users/user.controller";
import postRouter from "./modules/posts/post.controller";
import commentRouter from "./modules/comments/comment.controller";
import { dbConnection } from "./DB/mongoDB/db.connect";
import { successResponse } from "./Common/utilis/response";
import redisService from "./Common/services/redis.service";
import notificationService from "./Common/services/notification.service";
import { createHandler } from 'graphql-http/lib/use/express';
import { Server } from 'socket.io';
import gqlschema from './modules/gql/schema.gql';
import chatRouter from "./modules/chat/chat.controller";
import { authenticateToken } from "./Common/middleware/authentication";


const app: express.Application = express()
const port: number = Number(PORT)

export const bootstrap = async () => {

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        handler: (req: Request, res: Response, next: NextFunction, options) => {
            throw new AppError("Too many request, retry after 15 minutes", 429)
        },
        legacyHeaders: false
    })

    app.use(express.json())
    app.use(cors(), limiter, helmet())

    dbConnection()
    await redisService.connect()


    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        successResponse({ res, message: "Welcome to my Social Media app ...." })
    })


    app.post("/send-notification", async (req: Request, res: Response, next: NextFunction) => {

        console.log({ token: req.body.token })
        await notificationService.sendNotification({
            token: req.body.token,
            data: {
                title: "hi",
                body: "new notification"
            }
        })
        successResponse({ res, message: "Notifications from firebase ...." })
    })


    app.use("/graphql", createHandler({ schema: gqlschema, context: (req) => ({ req }) }))

    app.use("/auth", authRouter);
    app.use("/users", userRouter);
    app.use("/posts", postRouter);
    app.use("/comments", commentRouter);
    app.use("/chat", chatRouter);



    app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
        throw new AppError(`URL ${req.originalUrl} WITH METHOD ${req.method} IS NOT FOUND`, 404)
    })

    app.use(globalErrorHandler)

    const httpServer = app.listen(port, () => {
        console.log(`your app is running at ${PORT}`)
    })


    const io = new Server(httpServer, {
        cors: { origin: "*" }
    })

    io.on("connection", (socket: any) => {
        io.use(async (socket, next) => {
            try {
                const authorization = socket.handshake.auth.authorization as string;
                const { user } = await authenticateToken(authorization);
                socket.data.user = user;
                next();
            } catch (error: any) {
                next(error);
            }

            socket.on("saiHello", (data, cb) => {
                socket.emit("saiHelloBE", "Hello from BackEnd")
            })


        })


    })      
}