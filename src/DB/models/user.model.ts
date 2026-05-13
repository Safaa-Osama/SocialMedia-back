
import { EventEnum } from '../../Common/enum/eventEnum';
import { hash } from '../../Common/security/hash';
import redisService from '../../Common/services/redis.service';
import { eventEmitter } from '../../Common/utilis/emailServices/email.event';
import { emailTemplete } from '../../Common/utilis/emailServices/email.templete';
import { generateOtp, sendMail } from '../../Common/utilis/emailServices/sendMail';
import { GenderEnum, ProviderEnum, RoleEnum } from './../../Common/enum/userEnum';

import mongoose, { HydratedDocument, Types } from 'mongoose';

export interface IUser {
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    phone: string,
    password: string,
    gender?: GenderEnum,
    profilePic?: string,
    coverPics?: string[],
    role?: RoleEnum,
    age?: number,
    provider?: ProviderEnum,
    confirmed?: boolean,
    changeCredential?: Date,
    friends?: Types.ObjectId[],
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 10,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 15,
        required: true
    },
    password: {
        type: String, trim: true,
        required: function () {
            return this.provider == ProviderEnum.system ? true : false
        },
    },
    phone: {
        type: String, trim: true,
        required: function () {
            return this.provider == ProviderEnum.system ? true : false
        },
    },
    email: { type: String, trim: true, unique: true, required: true },
    age: { type: Number, min: 20 },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    provider: { type: String, enum: ProviderEnum, default: ProviderEnum.system },
    confirmed: { type: Boolean, default: false },
    friends: [{ type: Types.ObjectId, ref: "user" }],
    profilePic: String,
    coverPics: { type: [String], default: [] },
    changeCredential: Date,
    deletedAt: Date
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//send OTP only one time
userSchema.pre("save", async function (this: HydratedDocument<IUser> & { is_new: Boolean }) {

    this.is_new = this.isNew

    if (this.isModified("password")) {
        this.password = hash({ text: this.password })
    }
})

userSchema.post("save", async function () {
    const that = this as HydratedDocument<IUser> & { is_new: boolean }
    if (that.is_new) {
        const otp = generateOtp()
        eventEmitter.emit(EventEnum.confirmEmail, async () => {
            await sendMail({
                to: this.email,
                subject: "Email Confirmation",
                html: emailTemplete(otp)
            })
            await redisService.setValue({
                key: redisService.otpKey({ email: this.email, subject: EventEnum.confirmEmail }),
                value: hash({ text: `${otp}` }),
                ttl: 60 * 10
            })
            await redisService.setValue({
                key: redisService.maxOtp(this.email), value: "1", ttl: 60 * 30
            })
        })
    }
})


// soft delete
userSchema.pre("find", function () {

    const { paranoid, ...rest } = this.getQuery()

    if (paranoid == "false") {
        this.setQuery({ ...rest })
    } else {
        this.setQuery({ ...rest, deletedAt: { $exists: false } })
    }
})


userSchema.virtual("userName").get(function () {
    return this.firstName + " " + this.lastName
}).set(function (value) {
    const [firstName, lastName] = value.split(" ")
    this.set({ firstName, lastName })
})

export const userModel = mongoose.models.user || mongoose.model<IUser>("user", userSchema)