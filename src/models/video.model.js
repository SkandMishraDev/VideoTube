import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new Schema({
    videoFile:{
        type:String,
        required:true
    },thumbail:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublised:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video =mongoose.model("Video",videoSchema)