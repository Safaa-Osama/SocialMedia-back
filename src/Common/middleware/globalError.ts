import { NextFunction, Request, Response } from "express";


export const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    let status = err.statusCode as number || 500

    res.status(status).json({
        message: err.message,
        status,
        stack: err.stack
    })
}

export class AppError extends Error {
    constructor(
        public message: any,
        public statusCode?: number) 
        {
        super(message)
        this.message == message
        this.statusCode == statusCode
        }
}