export function requireAdmin(req, _res, next) {
    if (req.userRole !== "admin") {
        const err = new Error("Admin access required");
        err.statusCode = 403;
        next(err);
        return;
    }
    next();
}
//# sourceMappingURL=requireAdmin.js.map