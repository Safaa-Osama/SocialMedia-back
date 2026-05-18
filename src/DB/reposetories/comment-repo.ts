import { Model } from 'mongoose';
import BaseRepo from './base-repo';
import { commentModel, IComment } from '../models/comment.model';


class CommentRepo extends BaseRepo<IComment> {
    constructor(protected readonly model: Model<IComment> = commentModel) {
        super(model)
    }

    }


export default new CommentRepo()
