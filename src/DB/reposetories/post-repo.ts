import { Model } from 'mongoose';
import BaseRepo from './base-repo';
import { IPost, postModel } from '../models/post.model';


class PostRepo extends BaseRepo<IPost> {
    constructor(protected readonly model: Model<IPost> = postModel) {
        super(model)
    }

    }


export default new PostRepo()
