import { TokenUtills } from "../../../utills/token.utills.js";

export function authenticationMiddleware(req, res, next){
       try {
        // Read access token from cookie instead of header
        const token = req.cookies.accessToken;
        
        if(!token){
            return res.status(401).json({
                error: 'Authentication Required',
                message: 'No token provided'
            })
        }

        const user = TokenUtills.verifyAccessToken(token)
        if(!user){
            return res.status(401).json({
                error: 'Authentication Required',
                message: "Invalid user or Token expired"
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}
export function restrictUnAuthUser(req, res, next){
    
        if(!req.user) return res.status(401).json({
            error :'Authentication Required'
        })
        return next()
}