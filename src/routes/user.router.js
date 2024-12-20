import { Router } from "express";
import {login, logoutUser, refreshAccessToken, register} from "../controllers/users.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/signUp").post(register)
router.route("/signIn").post(login)
router.route("/Logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)

export default router