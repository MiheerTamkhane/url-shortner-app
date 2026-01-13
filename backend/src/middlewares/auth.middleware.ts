import { Request, Response, NextFunction } from "express";
import { validateUserToken } from "../utils/token";


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next()
    }
    if(!authHeader?.startsWith("Bearer")) {
        return res.status(400).json({ error: "Invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const payload = validateUserToken(token);

    req.user = payload;
    next();
};

export { authenticate };