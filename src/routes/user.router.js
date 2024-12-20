import { Router } from "express";
import {changeCurrentPassword, getCurrentUser, login, logoutUser, refreshAccessToken, register, updateAccountDetails} from "../controllers/users.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/signUp").post(register)
router.route("/signIn").post(login)
router.route("/Logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword)
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
router.route("/updateAccountDetails").post(verifyJWT,updateAccountDetails)

export default router