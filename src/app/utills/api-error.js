// Error extends from node default 
class ApiError extends Error{
    constructor(statuscode, message){
        super(message),
        this.statuscode = statuscode,
        this.isOperational = true,
        Error.captureStackTrace(this, this.constructor)
    }
    static badRequest(message = "Bad Request"){
        return new ApiError(400, message)
    }
    static unauthorized(message = "Unauthorized"){
        return new ApiError(401, message)
    }
    static conflict(message = "Conflict"){
        return new ApiError(409, message)
    }
    static forbidden(message = "forbidden"){
        return new ApiError(412, message)
    }
    static notfound(message = "not found"){
        return new ApiError(404, message)
    }
    static internal(message = "Internal Server Error"){
        return new ApiError(500, message)
    }
}
export default ApiError