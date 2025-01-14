import mongoose from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
//done
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} =tweetSchema.safeParse(req.body)

    if(!content){
        throw new ApiError(400,"Write some tweet")
    }
    //middleware
    const owner=req.user;
    const tweetCreate=await Tweet.create({
        owner:owner._id,
        content:content
    })

    if(!tweetCreate){
        throw new ApiError(500,"tweet not uploaded")
    }
    res.status(200).json(
        new ApiResponse(200,"tweet uploaded")
    )
})
//done
const getUserTweets = asyncHandler(async (req, res) => {
    const owner=req.params;

    if (!owner) {
        throw new ApiError(400, "User ID is required");
    }

    const userTweets=await Tweet.find({owner}).sort({createdAt:-1})

    if (userTweets.length === 0) {
        throw new ApiError(404, "No tweets found for the given user");
    }

    return res.status(200).json(
        new ApiResponse(200, userTweets, "Tweets retrieved successfully")
    );

})
//done
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {content}=req.body

    if(!tweetId || !content){
        throw new ApiError(400,"Tweet and Content are required")
    }

    const tweet=await Tweet.findById(tweetId)
    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorized to update this tweet")
    }
    tweet.content=content;
    await tweet.save();

    // Send response
    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
})
//done
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params

    if(!tweetId){
        throw new ApiError(400,"Tweet Id is required")
    }
    const tweet=await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorized to update this tweet")
    }
    const deleteTweet=await tweet.deleteOne();

    res.status(200).json(
        new ApiResponse(200,deleteTweet,"Tweet got deleted")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
