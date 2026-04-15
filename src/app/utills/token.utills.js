import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import 'dotenv/config';

export class TokenUtills {
    static generateAccessToken(payload){
        return jwt.sign(payload, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_IN,
            algorithm: 'HS256'
        })
    }
    static verifyAccessToken(token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded
        } catch (error) {
            console.error("Token verification failed", error);
            return null
        }
    }
    static generateRefreshToken(payload){
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{
            expiresIn : process.env.JWT_REFRESH_EXPIRES_IN
        })
    }
    static verifyRefreshToken(token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return decoded
        } catch (error) {
            console.error("Refresh token verifiaction failed", error)
            return null
        }
    }
    static generateResetToken(){
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        return{rawToken, hashedToken}
    }

    static hashToken(token) {
        return crypto.createHash('sha256') 
            .update(token)
            .digest('hex');
    }
}