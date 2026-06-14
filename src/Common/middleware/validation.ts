import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "./globalError";

type ReqType = keyof Request; // body, params, query, headers, etc.
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const errorsResult: { key: ReqType; path: PropertyKey[]; message: string }[] = [];

        for (const key of Object.keys(schema) as ReqType[]) {
            if (!schema[key]) continue;

            if (req.file) {
                req.body.attachments = req.file
            }

            if (req.files) {
                req.body.attachments = req.files
            }

            const result = schema[key].safeParse(req[key]);

            if (!result.success) {
                result.error.issues.forEach((err) => {
                    errorsResult.push({
                        key,
                        path: err.path,
                        message: err.message,
                    });
                });
            }

        }

        if (errorsResult.length > 0) {
            throw new AppError(errorsResult, 400);
        }

        next();
    };
};

export const realTimeValidation = (schema: SchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const errorsResult: { key: ReqType; path: PropertyKey[]; message: string }[] = [];

        for (const key of Object.keys(schema) as ReqType[]) {
            if (!schema[key]) continue;

            if (req.file) {
                req.body.attachments = req.file
            }

            if (req.files) {
                req.body.attachments = req.files
            }

            const result = schema[key].safeParse(req[key]);

            if (!result.success) {
                result.error.issues.forEach((err) => {
                    errorsResult.push({
                        key,
                        path: err.path,
                        message: err.message,
                    });
                });
            }

        }

        if (errorsResult.length > 0) {
            throw new AppError(errorsResult, 400);
        }

        next();
    };
};