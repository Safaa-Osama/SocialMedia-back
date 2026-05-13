import type { Response } from 'express';

export const successResponse = ({
    res,
    status = 200,
    message = "done",
    data = undefined
}: {
    res: Response,
    status?: number,
    message?: string,
    data?: unknown
}) => {
    return res.status(status).json({ message, data })
}