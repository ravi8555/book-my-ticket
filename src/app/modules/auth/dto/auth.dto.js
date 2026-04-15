import { z } from "zod";
export const registerUserDto = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, "Name cannot exceed 50 characters")
        .trim(),
    email :z.string()
        .email("Invalid email format")
        .toLowerCase()
        .trim(),     
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
        role: z.enum(["customer", "seller", "admin"]).default("customer"),
    role: z.enum(["customer", "seller", "admin"]).default("customer")
}) 

export const loginUserDto = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string()
}) 

export const forgotPasswordDto = z.object({
    email: z.string().email("Invalid email format").toLowerCase().trim()
});

export const resetPasswordDto = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
