import { OnModelEnum } from './../../Common/enum/commentEnum';
import mongoose, { Schema, Types } from "mongoose";

export interface IComment {
    content?: string;
    attachments?: string[];

    createdBy: Types.ObjectId;
    refId: Types.ObjectId;
    OnModel: string;
    tags?: Types.ObjectId[];
    folderId:string;
}

const commentSchema = new Schema<IComment>({
    folderId:String,
    content: {
        type: String,
        minLength: 3,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: [String],
    tags: [{ type: Schema.Types.ObjectId, ref: "user" }],

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    refId: { type: Schema.Types.ObjectId, required: true, refPath: "onModel" },

    OnModel: { type: String, enum: OnModelEnum,default:OnModelEnum.post, required: true }
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

commentSchema.virtual("replies", {
    ref: "comment",
    foreignField: "refId",
    localField: "_id"
})

export const commentModel =
    mongoose.models.post || mongoose.model<IComment>("comment", commentSchema);