import ApiError from '../../../utills/api-error.js';
import AuthService from '../services/auth.service.js';
import { registerUserDto, loginUserDto, forgotPasswordDto, resetPasswordDto } from '../dto/auth.dto.js';

class AuthController{
    async handleSignup(req, res, next){
        try {
            const validationResult = registerUserDto.safeParse(req.body);
            if(!validationResult.success){
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    error : validationResult.error.errors
                })
            }

            const result = await AuthService.registerUserService(validationResult.data)
            return res.status(201).json({
                success : true,
                message: 'User registered successfully. Please check your email for verification.',
                data:result
            })
        } catch (error) {
            if(error instanceof ApiError){
                return res.status(error.statuscode).json({
                    success: false,
                    message: error.message
                })
            }   
            console.error("Register controller errro", error)
            return res.status(500).json({
                success :false,
                message : 'Internal Server Error'
            })      
        }        
    }

    async verifyEmail (req, res, next){
        try {
            const {token} = req.query
            if(!token || typeof token !== 'string'){
                return res.status(400).json({
                    success: false,
                    message : 'Verification token is required'
                })
            }

            await AuthService.verifyEmailToken(token)
            return res.status(200).json({
                success:true,
                message : "Email verified successfully! you can log in"
            })
        } catch (error) {
            if(error instanceof ApiError){
                return res.status(error.statuscode).json({
                    success: false,
                    message: error.message
                })
            }
            console.error("Email verification controller error:", error);
            return res.status(500).json({
               success:false,
               message : 'Internal Server error'
            })
        }

    }

    async resendVerification(req,res,next){
        try {
            const {email} = req.body;
            if(!email){
                res.status(400).json({
                    success: false,
                    message :"Email is required"
                })
            }
            await AuthService.resendVerificationEmail(email)
            return res.status(200).json({
                success:true,
                message : 'Verification email resent successfully. Please check your inbox.'
            });

        } catch (error) {
            if(error instanceof ApiError){
                return res.status(error.statuscode).json({
                    success: false,
                    message: error.message
                })
            }
            console.error("Resend verification controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async handleLogin(req, res, next) {
    try {
        const validationResult = loginUserDto.safeParse(req.body);
        if(!validationResult.success){
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: validationResult.error.errors
            })
        }
        
        const { accessToken, refreshToken, user } = await AuthService.loginUser(validationResult.data)

        // Set BOTH tokens as HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000  // 15 minutes
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        });

        // Don't send accessToken in response body
        return res.status(200).json({
            success: true,
            message: 'Login Successfully',
            data: { user }
        })
    } catch (error) {
         if (error instanceof ApiError) {
        return res.status(error.statuscode).json({
          success: false,
          message: error.message
        });
      }
      console.error("Login controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
}

    async refreshToken(req, res, next){
        try {
            const {refreshToken} = req.cookies;
            
            if(!refreshToken){
                throw ApiError.unauthorized("Refresh token not provided")
            } 

            const {accessToken, newRefreshToken  } = AuthService.refreshAccessToken(refreshToken)
            if(newRefreshToken){
                res.cookie('refreshToken', newRefreshToken,{
                    httpOnly :true,
                    secure : process.env.NODE_ENV = "production",
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })                
            }
            return res.status(200).json({
                success:true,
                data:{accessToken}
            })


        } catch (error) {
            if (error instanceof ApiError) {
        return res.status(error.statuscode).json({
          success: false,
          message: error.message
        });
      }
      console.error("Refresh token controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
        }
    }

   async handleLogout(req, res, next){
    try {
        // Get refresh token from cookie
        const { refreshToken } = req.cookies;
        
        if(refreshToken){
            await AuthService.logoutUser(refreshToken)
        }

        // Clear both cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');  // Also clear access token cookie
        
        return res.status(200).json({
            success: true,
            message: 'Logout successfully'
        })
    } catch (error) {
        console.error("Logout controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
    async handleMe (req, res, next){
       try {
        const userId = req.user?.id

       if(!userId){
        throw ApiError.unauthorized('User not authenticated')
       }

       const user = await AuthService.getUserById(userId);

       res.status(200).json({
        success:true,
        data:user
       })
       } catch (error) {
        if(error instanceof ApiError){
            return res.status(error.statuscode).json({
                success:false,
                message :error.message
            })
        }
        console.error("Get me controller error", error)
        return res.status(500).json({
            success:false,
            message: "Internal server error"
        })
       }
    }

    async handleForgot(req,res,next){
        try {
            
       
        const validationResult = forgotPasswordDto.safeParse(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.errors
            });
        }
        const result = await AuthService.forgotPassword(validationResult.data.email)

        return res.status(200).json({
            success: true,
            message: result.message
        });
         } catch (error) {
            if (error instanceof ApiError) {
            return res.status(error.statuscode).json({
                success: false,
                message: error.message
            });
        }
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        }
    }

    async handleResetPass (req, res,next){

        try {
            
        const validationResult = resetPasswordDto.safeParse(req.body)

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.errors
            });
        }

        const {token, password} = validationResult.data;
        const result = AuthService.resetPassword(token, password)
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statuscode).json({
                success: false,
                message: error.message
            });
        }
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
     }
    





}
export default AuthController

