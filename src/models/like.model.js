import mongoose from "mongoose";
import { Schema } from "mongoose" ;

const likeSchema=new Schema({
    likdeBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true})

export const Like=mongoose.model("Like",likeSchema)