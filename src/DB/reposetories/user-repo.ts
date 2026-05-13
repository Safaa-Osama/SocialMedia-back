import { Model } from 'mongoose';
import { IUser, userModel } from './../models/user.model';
import BaseRepo from './base-repo';


class UserRepo extends BaseRepo<IUser> {
    constructor(protected readonly model: Model<IUser> = userModel) {
        super(model)
    }

    async checkUser(email: string): Promise<Boolean> {
        return await this.model.findOne({ filter: { email } }) != null


    }
}

export default new UserRepo()
 