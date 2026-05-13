import mongoose, { Schema, Types } from "mongoose";
import { allowCommentEnum, avaliabilityEnum } from "../../Common/enum/postEnum";

export interface IPost {
    content?: string;
    attachments?: string[];
    createdBy: Types.ObjectId;

    availability: string;
    allowComment: string;

    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        minLength: 3,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: [String],

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },

    availability: { type: String, enum: avaliabilityEnum, default: avaliabilityEnum.public },
    allowComment: { type: String, enum: allowCommentEnum, default: allowCommentEnum.allowed },

    tags: [{ type: Schema.Types.ObjectId, ref: "user" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }]
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export const postModel =
    mongoose.models.post || mongoose.model<IPost>("post", postSchema);