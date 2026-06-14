import { Model } from 'mongoose';
import BaseRepo from './base-repo';
import { chatModel, IChat } from '../models/chat.model';


class ChatRepo extends BaseRepo<IChat> {
    constructor(protected readonly model: Model<IChat> = chatModel) {
        super(model)
    }
    } 

export default new ChatRepo()
