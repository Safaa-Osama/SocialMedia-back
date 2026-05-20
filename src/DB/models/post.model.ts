import mongoose, { Schema, Types } from "mongoose";
import { AllowCommentEnum, AvailabilityEnum } from "../../Common/enum/postEnum";

export interface IPost {
    content?: string;
    attachments?: string[];
    createdBy: Types.ObjectId;

    availability: string;
    allowComment: string;

    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
    folderId: string;
}

const postSchema = new Schema<IPost>({
    folderId: String,
    content: {
        type: String,
        minLength: 3,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: [String],

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },

    availability: { type: String, enum: AvailabilityEnum, default: AvailabilityEnum.public },
    allowComment: { type: String, enum: AllowCommentEnum, default: AllowCommentEnum.allowed },

    tags: [{ type: Schema.Types.ObjectId, ref: "user" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }]
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



postSchema.virtual("comments", {
    ref: "comment",
    foreignField: "postId",
    localField: "_id"
})

export const postModel =
    mongoose.models.post || mongoose.model<IPost>("post", postSchema);