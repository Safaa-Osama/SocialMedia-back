import mongoose, { Schema, Types } from "mongoose";

export interface IMessage {
    content: string;
   createdBy: Types.ObjectId;
}

export interface IChat {
    createdBy: Types.ObjectId;
    participants: Types.ObjectId[];
    messages: IMessage[];

    groupName?:string;
    groupPhoto?:string;  
    roomId?:string;

}


const messageSchema = new Schema<IMessage>({
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
})  

const chatSchema = new Schema<IChat>({
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    participants: { type: [Schema.Types.ObjectId], required: true, ref: "user" },
    messages:{type:[messageSchema],default:[]},

    groupName:String,
    groupPhoto:String,  
    roomId:String,

}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



export const chatModel =
    mongoose.models.chat || mongoose.model<IChat>("chat", chatSchema);