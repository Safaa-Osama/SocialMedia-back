// import mongoose, { Schema, Types } from "mongoose";

// export interface IChat {
//     content?: string;
//     attachments?: string[];
//     createdBy: Types.ObjectId;


//     tags?: Types.ObjectId[];
//     likes?: Types.ObjectId[];
//     folderId: string;
// }

// const chatSchema = new Schema<IChat>({
//     folderId: String,
//     content: {
//         type: String,
//         minLength: 3,
//         required: function (this) {
//             return !this.attachments?.length;
//         }
//     },
//     attachments: [String],

//     createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
// ,

//     tags: [{ type: Schema.Types.ObjectId, ref: "user" }],
//     likes: [{ type: Schema.Types.ObjectId, ref: "user" }]
// }, {
//     timestamps: true,
//     strictQuery: true,
//     strict: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });



// export const chatModel =
//     mongoose.models.chat || mongoose.model<IChat>("chat", chatSchema);