import jwt from "jsonwebtoken";
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        const err = new Error("Authentication required");
        err.statusCode = 401;
        next(err);
        return;
    }
    try {
        const token = header.slice(7);
        const secret = process.env["JWT_SECRET"];
        if (!secret)
            throw new Error("JWT_SECRET is not configured");
        const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
        req.userId = payload.userId;
        if (payload.role !== undefined) {
            req.userRole = payload.role;
        }
        next();
    }
    catch {
        const err = new Error("Invalid or expired token");
        err.statusCode = 401;
        next(err);
    }
}
//# sourceMappingURL=requireAuth.js.map