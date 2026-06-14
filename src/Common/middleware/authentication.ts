import { NextFunction, Request, Response } from "express";
import { AppError } from "./globalError";
import tokenService from "../services/token.service";
import UserRepo from '../../DB/reposetories/user-repo';

import { PREFIX_ADMIN, PREFIX_USER, SECRET_KEY_ADMIN, SECRET_KEY_USER } from "../../config/config.service";
import redisService from "../services/redis.service";

const _userRepo = UserRepo

export const authenticateToken = async (authorization: string) => {
    if (!authorization) {
        throw new AppError("invalid authorization");
    }

    const [prefix, token] = authorization.split(" ");

    if (!token) {
        throw new AppError("Token not found");
    }

    let SECRET_KEY = "";

    if (prefix === PREFIX_USER) {
        SECRET_KEY = SECRET_KEY_USER;
    } else if (prefix === PREFIX_ADMIN) {
        SECRET_KEY = SECRET_KEY_ADMIN;
    } else {
        throw new AppError("Invalid prefix");
    }

    const decoded = tokenService.verifyToken({
        token,
        secretKey: SECRET_KEY,
    });

    if (!decoded?.jti || !decoded?.email) {
        throw new AppError("invalid authorization !");
    }

    const user = await _userRepo.findOne({
        filter: { email: decoded.email },
    });

    if (!user) {
        throw new AppError("user not found", 400);
    }

    if (!user.confirmed) {
        throw new AppError("user not confirmed yet", 400);
    }

    return { user, decoded };
};

export const authentication = async (req: Request, res: Response, next: NextFunction) => {

    const authorization = req.headers.authorization as string;

    const { user, decoded } = await authenticateToken(authorization);

    const revoked = await redisService.getValue(
        redisService.revokedKey({
            userId: user._id,
            jti: decoded.jti!,
        })
    );

    if (revoked) {
        throw new AppError("Invalid token revoked", 400);
    }

    req.user = user;
    req.decoded = decoded;

    next()
};

export const gql_authentication = async (authorization: string) => {
    const { user, decoded } = await authenticateToken(authorization);

    return { user, decoded };
};