import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
//done
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;  
    const { page = 1, limit = 10 } = req.query;  

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const skip = (page - 1) * limit;
    const commentsLimit = parseInt(limit);

    const allComments = await Comment.aggregate([
        {
            $match: {
                video: videoId,  
            }
        },
        {
            $project: {
                content: 1,  
                owner: 1,    
                createdAt: 1, 
            }
        },
        {
            $skip: skip,  
        },
        {
            $limit: commentsLimit,
        }
    ]);

    // If no comments are found
    if (allComments.length === 0) {
        return res.status(404).json({
            message: "No comments found for this video",
        });
    }

    // Respond with the fetched comments
    res.status(200).json({
        message: "Comments fetched successfully",
        comments: allComments,
    });
});
//done
const addComment = asyncHandler(async (req, res) => {  //middleware is required
    // TODO: add a comment to a video
    const {comment}=req.body;
    const {videoId}=req.params;

    if(!comment || !videoId){
        throw new ApiError(400,"Comment and videoId are required")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found") 
    }

    const newComment=await Comment.create({
        content:comment,
        owner:req.user._id,
        video:video._id
    })

    res.status(201).json(
        new ApiResponse(201,newComment, "Comment added successfully")
    );
})
//done
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params; // Extract comment_id from the route
    const { content } = req.body;
    if(!content || !commentId){
        throw new ApiError(400,"Both fields are required")
    }
    const comment=Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are not authorized")
    }

    comment.content=content;
    await comment.save({validateBeforeSave:true})

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
})
//done
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    if(!commentId){
        throw new ApiError(400,"commentId is required")
    }
    const comment=Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are not authorized")
    }

    const deletedComment=await comment.remove();

    // Send success response
    res.status(200).json(
        new ApiResponse(200,deletedComment._id,"Comment deleted successfully") 
    );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
