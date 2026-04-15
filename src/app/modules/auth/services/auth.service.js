import { eq } from 'drizzle-orm';
import {db} from '../../../db/index.js'
import { users } from '../../../db/schema.js' 
import ApiError from '../../../utills/api-error.js';
import { PasswordUtills } from '../../../utills/password.utils.js';
import { TokenUtills } from '../../../utills/token.utills.js';
import  { EmailUtils } from '../../../utills/email.utills.js'

class AuthService{
    async registerUserService (userData){
        const {name, email, password, role} = userData;

        // check if user already exits
        const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
        
        if(existingUser.length > 0){
            throw ApiError.conflict(`User with email ${email} already exits`)
        }

        // generate the salt and hash
        const generatedSalt = PasswordUtills.generateSalt()
        const hashPassword = PasswordUtills.hashPassword(password, generatedSalt)

        //generate verification token
        const verificationToken = TokenUtills.generateResetToken()
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // create user
        const [newUser] = await db
            .insert(users)
            .values({
                name : name,
                email : email,
                password : hashPassword,
                salt: generatedSalt,
                role : role || "customer",
                isVerified : false,
                verificationToken : verificationToken.hashedToken,
                verificationTokenExpires : tokenExpiry
            }).returning({
                id: users.id,
                name: users.name,
                email : users.email,
                role : users.role
            });
            // send verification mail 
            EmailUtils.sendVerificationEmail(email, verificationToken.rawToken, name)
            .catch(error => console.error("Failed to send verification mail", error)
            )

            return{
                id : newUser.id,
                name : newUser.name,
                email : newUser.email,
                role : newUser.role
            }


    }
    async verifyEmailToken (token){
        if(!token){
          throw  ApiError.badRequest('Verification token required')
        }

        const hashedToken = TokenUtills.hashToken(token);

        // find user with matching token
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.verificationToken, hashedToken))
            .limit(1)

    if(!user){
        throw ApiError.badRequest('Invalid or expired verification token')
    }        
    // check of token expired 
    if(user.verificationTokenExpires && new Date() > user.verificationTokenExpires  ) {
        throw ApiError.badRequest("Verification token has expired. Please request a new one.")
    }   

    //check if already verify
    if(user.isVerified){
        throw ApiError.badRequest('Email already verified')
    }

    // Mark user as verified
    await db
    .update(users)
    .set({
        isVerified : true,
        verificationToken : null,
        verificationTokenExpires :null,
        updatedAt: new Date()
    })
    .where(eq(users.id, user.id))

    // send success mail
    EmailUtils.sendVerificationSuccessEmail(user.email, user.name)
    .catch(error => console.error("Failed to send success email:", error))

    return {success: true}
    
    }

    async resendVerificationEmail(email){
        if(!email){
            throw ApiError.badRequest('Email is required')
        }

        // find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
            if(!user){
                throw ApiError.notfound('User not found')
            }

        if(user.isVerified){
            throw ApiError.badRequest('Email already verified')
        }

        // generate new verification token
        const verificationToken = TokenUtills.generateResetToken();
        const tokenExpiry =  new Date( Date.now() + 15 * 60 *1000) 

        // update user with new token
        await db
        .update(users)
        .set({
            verificationToken: verificationToken.hashedToken,
            verificationTokenExpires : tokenExpiry,
            updatedAt : new Date()
        })
        .where(eq(users.id, user.id))

        //  send new verification email
        await EmailUtils.sendVerificationEmail(email, verificationToken.rawToken, user.name)

        return {success :true}
    }

    async loginUser(credentials){
        const {email, password} = credentials;

        // find user by email
        const [user] = await db
            .select({
            id: users.id,
            name: users.name,
            email: users.email,
            password: users.password,
            salt: users.salt,        
            role: users.role,
            isVerified: users.isVerified,
            refreshToken: users.refreshToken
        })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if(!user){
            throw ApiError.unauthorized('Invalid email or password')
        }

        // check if email is verified
        if(!user.isVerified){
            throw ApiError.unauthorized("Please verify your email before logging in")
        }

        // verfied password
        if(!user.salt){
            throw ApiError.internal("User account is corrupted. Please contact support.")
        }

        const hashPassword = PasswordUtills.hashPassword(password, user.salt)
        if(user.password !== hashPassword){
            throw ApiError.unauthorized("Invalid email or password");
        }

        // generateToken
        const payload = {id: user.id, email:user.email, role:user.role}
        const accessToken = TokenUtills.generateAccessToken(payload)
        const refreshToken = TokenUtills.generateRefreshToken(payload)

        // store refreshToken In Db
        await db
            .update(users)
            .set({
                refreshToken : refreshToken,
                updatedAt : new Date()
            })
            .where(eq(users.id, user.id))

        return {
            accessToken,
            refreshToken,
            user :{
                id: user.id,
                name : user.name,
                email :user.email,
                role : user.role
            }
        }



    }

    async refreshAccessToken(refreshToken){
        if(!refreshToken){
            throw ApiError.unauthorized("Refresh token required");            
        }
        const decoded =  TokenUtills.verifyRefreshToken(refreshToken);
        if(!decoded){
            throw ApiError.unauthorized('Invalid or expired refresh token');            
        }
        // find user with matching refreshTOkne
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.id))
            .limit(1);
        if(!user || user.refreshToken !== refreshToken){
            throw ApiError.unauthorized("Invalid refresh token")
        }

        // gemerate new tokens
        const payload = {id: user.id, email: user.email, role:user.email}
        const newAccessToken = TokenUtills.generateAccessToken(payload)
        const newRefreshToken = TokenUtills.generateRefreshToken(payload)

        // update new RefrshToEn in DB

        await db
            .update(users)
            .set({
                refreshToken: newRefreshToken,
                updatedAt : new Date()

            })
            .where(eq(users.id, user.id));
            return {
                accessToken: newAccessToken,
                newRefreshToken
            };


    }

    async logoutUser(refreshToken){
        if(!refreshToken){
            return
        }

        const decoded = TokenUtills.verifyRefreshToken(refreshToken);
        if(decoded && decoded.id){
            await db
                .update(users)
                .set({
                    refreshToken : null,
                    updatedAt: new Date()
                })
                .where(eq(users.id, decoded.id))
        }
    }

    async getUserById(userId){
        const [user] = await db
            .select({
                id: users.id,
                name : users.name,
                email:users.email,
                role : users.role,
                isVerified:false,
                createdAt: new Date()
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

    if(!user){
        throw ApiError.notfound('User not found')
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
    }
    }
    async forgotPassword(email){
        if(!email){
            throw ApiError.badRequest('Email not exists')
        }

        // find user by email
        const [user] = await db 
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)
        if(!user){
            // Don't reveal that user doesn't exist for security
            return { success: true, message: "If email exists, reset link sent" };
        }

        // Generate reset token
        const resetToken = TokenUtills.generateResetToken();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // save token to DB
        await db
            .update(users)
            .set({
                resetPasswordToken: resetToken.hashedToken,
                resetPasswordExpires:tokenExpiry,
                updatedAt : new Date()
            })
            .where(eq(users.id, user.id))

        // Send reset email
    const resetUrl = `http://localhost:8080/reset-password?token=${resetToken.rawToken}`;
   
   // Make sure it's like this:
    await EmailUtils.sendPasswordResetEmail(user.email, resetUrl, user.name)
    .catch(error => console.error("Failed to send reset email:", error));

    return { success: true, message: "Password reset link sent to your email" };

    }

    async resetPassword(token, newPassword) {
    if (!token) {
        throw ApiError.badRequest('Reset token is required');
    }

    const hashedToken = TokenUtills.hashToken(token);
    console.log("Looking for token:", hashedToken);  // Debug

    // Find user with valid token
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetPasswordToken, hashedToken))
        .limit(1);

    if (!user) {
        console.log("No user found with that token");
        throw ApiError.badRequest('Invalid or expired reset token');
    }

    console.log("User found:", user.email);
    console.log("Token expiry:", user.resetPasswordExpires);

    // Check if token expired
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
        throw ApiError.badRequest('Reset token has expired. Please request a new one.');
    }

    // Generate new salt and hash for new password
    const salt = PasswordUtills.generateSalt();
    const hashedPassword = PasswordUtills.hashPassword(newPassword, salt);

    console.log("Updating password for user:", user.id);

    // Update user's password and clear reset token
    await db
        .update(users)
        .set({
            password: hashedPassword,
            salt: salt,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

    return { success: true, message: "Password reset successfully" };
}

}
export default new AuthService() 