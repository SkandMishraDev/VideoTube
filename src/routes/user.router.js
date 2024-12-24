import { Router } from "express";
import {changeCurrentPassword, getCurrentUser, login, logoutUser, refreshAccessToken, register, updateAccountDetails,updateUserAvatar,updateUserCoverImage} from "../controllers/users.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router=Router();

router.route("/signUp").post(
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),
register
)
router.route("/signIn").post(login)
router.route("/Logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword)
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
router.route("/updateAccountDetails").post(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

export default router