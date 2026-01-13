import jwt from "jsonwebtoken";
import {userTokenSchema} from "../validations/token.validation"

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateUserToken =  (payload) => {
    const validationResult = userTokenSchema.safeParse(payload);

    if(validationResult.error) {
        throw new Error(validationResult.error.message);
    }
    const payloadValidatedData = validationResult.data;
    const token = jwt.sign(payloadValidatedData, JWT_SECRET);
    return token;
};

export const validateUserToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // const validationResult = userTokenSchema.safeParse(decoded);
        // if(validationResult.error) {
        //     throw new Error(validationResult.error.message);
        // }
        return decoded;
    } catch (error) {
        throw new Error((error as Error)?.message ?? "Invalid or expired token");
    }
}