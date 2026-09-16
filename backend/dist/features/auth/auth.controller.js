import { registerSchema, loginSchema } from "./auth.validation.js";
import { registerUser, loginUser } from "./auth.service.js";
export async function register(req, res, next) {
    try {
        const data = registerSchema.parse(req.body);
        const result = await registerUser(data.name, data.email, data.password);
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const data = loginSchema.parse(req.body);
        const result = await loginUser(data.email, data.password);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map