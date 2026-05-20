import { MulterEnum, StoreEnum } from './../enum/multerEnum';
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { tmpdir } from 'os';
import { AppError } from './globalError';


export const multer_cloud = ({
    storeType = StoreEnum.memory,
    customType = MulterEnum.image,
    maxFileSize = 5 * 1024 * 1024
}: {
    storeType?: StoreEnum,
    customType?: string[]
    maxFileSize?: number
} = {}) => {

    const storage = storeType == StoreEnum.memory ? multer.memoryStorage() : multer.diskStorage({
        destination: tmpdir(),
        filename: function (req: Request, file: Express.Multer.File, cb: Function) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + "_" + file.originalname)
        }
    })

    function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
        if (!customType.includes(file.mimetype)) {
            cb(new AppError("Invalid Image Type"))
        }
        cb(null, true)
    }

    const upload = multer({ storage, fileFilter, limits: { fileSize: maxFileSize } })
    return upload;
}