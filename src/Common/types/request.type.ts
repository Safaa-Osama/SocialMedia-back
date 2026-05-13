// import { Request } from 'express';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../../DB/models/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPost } from '../../DB/models/post.model';

declare module "express-serve-static-core" {
    interface Request {
        user: HydratedDocument<IUser>
        post: HydratedDocument<IPost>,
        decoded: JwtPayload
    }
}