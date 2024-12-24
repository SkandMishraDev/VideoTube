import { User } from "../models/users.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signInSchema,signUpSchema } from "../validator/user.validator.js";
import jwt from "jsonwebtoken";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const generateAccessAndrefreshToken=async (userId) => {
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}

export const register=asyncHandler(async (req,res) => {
    const {success,data,error}=signUpSchema.safeParse(req.body)

    if(!success) res.status(400).json({
        message: "Fill information correctly",
        error,
    })
    
    const {userName,email,password} = data;

    const userExists=await User.findOne({
        $or:[{userName,},{email}]
    })
    // console.log(userExists)
    if(userExists){
        throw new ApiError(409,"User already exist")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    const userCreated=await User.create({
        userName,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        password
    })
    if(!userCreated){
        throw new ApiError(500,"Something went wrong at Database")
    }
    res.status(201).json({
        message: "User registered successfully",
        user: { userName, email },
    })
        
})

export const login=asyncHandler(async (req,res) => {
    const {success,data,error}=signInSchema.safeParse(req.body)
    if(!success){
        throw new ApiError(400, "Invalid input",error)
    }

    const {userName,email,password}=data;

    const user=await User.findOne({
        $or:[{userName},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    const userId=user._id
    const {accessToken,refreshToken}=await generateAccessAndrefreshToken(userId)

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        {user:{userName,email}},
        {msg:"User logged in successfully"},
        {token:{refreshToken,accessToken}},
    )

})

export const logoutUser=asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },{
        new:true
    })

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({
        msg:"User loggedOut SuccessFully",
    })
})

export const refreshAccessToken=asyncHandler(async (req,res) => {
    const incomingRefreshToken=req.cookie?.refreshToken||req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized")
    }
try {
        const decoded=jwt.verify(incomingRefreshToken,process.env.Refresh_Token_Secret)
        // if(!(decoded&&decoded._id)){
        //     throw new ApiError(401,"Invalid token")
        // }
        const user=await User.findById(decoded._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh Token is not valid")
        }
    
        const newToken=generateAccessAndrefreshToken(decoded._id)
    
        const {accessToken,refreshToken}=newToken
        
        const options={
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            {user:{userName,email}},
            {msg:"User logged in successfully"},
            {token:{refreshToken,accessToken}},
        )
} catch (error) {
    throw new ApiError(400,error)
}

})

export const changeCurrentPassword=asyncHandler(async (req,res) => {
    const {newPassword,oldPassword}=req.body
    const user=await User.findById(req.user?._id) 
    const isPasswordCorrect=user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(409,"Invalid Password")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    res.status(200).json({
        msg:"Your passowrd changed successfully"
    })
})

export const getCurrentUser=asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json({
        user:req.user,
        msg:"current user fetched successfully"
    })
})

export const updateAccountDetails=asyncHandler(async (req,res) => {
    const {fullNAme,email}=req.body

    if(!fullNAme||!email){
        throw new ApiError(409,"Fill the details")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName:fullNAme,
            email:email
        },
    },{
        new:true
    }
).select("-password")

return res.status(200)
.json({
    user:user,
    msg:"Account details updated successfully"
})
})

export const updateUserAvatar=asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        {
            user

        }, {
            msg:"Avatar image updated successfully"
        }
    )
})

export const updateUserCoverImage=asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    //TODO: delete old image - assignment

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        {
            user
        },{
            msg:"coverImage image updated successfully"
        }
    )
})
// complete using video 18 and from 32 min