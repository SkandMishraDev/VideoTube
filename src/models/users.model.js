import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const userSchema =new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    refreshToken:{
        type:String,
    }

},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    console.log(this.password)
    this.password =await bcrypt.hash(this.password,10)
    next();
})


userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        userName:this.userName    
    },process.env.Access_Token_Secret,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },process.env.Refresh_Token_Secret,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User=mongoose.model("User",userSchema)