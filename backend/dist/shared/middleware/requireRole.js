export function requireRole(role) {
    return (req, _res, next) => {
        if (req.userRole !== role) {
            const err = new Error("Forbidden");
            err.statusCode = 403;
            next(err);
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map