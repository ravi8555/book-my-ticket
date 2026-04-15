import express from 'express'
import {authenticationMiddleware, restrictUnAuthUser} from '../middleware/auth.middleware.js'

// import validate from '../dto/validate.dto.middleware.js'
import AuthController from '../controller/auth.controller.js'

const authenticationController = new AuthController()

export const authRouter = express.Router()

// authRouter.post('/sign-up', validate(registerUserDto), authenticationController.handleSignup.bind(authenticationController))
authRouter.post('/sign-up', authenticationController.handleSignup.bind(authenticationController))
authRouter.post('/sign-in', authenticationController.handleLogin.bind(authenticationController))
authRouter.get("/verify-email", authenticationController.verifyEmail.bind(authenticationController));
authRouter.post('/refresh-token', authenticationController.refreshToken.bind(authenticationController))
authRouter.post('/resend-verification', authenticationController.resendVerification.bind(authenticationController));

authRouter.get('/me', authenticationMiddleware,restrictUnAuthUser,authenticationController.handleMe.bind(authenticationController))
// authRouter.post('/logout', authenticationMiddleware,restrictUnAuthUser, authenticationController.handleLogout.bind(authenticationController))

authRouter.post('/logout', authenticationController.handleLogout.bind(authenticationController))
authRouter.post('/forgot-password', authenticationController.handleForgot.bind(authenticationController));
authRouter.post('/reset-password', authenticationController.handleResetPass.bind(authenticationController));