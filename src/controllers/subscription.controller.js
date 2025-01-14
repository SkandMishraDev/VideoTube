import mongoose  from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

})
//done
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!channelId){
        throw new ApiError(400,"channelId is required")
    }

    if(channelId.toString()!==req.user._id.toString()){
        throw new ApiError(400,"You are Authenticated")
    }

    const TotalSubcriber=await Subscription.aggregate([
        {
            $match:{
                channel:channelId
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
              }
        },{
            $unwind: "$subscribedTo", 
        },{
            $project:{
                username : 1,
                Avatar:1
            }
        }
    ])
    res.status(200).json(
        ApiResponse(200,TotalSubcriber)
    )
})
//done
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if(!subscriberId){
        throw new ApiError(400,"SubscriberId is required")
    }

    if(subscriberId.toString()!==req.user._id.toString()){
        throw new ApiError(400,"You are Authenticated")
    }

    const SubscriberTo=await Subscription.aggregate([
        {
            $match:{
                "subscriber":"subscriberId"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo"
              }
        }, {
            $unwind: "$subscribedTo", 
        },
        {
            $project: {
                username: "$subscribedTo.userName",
                avatar: "$subscribedTo.avatar", 
            },
        }
    ])

    res.status(200).json(
        ApiResponse(200,SubscriberTo)
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}