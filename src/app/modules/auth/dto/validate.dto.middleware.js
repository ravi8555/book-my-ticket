import ApiError from "../../../utills/api-error.js";

// const validate = (DtoClass)=>{
//     return (req, res,next) =>{
//         const {errors, value} = DtoClass.validate(req.body);
//         if(errors){
//             throw ApiError.badRequest(errors.join('; '))
//         }
//         req.body = value
//         next()
//     }
// }

const validate = (schema) => {  // Changed from DtoClass to schema
    return (req, res, next) => {
        const result = schema.safeParse(req.body);  // Use Zod's safeParse
        if (!result.success) {
            const errors = result.error.errors.map(err => err.message).join('; ');
            throw ApiError.badRequest(errors);
        }
        req.body = result.data;
        next();
    }
}
export default validate