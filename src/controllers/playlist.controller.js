import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//done
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400,"Name and description are required")
    }
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    res.status(200).json(
        new ApiResponse(200,playlist,"Playlist created")
    )
})
//done
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"userId is required")
    }
    if(userId.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to view this user's playlists")
    }
    const playlists= await Playlist.find({owner:"userId"}).select("name description createdAt");

    if (playlists.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "No playlists found for this user")
        );
    }
    
    res.status(200).json(
        new ApiResponse(200,playlists,"Playlist found")
    )
})
//done
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"playlistId is required")
    }
    const playlist=await Playlist.findById(playlistId).select("name description createdAt");
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to view this user's playlists")
    }
    res.status(200).json(
        new ApiResponse(200,playlist,"Playlist found")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"videoId and playlistId are required")
    }
    const playlist=await Playlist.findById(playlistId)

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to view this user's playlists")
    }
    //chatgpt
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    } else {
        throw new ApiError(400, "Video is already in the playlist");
    }

    res.status.json(
        new ApiResponse(200,playlist,"Video add successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    
    if(!playlistId || !videoId){
        throw new ApiError(400,"videoId and playlistId are required")
    }
    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Video not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this playlist")
    }
    const videoExists = playlist.videos.some(
        (video) => video.toString() === videoId.toString()
    );

    if (!videoExists) {
        throw new ApiError(404, "Video not found in the playlist");
    }

    // Remove the video using filter
    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId.toString()
    );

    // Save the updated playlist
    await playlist.save()
    res.status(200).json(
        new ApiResponse(200,playlist,"Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId ){
        throw new ApiError(400,"playlistId is required")
    }
    const playlist=await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to view this user's playlists")
    }

    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json(
        new ApiResponse(200,null,"Playlist removed successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId ){
        throw new ApiError(400,"playlistId is required")
    }
    if(!name && !description){
        throw new ApiError(400,"At least one field (name or description) must be provided to update the playlist")
    }
    const playlist=await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const updatedFields={}
    if(name) updatedFields.name=name;
    if(description) updatedFields.description=description;

    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{
        $set:updatedFields
    },{new:true}).select("name description createdAt")

    res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
