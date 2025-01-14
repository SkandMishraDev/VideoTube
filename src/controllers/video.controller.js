import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs from "fs"

//wrong
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const skip=(page-1)*limit;
    const Videolimit =parseInt(limit);
    const allVideo=await Video.find(
            { $text: { $search: query } },
            { title: 1, description: 1, score: { $meta: "textScore" } },
            {
                $skip: skip,  // Skip the appropriate number of documents for pagination
            },
            {
                $limit: Videolimit,  // Limit the number of comments per page
            }
          ).sort({ score: { $meta: "textScore" }})

          res.status(200).json(
            new ApiResponse(200,allVideo,"All video according to your search")
          )
})
//done
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} =req.body
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    const videoLocalPath=req.files?.videoFile[0]?.path;

    if (!thumbnailLocalPath || !videoLocalPath) {
        throw new ApiError(400, "Thumbnail and videoFile are required")
    }

    if (!title || !description) {
        fs.unlinkSync(thumbnailLocalPath)
        fs.unlinkSync(videoLocalPath)
        throw new ApiError(400, "description and title are required")
    }
 
    const thumbnail=uploadOnCloudinary(thumbnailLocalPath)
    const videoFile=uploadOnCloudinary(videoLocalPath)

    if(!thumbnail || !videoFile){
        throw new ApiError(400, "Thumbnail and videoFile are required")
    }
//using jwt to verify the owner of video
    const owner=req.user._id
//how to get duration,views,isPublised from cloudinary?
    const videoUploaded= await Video.create({
        title,
        description,
        thumbnail:thumbnail.url,
        videoFile:videoFile.url,
        owner:owner
    })
    res.status(200).json(
        new ApiResponse(200,videoUploaded,"Video successfully updated")
    )
})
//done
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"Video id not found")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"No such video found")
    }

    return res.status(200).json(
        new ApiResponse(201,video,"Video found")
    )
})
//done
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"Video id not found")
    }
    
    const video=await Video.findById(videoId);

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    let thumbnailLocalPath;

    if (req.files && Array.isArray(req.file.thumbnail) && req.file.thumbnail.length > 0) {
        thumbnailLocalPath = req.file.thumbnail[0].path
    }

    if(!title && !description && !(req.file?.thumbnail)){
        fs.unlinkSync(thumbnailLocalPath)
        throw new ApiError(400,"Please provide atleast one field to update")
    }
    
    const thumbnail=uploadOnCloudinary(thumbnailLocalPath)
//how i will know which thing to update 
    const updateFields={};
    if(title) updateFields.title=title;
    if(description) updateFields.description=description;
    if(thumbnail) updateFields.thumbnail=thumbnail.url;
 
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        $set:updateFields
    },{new:true})

    res.status(200).json(
        new ApiResponse(200,updatedVideo,"Video updated")
    )

})
//done
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video=await Video.findById(videoId);

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const deletedVideo = await video.remove();

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedVideo._id, "Video successfully deleted")
    )
});
//done
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(200,"You are not authenticated")
    }
    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video publish status toggled to ${video.isPublished ? "published" : "unpublished"}`)
    );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
