import express from "express"
import { getUserById, getUsers, Login, requestOtp, Signup, verifyOtp } from "../controllers/authController.js";


const authRouter = express.Router();

authRouter.post('/signup',Signup)
authRouter.post('/login',Login)
authRouter.get('/',getUsers)
authRouter.get('/:id',getUserById)
authRouter.post("/otp-login/request-otp", requestOtp);
authRouter.post("/otp-login/verify-otp", verifyOtp);

export default authRouter;