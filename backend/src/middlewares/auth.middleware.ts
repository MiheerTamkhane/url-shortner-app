import { Request, Response, NextFunction } from "express";
import { validateUserToken } from "../utils/token";


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // If there is no Authorization header, skip auth and move to next handler
    // (used for public routes like login/signup)
    if (!authHeader) {
        return next();
    }

    // If header is present but malformed, block the request
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "Invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = validateUserToken(token);
    req.user = payload;
    return next();
};

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user?.id) {
        return res.status(401).json({ error: "You must be logged in to access this resource" });
    }
    return next();
}

export { authenticate, ensureAuthenticated };